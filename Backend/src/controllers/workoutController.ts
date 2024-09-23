import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import Workout, { IWorkout, IExercise, ISet } from '../models/workout';

export const getWorkouts = async (req: Request, res: Response) => {
  try {
    const workouts: IWorkout[] = await Workout.find();
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workouts', error });
  }
};

export const getWorkoutByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
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
      res.json(workout);
    } else {
      res.json({ date, name: "", exercises: [] });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workout', error });
  }
};

export const getExerciseByDateAndName = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const { name } = req.query;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
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
        res.json(exercise);
      } else {
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exercise', error });
  }
};

export const getExerciseByDateAndId = async (req: Request, res: Response) => {
  try {
    const { date, exerciseId } = req.params;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
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
      const exercise = workout.exercises.find(e => e.id === exerciseId);
      if (exercise) {
        res.json(exercise);
      } else {
        // Return an empty exercise object instead of a 404
        res.json({ id: exerciseId, sets: [] });
      }
    } else {
      // Return an empty workout with an empty exercise instead of a 404
      res.json({ id: exerciseId, sets: [] });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exercise', error });
  }
};

export const deleteExerciseByDateAndId = async (req: Request, res: Response) => {
  try {
    const { date, exerciseId } = req.params;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
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
        } else {
          await workout.save();
        }
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting exercise', error });
  }
};

export const deleteExerciseByDateAndName = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const { name } = req.query;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (!name) {
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
        } else {
          await workout.save();
        }
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting exercise', error });
  }
};

export const deleteSetsByDateExerciseIdAndSetIds = async (req: Request, res: Response) => {
  try {
    const { date, exerciseId } = req.params;
    const { setIds } = req.body;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (!Array.isArray(setIds) || setIds.length === 0) {
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
        exercise.sets = exercise.sets.filter(set => !setIds.includes(set.id));
        if (exercise.sets.length === 0) {
          workout.exercises = workout.exercises.filter(e => e.id !== exerciseId);
        }
        if (workout.exercises.length === 0) {
          await Workout.deleteOne({ _id: workout._id });
        } else {
          await workout.save();
        }
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting sets', error });
  }
};

export const deleteSetsByDateExerciseNameAndSetIds = async (req: Request, res: Response) => {
  try {
    const { date, exerciseName } = req.params;
    const { setIds } = req.body;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (!Array.isArray(setIds) || setIds.length === 0) {
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
        exercise.sets = exercise.sets.filter(set => !setIds.includes(set.id));
        if (exercise.sets.length === 0) {
          workout.exercises = workout.exercises.filter(e => e.name.toLowerCase() !== exerciseName.toLowerCase());
        }
        if (workout.exercises.length === 0) {
          await Workout.deleteOne({ _id: workout._id });
        } else {
          await workout.save();
        }
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting sets', error });
  }
};

export const bulkUpdateSetsByDateAndExerciseName = async (req: Request, res: Response) => {
  try {
    const { date, exerciseName } = req.params;
    const { updates } = req.body;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (!Array.isArray(updates) || updates.length === 0) {
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
      return res.status(404).json({ message: 'Workout not found' });
    }

    const exercise = workout.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    let hasInvalidReps = false;
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
      }
    });

    if (hasInvalidReps) {
      return res.status(400).json({ message: 'Reps must be greater than 0' });
    }

    await workout.save();
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: 'Error updating sets', error: error.message });
  }
};

export const addNewSetToExercise = async (req: Request, res: Response) => {
  try {
    const { date, exerciseName } = req.params;
    const { reps, weight } = req.body;

    console.log('Received request to add new set:', { date, exerciseName, reps, weight });

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      console.log('Invalid date format:', date);
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (typeof reps !== 'number' || reps < 1) {
      console.log('Invalid reps:', reps);
      return res.status(400).json({ message: 'Reps must be a number greater than 0' });
    }
    if (typeof weight !== 'number' || weight < 0) {
      console.log('Invalid weight:', weight);
      return res.status(400).json({ message: 'Weight must be a non-negative number' });
    }

    const startDate = new Date(date + 'T00:00:00.000Z');
    const endDate = new Date(date + 'T23:59:59.999Z');

    console.log('Searching for workout between:', startDate, 'and', endDate);

    let workout = await Workout.findOne({
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    console.log('Found workout:', workout);

    if (!workout) {
      console.log('Creating new workout');
      workout = new Workout({
        date: startDate,
        name: "Custom workout",
        exercises: []
      });
    }

    let exercise = workout.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());

    console.log('Found exercise:', exercise);

    if (!exercise) {
      console.log('Creating new exercise');
      exercise = {
        id: (workout.exercises.length + 1).toString(),
        name: exerciseName,
        sets: []
      };
      workout.exercises.push(exercise);
    }

    console.log('Creating new set');
    const newSet: ISet = {
      id: generateUniqueId(),
      reps,
      weight
    };
    exercise.sets.push(newSet);

    console.log('Saving workout');
    await workout.save();
    console.log('Workout saved successfully');

    res.status(201).json(exercise);
  } catch (error) {
    console.error('Error in addNewSetToExercise:', error);
    res.status(500).json({ message: 'Error adding new set', error: error.message, stack: error.stack });
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