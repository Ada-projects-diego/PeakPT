const { exec } = require('child_process');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const readline = require('readline');

dotenv.config();

const DOCKER_CONTAINER_NAME = 'peakpt-mongodb';
const MONGODB_PORT = 27017;
const MONGODB_DATABASE = 'peakptdb';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error && error.code !== 1) {  // Ignore exit code 1 for grep
        console.error(`Error executing command: ${command}`);
        console.error(`stderr: ${stderr}`);
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

async function setupDocker() {
  console.log('Setting up Docker container for MongoDB...');

  try {
    await runCommand('docker info');
  } catch (error) {
    console.error('Docker is not running. Please start Docker and try again.');
    process.exit(1);
  }

  try {
    const containerExists = await runCommand(`docker ps -a --format '{{.Names}}' | grep -q ${DOCKER_CONTAINER_NAME} && echo "exists" || echo "not exists"`);

    if (containerExists === "exists") {
      console.log('MongoDB container already exists. Starting it...');
      await runCommand(`docker start ${DOCKER_CONTAINER_NAME}`);
    } else {
      console.log('Creating and starting MongoDB container...');
      await runCommand(`docker run -d --name ${DOCKER_CONTAINER_NAME} -p ${MONGODB_PORT}:27017 mongo:latest`);
    }

    console.log('Waiting for MongoDB to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('MongoDB container is ready.');
  } catch (error) {
    console.error('Error setting up Docker:', error);
    process.exit(1);
  }
}

// Define Mongoose schemas
const SetSchema = new mongoose.Schema({
  reps: { type: Number, required: true },
  weight: { type: Number, required: true }
}, { _id: false });

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: [SetSchema]
});

const WorkoutSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  name: { type: String, required: true },
  exercises: [ExerciseSchema]
});

const Exercise = mongoose.model('Exercise', ExerciseSchema);
const Workout = mongoose.model('Workout', WorkoutSchema);

async function setupDatabase() {
  console.log('Setting up MongoDB database...');
  const uri = `mongodb://localhost:${MONGODB_PORT}/${MONGODB_DATABASE}`;

  try {
    await mongoose.connect(uri);
    console.log('Connected successfully to MongoDB');

    const exerciseData = [
      { name: "Squats" },
      { name: "Deadlifts" },
      { name: "Bench Press" },
      { name: "Overhead Press" },
      { name: "Barbell Row" },
      { name: "Pull up" },
      { name: "Bent Over Row" },
      { name: "Russian Twists" },
      { name: "Rolling Planks" }
    ];
    await Exercise.insertMany(exerciseData);
    console.log('Exercise data inserted successfully');

    // Ask user if they want to add fake past workout history
    const addFakeData = await askQuestion('Add fake past workout history data? (y/n): ');
    
    if (addFakeData.toLowerCase() === 'y') {
      const workoutHistoryData = [
        {
          date: new Date("2024-09-05"),
          name: "Upper body workout",
          exercises: [
            {
              name: "Bent Over Row",
              sets: [
                { reps: 5, weight: 43 },
                { reps: 5, weight: 43 },
                { reps: 5, weight: 43 }
              ]
            },
            {
              name: "Bench Press",
              sets: [
                { reps: 5, weight: 20.5 },
                { reps: 5, weight: 20.5 },
                { reps: 5, weight: 20.5 }
              ]
            },
            {
              name: "Pull up",
              sets: [
                { reps: 5, weight: 0 },
                { reps: 5, weight: 0 },
                { reps: 5, weight: 0 }
              ]
            }
          ]
        },
        {
          date: new Date("2024-09-07"),
          name: "Leg day workout",
          exercises: [
            {
              name: "Squats",
              sets: [
                { reps: 8, weight: 70 },
                { reps: 8, weight: 70 },
                { reps: 8, weight: 70 },
                { reps: 8, weight: 70 }
              ]
            },
            {
              name: "Deadlifts",
              sets: [
                { reps: 5, weight: 85 },
                { reps: 5, weight: 85 },
                { reps: 5, weight: 85 }
              ]
            }
          ]
        },
        {
          date: new Date("2024-09-09"),
          name: "Core workout",
          exercises: [
            {
              name: "Rolling Planks",
              sets: [
                { reps: 1, weight: 0 },
                { reps: 1, weight: 0 },
                { reps: 1, weight: 0 }
              ]
            },
            {
              name: "Russian Twists",
              sets: [
                { reps: 20, weight: 5 },
                { reps: 20, weight: 5 },
                { reps: 20, weight: 5 }
              ]
            }
          ]
        }
      ];

      const result = await Workout.insertMany(workoutHistoryData);
      console.log('Fake workout history data inserted successfully. Inserted count:', result.length);
    }

    // Verify insertion
    const workoutCount = await Workout.countDocuments();
    console.log('Total documents in workouts collection:', workoutCount);
    const exerciseCount = await Exercise.countDocuments();
    console.log('Total documents in exercises collection:', exerciseCount);

    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    rl.close();
  }
}

async function main() {
  await setupDocker();
  await setupDatabase();

  console.log('Setup complete!');
}

main().catch(console.error);