const { exec } = require('child_process');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
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

async function setupDatabase() {
  console.log('Setting up MongoDB database...');
  const uri = `mongodb://localhost:${MONGODB_PORT}/${MONGODB_DATABASE}`;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');

    const db = client.db();

    // Create collections
    await db.createCollection('workouts');
    await db.createCollection('exercises');
    console.log('Collections created successfully');

    // Create index
    await db.collection('workouts').createIndex({ date: 1 });
    console.log('Index created successfully');

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
    await db.collection('exercises').insertMany(exerciseData);
    console.log('Exercise data inserted successfully');

    // Ask user if they want to add fake past workout history
    const addFakeData = await askQuestion('Add fake past workout history data? (y/n): ');
    
    if (addFakeData.toLowerCase() === 'y') {
      const workoutHistoryData = [
        {
          "date": "2024-09-05",
          "name": "Upper body workout",
          "exercises": [
            {
              "id": "1",
              "name": "Bent Over Row",
              "sets": [
                { "id": "f0Q1cKINdD", "reps": 5, "weight": 43 },
                { "id": "N2p3mogb9n", "reps": 5, "weight": 43 },
                { "id": "Q87ulZ8YZq", "reps": 5, "weight": 43 }
              ]
            },
            {
              "id": "2",
              "name": "Bench Press",
              "sets": [
                { "id": "f0Q1cKINdD", "reps": 5, "weight": 20.5 },
                { "id": "N2p3mogb9n", "reps": 5, "weight": 20.5 },
                { "id": "Q87ulZ8YZq", "reps": 5, "weight": 20.5 }
              ]
            },
            {
              "id": "3",
              "name": "Pull up",
              "sets": [
                { "id": "f0Q1cKINdD", "reps": 5, "weight": 0 },
                { "id": "N2p3mogb9n", "reps": 5, "weight": 0 },
                { "id": "Q87ulZ8YZq", "reps": 5, "weight": 0 }
              ]
            }
          ]
        },
        {
          "date": "2024-09-07",
          "name": "Leg day workout",
          "exercises": [
            {
              "id": "1",
              "name": "Squats",
              "sets": [
                { "id": "f0Q1cKINdD", "reps": 8, "weight": 70 },
                { "id": "N2p3mogb9n", "reps": 8, "weight": 70 },
                { "id": "Q87ulZ8YZq", "reps": 8, "weight": 70 },
                { "id": "pVLVJW01Pi", "reps": 8, "weight": 70 }
              ]
            },
            {
              "id": "2",
              "name": "Deadlifts",
              "sets": [
                { "id": "f0Q1cKINdD", "reps": 5, "weight": 85 },
                { "id": "N2p3mogb9n", "reps": 5, "weight": 85 },
                { "id": "Q87ulZ8YZq", "reps": 5, "weight": 85 }
              ]
            }
          ]
        },
        {
          "date": "2024-09-09",
          "name": "Core workout",
          "exercises": [
            {
              "id": "1",
              "name": "Rolling Planks",
              "sets": [
                { "id": "f0Q1cKINdD", "reps": 1, "weight": 0 },
                { "id": "N2p3mogb9n", "reps": 1, "weight": 0 },
                { "id": "Q87ulZ8YZq", "reps": 1, "weight": 0 }
              ]
            },
            {
              "id": "2",
              "name": "Russian Twists",
              "sets": [
                { "id": "f0Q1cKINdD", "reps": 20, "weight": 5 },
                { "id": "N2p3mogb9n", "reps": 20, "weight": 5 },
                { "id": "Q87ulZ8YZq", "reps": 20, "weight": 5 }
              ]
            }
          ]
        }
      ];

      // Parse date strings to Date objects
      const workoutHistory = workoutHistoryData.map(workout => ({
        ...workout,
        date: new Date(workout.date)
      }));

      const result = await db.collection('workouts').insertMany(workoutHistory);
      console.log('Fake workout history data inserted successfully. Inserted count:', result.insertedCount);
    }

    // Verify insertion
    const workoutCount = await db.collection('workouts').countDocuments();
    console.log('Total documents in workouts collection:', workoutCount);
    const exerciseCount = await db.collection('exercises').countDocuments();
    console.log('Total documents in exercises collection:', exerciseCount);

    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await client.close();
    rl.close();
  }
}

async function main() {
  await setupDocker();
  await setupDatabase();

  console.log('Setup complete!');
}

main().catch(console.error);