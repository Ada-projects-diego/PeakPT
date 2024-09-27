import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import Workout, { IWorkout, IExercise, ISet } from '../models/workout';
import { logger } from '../middleware/loggingMiddleware';
import exercise from '../models/exercise';

export const getWorkouts = async (req: Request, res: Response) => {
  try {
    const workouts: IWorkout[] = await Workout.find();
    logger.info('Retrieved all workouts', { count: workouts.length });
    res.json(workouts);
  } catch (error) {
    logger.error('Error fetching workouts', { error });
    res.status(500).json({ message: 'Error fetching workouts' });
  }
};

export const getWorkoutByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      logger.warn('Invalid date format provided', { date });
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // Create start and end of the day in UTC
    const startDate = new Date(date + 'T00:00:00.000Z');
    const endDate = new Date(date + 'T23:59:59.999Z');

    const workout = await Workout.findOne({
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    if (workout) {
      logger.info('Retrieved workout by date', { date, workout });
      res.json(workout);
    } else {
      logger.info('No workout found for date, returning empty workout', { date });
      res.json({ date, name: "", exercises: [] });
    }
  } catch (error) {
    logger.error('Error fetching workout by date', { error, date: req.params.date });
    res.status(500).json({ message: 'Error fetching workout' });
  }
};

export const getExerciseByDateAndName = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const { name } = req.query;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      logger.warn('Invalid date format provided', { date });
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // Create start and end of the day in UTC
    const startDate = new Date(date + 'T00:00:00.000Z');
    const endDate = new Date(date + 'T23:59:59.999Z');

    const workout = await Workout.findOne({
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    if (workout) {
      const exercise = workout.exercises.find(e => e.name.toLowerCase() === (name as string).toLowerCase());
      if (exercise) {
        logger.info('Retrieved exercise by date and name', { date, name, exercise });
        res.json(exercise);
      } else {
        logger.warn('Exercise not found for given date and name', { date, name });
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      logger.warn('Workout not found for given date', { date });
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    logger.error('Error fetching exercise by date and name', { error, date: req.params.date, name: req.query.name });
    res.status(500).json({ message: 'Error fetching exercise' });
  }
}
export const getExerciseByDateAndId = async (req: Request, res: Response) => {
  try {
    const { date, exerciseId } = req.params;
    logger.info('Fetching exercise by date and ID', { date, exerciseId });

    const workoutDate = new Date(date);
    const workout = await Workout.findOne({
      date: {
        $gte: new Date(workoutDate.setHours(0, 0, 0, 0)),
        $lt: new Date(workoutDate.setHours(23, 59, 59, 999))
      }
    });

    if (!workout) {
      logger.warn('Workout not found for the given date', { date });
      return res.status(404).json({ message: 'Workout not found for the given date' });
    }

    logger.debug('Found workout', { workoutId: workout._id, date });

    const exercise = workout.exercises.find(e => e._id.toHexString() === exerciseId);

    if (!exercise) {
      logger.info('Exercise not found, returning empty exercise object', { date, exerciseId });
      return res.json({ _id: exerciseId, name: '', sets: [] });
    }

    logger.info('Successfully retrieved exercise', { date, exerciseId });
    res.json(exercise);
  } catch (error) {
    logger.error('Error fetching exercise by date and ID', { date, exerciseId, error });
    res.status(500).json({ message: 'Error fetching exercise' });
  }
}

export const deleteExerciseByDateAndId = async (req: Request, res: Response) => {
  try {
    const { date, exerciseId } = req.params;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      logger.warn('Invalid date format provided', { date });
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const startDate = new Date(date + 'T00:00:00.000Z');
    const endDate = new Date(date + 'T23:59:59.999Z');

    const workout = await Workout.findOne({
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    if (workout) {
      const exerciseIndex = workout.exercises.findIndex(e => e.id === exerciseId);
      if (exerciseIndex !== -1) {
        workout.exercises.splice(exerciseIndex, 1);
        if (workout.exercises.length === 0) {
          await Workout.deleteOne({ _id: workout._id });
          logger.info('Deleted workout after removing last exercise', { date, exerciseId, workoutId: workout._id });
        } else {
          await workout.save();
          logger.info('Removed exercise from workout', { date, exerciseId, workoutId: workout._id });
        }
        res.status(204).send();
      } else {
        logger.warn('Exercise not found for deletion', { date, exerciseId });
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      logger.warn('Workout not found for exercise deletion', { date });
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    logger.error('Error deleting exercise', { error, date: req.params.date, exerciseId: req.params.exerciseId });
    res.status(500).json({ message: 'Error deleting exercise' });
  }
};

export const deleteExerciseByDateAndName = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const { name } = req.query;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      logger.warn('Invalid date format provided', { date });
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (!name) {
      logger.warn('Exercise name not provided in query parameter');
      return res.status(400).json({ message: 'Exercise name is required in query parameter' });
    }

    const startDate = new Date(date + 'T00:00:00.000Z');
    const endDate = new Date(date + 'T23:59:59.999Z');

    const workout = await Workout.findOne({
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    if (workout) {
      const exerciseIndex = workout.exercises.findIndex(e => e.name.toLowerCase() === (name as string).toLowerCase());
      if (exerciseIndex !== -1) {
        workout.exercises.splice(exerciseIndex, 1);
        if (workout.exercises.length === 0) {
          await Workout.deleteOne({ _id: workout._id });
          logger.info('Deleted workout after removing last exercise', { date, name, workoutId: workout._id });
        } else {
          await workout.save();
          logger.info('Removed exercise from workout', { date, name, workoutId: workout._id });
        }
        res.status(204).send();
      } else {
        logger.warn('Exercise not found for deletion', { date, name });
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      logger.warn('Workout not found for exercise deletion', { date });
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    logger.error('Error deleting exercise', { error, date: req.params.date, name: req.query.name });
    res.status(500).json({ message: 'Error deleting exercise' });
  }
};

export const deleteSetsByDateExerciseIdAndSetIds = async (req: Request, res: Response) => {
  try {
    const { date, exerciseId } = req.params;
    const { setIds } = req.body;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      logger.warn('Invalid date format provided', { date });
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (!Array.isArray(setIds) || setIds.length === 0) {
      logger.warn('Invalid setIds provided', { setIds });
      return res.status(400).json({ message: 'setIds must be a non-empty array in the request body' });
    }

    const startDate = new Date(date + 'T00:00:00.000Z');
    const endDate = new Date(date + 'T23:59:59.999Z');

    const workout = await Workout.findOne({
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    if (workout) {
      const exercise = workout.exercises.find(e => e.id === exerciseId);
      if (exercise) {
        const initialSetCount = exercise.sets.length;
        exercise.sets = exercise.sets.filter(set => !setIds.includes(set.id));
        const deletedSetCount = initialSetCount - exercise.sets.length;
        
        if (exercise.sets.length === 0) {
          workout.exercises = workout.exercises.filter(e => e.id !== exerciseId);
          logger.info('Removed exercise after deleting all sets', { date, exerciseId, workoutId: workout._id });
        }
        
        if (workout.exercises.length === 0) {
          await Workout.deleteOne({ _id: workout._id });
          logger.info('Deleted workout after removing last exercise', { date, exerciseId, workoutId: workout._id });
        } else {
          await workout.save();
          logger.info('Deleted sets from exercise', { date, exerciseId, workoutId: workout._id, deletedSetCount });
        }
        res.status(204).send();
      } else {
        logger.warn('Exercise not found for set deletion', { date, exerciseId });
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      logger.warn('Workout not found for set deletion', { date });
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    logger.error('Error deleting sets', { error, date: req.params.date, exerciseId: req.params.exerciseId, setIds: req.body.setIds });
    res.status(500).json({ message: 'Error deleting sets' });
  }
};

export const deleteSetsByDateExerciseNameAndSetIds = async (req: Request, res: Response) => {
  try {
    const { date, exerciseName } = req.params;
    const { setIds } = req.body;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      logger.warn('Invalid date format provided', { date });
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (!Array.isArray(setIds) || setIds.length === 0) {
      logger.warn('Invalid setIds provided', { setIds });
      return res.status(400).json({ message: 'setIds must be a non-empty array in the request body' });
    }

    const startDate = new Date(date + 'T00:00:00.000Z');
    const endDate = new Date(date + 'T23:59:59.999Z');

    const workout = await Workout.findOne({
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    if (workout) {
      const exercise = workout.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
      if (exercise) {
        const initialSetCount = exercise.sets.length;
        exercise.sets = exercise.sets.filter(set => !setIds.includes(set.id));
        const deletedSetCount = initialSetCount - exercise.sets.length;

        if (exercise.sets.length === 0) {
          workout.exercises = workout.exercises.filter(e => e.name.toLowerCase() !== exerciseName.toLowerCase());
          logger.info('Removed exercise after deleting all sets', { date, exerciseName, workoutId: workout._id });
        }
        
        if (workout.exercises.length === 0) {
          await Workout.deleteOne({ _id: workout._id });
          logger.info('Deleted workout after removing last exercise', { date, exerciseName, workoutId: workout._id });
        } else {
          await workout.save();
          logger.info('Deleted sets from exercise', { date, exerciseName, workoutId: workout._id, deletedSetCount });
        }
        res.status(204).send();
      } else {
        logger.warn('Exercise not found for set deletion', { date, exerciseName });
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      logger.warn('Workout not found for set deletion', { date });
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    logger.error('Error deleting sets', { error, date: req.params.date, exerciseName: req.params.exerciseName, setIds: req.body.setIds });
    res.status(500).json({ message: 'Error deleting sets' });
  }
};

export const bulkUpdateSetsByDateAndExerciseName = async (req: Request, res: Response) => {
  try {
    const { date, exerciseName } = req.params;
    const { updates } = req.body;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      logger.warn('Invalid date format provided', { date });
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (!Array.isArray(updates) || updates.length === 0) {
      logger.warn('Invalid updates provided', { updates });
      return res.status(400).json({ message: 'updates must be a non-empty array in the request body' });
    }

    const startDate = new Date(date + 'T00:00:00.000Z');
    const endDate = new Date(date + 'T23:59:59.999Z');

    const workout = await Workout.findOne({
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    if (!workout) {
      logger.warn('Workout not found for set update', { date });
      return res.status(404).json({ message: 'Workout not found' });
    }

    const exercise = workout.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
    if (!exercise) {
      logger.warn('Exercise not found for set update', { date, exerciseName });
      return res.status(404).json({ message: 'Exercise not found' });
    }

    let hasInvalidReps = false;
    let updatedSetCount = 0;
    updates.forEach(update => {
      const setIndex = exercise.sets.findIndex(set => set.id === update.id);
      if (setIndex !== -1) {
        if (update.reps !== undefined) {
          if (update.reps <= 0) {
            hasInvalidReps = true;
            return;
          }
          exercise.sets[setIndex].reps = update.reps;
        }
        if (update.weight !== undefined) {
          exercise.sets[setIndex].weight = update.weight;
        }
        updatedSetCount++;
      }
    });

    if (hasInvalidReps) {
      logger.warn('Invalid reps provided in update', { date, exerciseName });
      return res.status(400).json({ message: 'Reps must be greater than 0' });
    }

    await workout.save();
    logger.info('Updated sets for exercise', { date, exerciseName, workoutId: workout._id, updatedSetCount });
    res.json(exercise);
  } catch (error) {
    logger.error('Error updating sets', { error, date: req.params.date, exerciseName: req.params.exerciseName });
    res.status(500).json({ message: 'Error updating sets' });
  }
}

export const addNewSetToExercise = async (req: Request, res: Response) => {
  try {
    const { date, exerciseName } = req.params;
    const { reps, weight } = req.body;

    logger.info('Received request to add new set', { date, exerciseName, reps, weight });

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      logger.warn('Invalid date format provided', { date });
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (typeof reps !== 'number' || reps < 1) {
      logger.warn('Invalid reps provided', { reps });
      return res.status(400).json({ message: 'Reps must be a number greater than 0' });
    }
    if (typeof weight !== 'number' || weight < 0) {
      logger.warn('Invalid weight provided', { weight });
      return res.status(400).json({ message: 'Weight must be a non-negative number' });
    }

    const startDate = new Date(date + 'T00:00:00.000Z');
    const endDate = new Date(date + 'T23:59:59.999Z');

    logger.debug('Searching for workout', { startDate, endDate });

    let workout = await Workout.findOne({
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    logger.debug('Workout search result', { workoutFound: !!workout });

    if (!workout) {
      logger.info('Creating new workout', { date });
      workout = new Workout({
        date: startDate,
        name: "Custom workout",
        exercises: []
      });
    }

    let exercise = workout.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());

    logger.debug('Exercise search result', { exerciseFound: !!exercise });

    if (!exercise) {
      logger.info('Creating new exercise', { exerciseName });
      exercise = {
        id: (workout.exercises.length + 1).toString(),
        name: exerciseName,
        sets: []
      };
      workout.exercises.push(exercise);
    }

    logger.info('Creating new set', { exerciseName, reps, weight });
    const newSet: ISet = {
      id: generateUniqueId(),
      reps,
      weight
    };
    exercise.sets.push(newSet);

    logger.debug('Saving workout');
    await workout.save();
    logger.info('Workout saved successfully', { workoutId: workout._id, exerciseName, newSetId: newSet.id });

    res.status(201).json(exercise);
  } catch (error) {
    logger.error('Error in addNewSetToExercise', { error, stack: error.stack });
    res.status(500).json({ message: 'Error adding new set' });
  }
};

function generateUniqueId(length: number = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}