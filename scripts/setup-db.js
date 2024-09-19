const { exec } = require('child_process');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const DOCKER_CONTAINER_NAME = 'peakpt-mongodb';
const MONGODB_PORT = 27017;
const MONGODB_DATABASE = 'peakptdb';

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
  const uri = `mongodb://localhost:${MONGODB_PORT}/${MONGODB_DATABASE}`;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');

    const db = client.db();

    // Create collection
    await db.createCollection('workouts');
    console.log('Collection created successfully');

    // Create index
    await db.collection('workouts').createIndex({ date: 1 });
    console.log('Index created successfully');

    // Read and insert sample data
    const jsonFilePath = path.join(__dirname, '..', 'data', 'workout-history-db.json');
    console.log('Attempting to read JSON file from:', jsonFilePath);
    
    if (!fs.existsSync(jsonFilePath)) {
      console.error('JSON file not found at:', jsonFilePath);
      process.exit(1);
    }

    const workoutHistoryData = fs.readFileSync(jsonFilePath, 'utf8');
    const workoutHistory = JSON.parse(workoutHistoryData);
    console.log('Successfully parsed JSON data. Number of records:', workoutHistory.length);

    const result = await db.collection('workouts').insertMany(workoutHistory);
    console.log('Sample data inserted successfully. Inserted count:', result.insertedCount);

    // Verify insertion
    const count = await db.collection('workouts').countDocuments();
    console.log('Total documents in workouts collection:', count);

    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

async function main() {
  await setupDocker();
  await setupDatabase();

  console.log('Setup complete!');
}

main().catch(console.error);