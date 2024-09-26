import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger.json';
import workoutRoutes from './routes/workoutRoutes';
import exerciseRoutes from './routes/exerciseRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

console.log('Backend server starting...');

const uri = process.env.MONGODB_URI || "mongodb+srv://apiclient:8nyvbH334GSZducD@dev-app-eu-west-01.hzjk3.mongodb.net/peakptapp?retryWrites=true&w=majority&appName=dev-app-eu-west-01";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

// Connect to MongoDB
// if NODE_ENV is development then
if (process.env.NODE_ENV === 'development') {
  mongoose.connect(process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/peakptdb')
  .then(() => console.log('Connected to MongoDB through local docker container'))
  .catch((err) => console.error('MongoDB connection error:', err));
}
else {
  connectToBetaDatabase();
}
// Routes
app.use(['/docs', '/api-docs'], swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exerciseRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start the server only after successfully connecting to the database
mongoose.connection.once('open', () => {
  app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
  });
});

// Handle database connection errors
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

async function connectToBetaDatabase() {
  try {
    await mongoose.connect(uri, clientOptions);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}