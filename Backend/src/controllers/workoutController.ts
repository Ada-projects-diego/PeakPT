import { Request, Response } from 'express';
import Workout, { ISet, ICompletedExercise } from '../models/workout';
import { logger } from '../middleware/loggingMiddleware';

export const getWorkouts = async (req: Request, res: Response) => {
  logger.info('Fetching all workouts');
  try {
    const workouts = await Workout.find().sort({ date: -1 });
    logger.info(`Successfully fetched ${workouts.length} workouts`);
    res.json(workouts);
  } catch (error) {
    logger.error('Error fetching workouts', { error });
    res.status(500).json({ message: 'Error fetching workouts', error: error });
  }
};

export const getWorkoutByDate = async (req: Request, res: Response) => {
  const { date } = req.params;
  logger.info('Fetching workout by date', { date });
  try {
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
      logger.info('Workout found for the given date', { date, workoutId: workout._id });
      res.json(workout);
    } else {
      logger.info('No workout found for the given date', { date });
      res.json({ date, name: "", exercises: [] });
    }
  } catch (error) {
    logger.error('Error fetching workout by date', { date, error });
    res.status(500).json({ message: 'Error fetching workout', error });
  }
};

export const getExerciseByDateAndName = async (req: Request, res: Response) => {
  const { date } = req.params;
  const { name } = req.query;
  logger.info('Fetching exercise by date and name', { date, name });
  try {
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
      const exercise = workout.exercises.find(e => e.name.toLowerCase() === (name as string).toLowerCase());
      if (exercise) {
        logger.info('Exercise found', { date, name, exerciseId: exercise._id });
        res.json(exercise);
      } else {
        logger.info('Exercise not found', { date, name });
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      logger.info('Workout not found', { date });
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    logger.error('Error fetching exercise by date and name', { date, name, error });
    res.status(500).json({ message: 'Error fetching exercise', error });
  }
}
export const getExerciseByDateAndId = async (req: Request, res: Response) => {
  const { date, exerciseId } = req.params;
  logger.info('Fetching exercise by date and ID', { date, exerciseId });
  try {
    const workoutDate = new Date(date);

    const workout = await Workout.findOne({
      date: {
        $gte: new Date(workoutDate.setHours(0, 0, 0, 0)),
        $lt: new Date(workoutDate.setHours(23, 59, 59, 999))
      }
    });

    if (!workout) {
      logger.info('Workout not found for the given date', { date });
      return res.status(404).json({ message: 'Workout not found for the given date' });
    }

    logger.debug('Found workout', { workoutId: workout._id });
    const exercise = workout.exercises.find(e => e._id.toHexString() === exerciseId);

    if (!exercise) {
      logger.info('Exercise not found', { date, exerciseId });
      return res.json({ _id: exerciseId, name: '', sets: [] });
    }

    logger.info('Exercise found', { date, exerciseId });
    res.json(exercise);
  } catch (error) {
    logger.error('Error fetching exercise by date and ID', { date, exerciseId, error });
    res.status(500).json({ message: 'Error fetching exercise', error: error });
  }
};

export const deleteExerciseByDateAndId = async (req: Request, res: Response) => {
  const { date, exerciseId } = req.params;
  logger.info('Deleting exercise by date and ID', { date, exerciseId });
  try {
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
          logger.info('Deleting workout as it has no exercises left', { workoutId: workout._id });
          await Workout.deleteOne({ _id: workout._id });
          logger.info('Deleted workout after removing last exercise', { date, exerciseId, workoutId: workout._id });
        } else {
          logger.info('Saving workout after deleting exercise', { workoutId: workout._id });
          await workout.save();
          logger.info('Removed exercise from workout', { date, exerciseId, workoutId: workout._id });
        }
        res.status(204).send();
      } else {
        logger.info('Exercise not found', { date, exerciseId });
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      logger.info('Workout not found', { date });
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    logger.error('Error deleting exercise by date and ID', { date, exerciseId, error });
    res.status(500).json({ message: 'Error deleting exercise', error });
  }
};

export const deleteExerciseByDateAndName = async (req: Request, res: Response) => {
  const { date } = req.params;
  const { name } = req.query;
  logger.info('Deleting exercise by date and name', { date, name });
  try {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      logger.warn('Invalid date format provided', { date });
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (!name) {
      logger.warn('Exercise name not provided');
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
          logger.info('Deleting workout as it has no exercises left', { workoutId: workout._id });
          await Workout.deleteOne({ _id: workout._id });
          logger.info('Deleted workout after removing last exercise', { date, name, workoutId: workout._id });
        } else {
          logger.info('Saving workout after deleting exercise', { workoutId: workout._id });
          await workout.save();
          logger.info('Removed exercise from workout', { date, name, workoutId: workout._id });
        }
        res.status(204).send();
      } else {
        logger.info('Exercise not found', { date, name });
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      logger.info('Workout not found', { date });
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    logger.error('Error deleting exercise by date and name', { date, name, error });
    res.status(500).json({ message: 'Error deleting exercise', error });
  }
};

export const deleteSetsByDateExerciseIdAndSetIds = async (req: Request, res: Response) => {
  const { date, exerciseId } = req.params;
  const { setIds } = req.body;
  logger.info('Deleting sets by date, exercise ID, and set IDs', { date, exerciseId, setIds });
  try {
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
        const originalSetCount = exercise.sets.length;
        exercise.sets = exercise.sets.filter(set => !setIds.includes(set.id));
        logger.info(`Removed ${originalSetCount - exercise.sets.length} sets from exercise`, { exerciseId });
        
        if (exercise.sets.length === 0) {
          workout.exercises = workout.exercises.filter(e => e.id !== exerciseId);
          logger.info('Removed exercise as it has no sets left', { exerciseId });
        }
        
        if (workout.exercises.length === 0) {
          logger.info('Deleting workout as it has no exercises left', { workoutId: workout._id });
          await Workout.deleteOne({ _id: workout._id });
          logger.info('Deleted workout after removing last exercise', { date, exerciseId, workoutId: workout._id });
        } else {
          logger.info('Saving workout after deleting sets', { workoutId: workout._id });
          await workout.save();
          logger.info('Deleted sets from exercise', { date, exerciseId, workoutId: workout._id});
        }
        res.status(204).send();
      } else {
        logger.info('Exercise not found', { date, exerciseId });
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      logger.info('Workout not found', { date });
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    logger.error('Error deleting sets', { date, exerciseId, setIds, error });
    res.status(500).json({ message: 'Error deleting sets', error });
  }
};

export const deleteSetsByDateExerciseNameAndSetIds = async (req: Request, res: Response) => {
  const { date, exerciseName } = req.params;
  const { setIds } = req.body;
  logger.info('Deleting sets by date, exercise name, and set IDs', { date, exerciseName, setIds });
  try {
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
        const originalSetCount = exercise.sets.length;
        exercise.sets = exercise.sets.filter(set => !setIds.includes(set.id));
        logger.info(`Removed ${originalSetCount - exercise.sets.length} sets from exercise`, { exerciseName });
        
        if (exercise.sets.length === 0) {
          workout.exercises = workout.exercises.filter(e => e.name.toLowerCase() !== exerciseName.toLowerCase());
          logger.info('Removed exercise as it has no sets left', { exerciseName });
        }
        
        if (workout.exercises.length === 0) {
          logger.info('Deleting workout as it has no exercises left', { workoutId: workout._id });
          await Workout.deleteOne({ _id: workout._id });
          logger.info('Deleted workout after removing last exercise', { date, exerciseName, workoutId: workout._id });
        } else {
          logger.info('Saving workout after deleting sets', { workoutId: workout._id });
          await workout.save();
          logger.info('Deleted sets from exercise', { date, exerciseName, workoutId: workout._id });
        }
        res.status(204).send();
      } else {
        logger.info('Exercise not found', { date, exerciseName });
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      logger.info('Workout not found', { date });
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    logger.error('Error deleting sets', { date, exerciseName, setIds, error });
    res.status(500).json({ message: 'Error deleting sets', error });
  }
};

export const bulkUpdateSetsByDateAndExerciseName = async (req: Request, res: Response) => {
  const { date, exerciseName } = req.params;
  const { updates } = req.body;
  logger.info('Bulk updating sets', { date, exerciseName, updateCount: updates.length });

  try {
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
      logger.info('Workout not found', { date });
      return res.status(404).json({ message: 'Workout not found' });
    }

    const exercise = workout.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
    if (!exercise) {
      logger.info('Exercise not found', { date, exerciseName });
      return res.status(404).json({ message: 'Exercise not found' });
    }

    let hasInvalidReps = false;
    let updatedSetsCount = 0;

    updates.forEach(update => {
      const setIndex = exercise.sets.findIndex(set => set.id === update.id);
      if (setIndex !== -1) {
        if (update.reps !== undefined) {
          if (update.reps <= 0) {
            hasInvalidReps = true;
            logger.warn('Invalid reps provided', { setId: update.id, reps: update.reps });
            return;
          }
          exercise.sets[setIndex].reps = update.reps;
        }
        if (update.weight !== undefined) {
          exercise.sets[setIndex].weight = update.weight;
        }
        updatedSetsCount++;
      }
    });

    if (hasInvalidReps) {
      logger.warn('Bulk update cancelled due to invalid reps');
      return res.status(400).json({ message: 'Reps must be greater than 0' });
    }

    await workout.save();
    logger.info('Bulk update completed successfully', { updatedSetsCount });
    res.json(exercise);
  } catch (error) {
    logger.error('Error updating sets', { date, exerciseName, error: error });
    res.status(500).json({ message: 'Error updating sets', error: error});
  }
}

export const addNewSetToExercise = async (req: Request, res: Response) => {
  const { date, exerciseName } = req.params;
  const { reps, weight } = req.body;
  logger.info('Adding new set to exercise', { date, exerciseName, reps, weight });

  try {
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

    let workout = await Workout.findOne({
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    if (!workout) {
      logger.info('Creating new workout', { date });
      workout = new Workout({
        date: startDate,
        name: "Custom workout",
        exercises: []
      });
    }

    let exercise = workout.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());

    if (!exercise) {
      logger.info('Adding new exercise to workout', { exerciseName });
      exercise = {
        id: (workout.exercises.length + 1).toString(),
        name: exerciseName,
        sets: []
      };
      workout.exercises.push(exercise as ICompletedExercise);
    }

    const newSet: ISet = {
      reps,
      weight
    };
    if (exercise) {
      exercise.sets.push(newSet);
      logger.info('New set added to exercise', { exerciseName, setId: newSet.id });
    } else {
      logger.error('Failed to add new set: exercise is undefined', { exerciseName });
      return res.status(500).json({ message: 'Failed to add new set: exercise is undefined' });
    }
    logger.info('New set added to exercise', { exerciseName, setId: newSet.id });

    await workout.save();
    logger.info('Workout saved successfully', { workoutId: workout._id });

    res.status(201).json(exercise);
  } catch (error) {
    logger.error('Error in addNewSetToExercise', { date, exerciseName, error });
    res.status(500).json({ message: 'Error adding new set', error });
  }
};