const mongoose = require('mongoose');
const dotenv = require('dotenv');
const readline = require('readline');

dotenv.config();

const MONGODB_URI = 'mongodb+srv://apiclient:8nyvbH334GSZducD@dev-app-eu-west-01.hzjk3.mongodb.net/peakptdb?retryWrites=true&w=majority&appName=dev-app-eu-west-01';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
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

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully to MongoDB Atlas');

    // Insert exercise data
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
  await setupDatabase();
  console.log('Setup complete!');
}

main().catch(console.error);