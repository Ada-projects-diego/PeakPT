import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger.json';
import workoutRoutes from './routes/workoutRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import { loggingMiddleware, logger } from './middleware/loggingMiddleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(loggingMiddleware);

console.log('Backend server starting...');

// MongoDB connection URI based on NODE_ENV
const uri = process.env.NODE_ENV === 'beta' 
  ? process.env.MONGODB_URI || "mongodb+srv://apiclient:8nyvbH334GSZducD@dev-app-eu-west-01.hzjk3.mongodb.net/peakptapp?retryWrites=true&w=majority&appName=dev-app-eu-west-01"
  : process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/peakptdb';

// Connect to MongoDB
mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check for required collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    logger.info('Collections found:', collectionNames);
    
    if (!collectionNames.includes('workouts') || !collectionNames.includes('exercises')) {
      throw new Error('Required collections "workouts" and "exercises" not found');
    }
    
    // Start the server only after confirming collections
    app.listen(port, () => {
      console.log(`Backend server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use(['/docs', '/api-docs'], swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exerciseRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
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