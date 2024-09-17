const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const swaggerRouter = require('./swagger');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(swaggerRouter);

const exercisesPath = path.join(__dirname, 'db/exercise-db.json');
const workoutsPath = path.join(__dirname, 'db/workout-history-db.json');

// Helper function to read JSON file
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file from ${filePath}:`, error);
    return null;
  }
}

// Helper function to write JSON file
async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing file to ${filePath}:`, error);
  }
}

// Initial data (for restore endpoint)
const initialWorkouts = [
  {
    id: '1',
    date: '2024-09-05T00:00:00.000Z',
    name: 'Upper body workout',
    exercises: [
      { id: '1', name: 'Bent Over Row', sets: [{ reps: 5, weight: 43 }, { reps: 5, weight: 43 }, { reps: 5, weight: 43 }] },
      { id: '2', name: 'Bench Press', sets: [{ reps: 5, weight: 20.5 }, { reps: 5, weight: 20.5 }, { reps: 5, weight: 20.5 }] },
      { id: '3', name: 'Pull up', sets: [{ reps: 5, weight: 0 }, { reps: 5, weight: 0 }, { reps: 5, weight: 0 }] },
    ],
  },
  {
    id: '2',
    date: '2024-09-07T00:00:00.000Z',
    name: 'Leg day workout',
    exercises: [
      { id: '1', name: 'Squats', sets: [{ reps: 8, weight: 70 }, { reps: 8, weight: 70 }, { reps: 8, weight: 70 }, { reps: 8, weight: 70 }] },
      { id: '2', name: 'Deadlifts', sets: [{ reps: 5, weight: 85 }, { reps: 5, weight: 85 }, { reps: 5, weight: 85 }] },
    ],
  },
  {
    id: '3',
    date: '2024-09-09T00:00:00.000Z',
    name: 'Core workout',
    exercises: [
      { id: '1', name: 'Rolling Planks', sets: [{ reps: 1, weight: 0 }, { reps: 1, weight: 0 }, { reps: 1, weight: 0 }] },
      { id: '2', name: 'Russian Twists', sets: [{ reps: 20, weight: 5 }, { reps: 20, weight: 5 }, { reps: 20, weight: 5 }] },
    ],
  },
];

const initialExercises = [
  { id: '1', name: 'Squat' },
  { id: '2', name: 'Deadlift' },
  { id: '3', name: 'Bench Press' },
  { id: '4', name: 'Overhead Press' },
  { id: '5', name: 'Barbell Row' },
];

// Restore endpoint
app.get('/api/restore', async (req, res) => {
  try {
    await writeJsonFile(workoutsPath, initialWorkouts);
    await writeJsonFile(exercisesPath, initialExercises);
    res.status(200).json({ message: 'Database restored successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error restoring database', error: error.message });
  }
});

// GET all workouts
app.get('/api/workouts', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    res.json(workouts);
  } else {
    res.status(500).json({ message: 'Error reading workouts' });
  }
});

// GET a specific workout
app.get('/api/workouts/:id', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    const workout = workouts.find(w => w.id === req.params.id);
    if (workout) {
      res.json(workout);
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } else {
    res.status(500).json({ message: 'Error reading workouts' });
  }
});

// POST a new workout
app.post('/api/workouts', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    const newWorkout = {
      id: (workouts.length + 1).toString(),
      ...req.body,
    };
    workouts.push(newWorkout);
    await writeJsonFile(workoutsPath, workouts);
    res.status(201).json(newWorkout);
  } else {
    res.status(500).json({ message: 'Error reading or writing workouts' });
  }
});

// PUT (update) a workout
app.put('/api/workouts/:id', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    const index = workouts.findIndex(w => w.id === req.params.id);
    if (index !== -1) {
      workouts[index] = { ...workouts[index], ...req.body };
      await writeJsonFile(workoutsPath, workouts);
      res.json(workouts[index]);
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } else {
    res.status(500).json({ message: 'Error reading or writing workouts' });
  }
});

// DELETE a workout
app.delete('/api/workouts/:id', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    const index = workouts.findIndex(w => w.id === req.params.id);
    if (index !== -1) {
      workouts.splice(index, 1);
      await writeJsonFile(workoutsPath, workouts);
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } else {
    res.status(500).json({ message: 'Error reading or writing workouts' });
  }
});

// GET exercises for a specific date
app.get('/api/workouts/date/:date', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    const workout = workouts.find(w => w.date.startsWith(req.params.date));
    if (workout) {
      res.json(workout.exercises);
    } else {
      res.json([]);
    }
  } else {
    res.status(500).json({ message: 'Error reading workouts' });
  }
});

// POST a new exercise for a specific date
app.post('/api/workouts/date/:date/exercises', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    let workout = workouts.find(w => w.date.startsWith(req.params.date));
    if (!workout) {
      workout = {
        id: (workouts.length + 1).toString(),
        date: `${req.params.date}T00:00:00.000Z`,
        name: 'Workout',
        exercises: [],
      };
      workouts.push(workout);
    }
    const newExercise = {
      id: (workout.exercises.length + 1).toString(),
      ...req.body,
    };
    workout.exercises.push(newExercise);
    await writeJsonFile(workoutsPath, workouts);
    res.status(201).json(newExercise);
  } else {
    res.status(500).json({ message: 'Error reading or writing workouts' });
  }
});

// PUT (update) an exercise for a specific date
app.put('/api/workouts/date/:date/exercises/:exerciseId', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    const workout = workouts.find(w => w.date.startsWith(req.params.date));
    if (workout) {
      const exerciseIndex = workout.exercises.findIndex(e => e.id === req.params.exerciseId);
      if (exerciseIndex !== -1) {
        workout.exercises[exerciseIndex] = { ...workout.exercises[exerciseIndex], ...req.body };
        await writeJsonFile(workoutsPath, workouts);
        res.json(workout.exercises[exerciseIndex]);
      } else {
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } else {
    res.status(500).json({ message: 'Error reading or writing workouts' });
  }
});

// DELETE an exercise for a specific date
app.delete('/api/workouts/date/:date/exercises/:exerciseId', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    const workout = workouts.find(w => w.date.startsWith(req.params.date));
    if (workout) {
      const exerciseIndex = workout.exercises.findIndex(e => e.id === req.params.exerciseId);
      if (exerciseIndex !== -1) {
        workout.exercises.splice(exerciseIndex, 1);
        await writeJsonFile(workoutsPath, workouts);
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } else {
    res.status(500).json({ message: 'Error reading or writing workouts' });
  }
});

// GET all exercises
app.get('/api/exercises', async (req, res) => {
  const exercises = await readJsonFile(exercisesPath);
  if (exercises) {
    res.json(exercises);
  } else {
    res.status(500).json({ message: 'Error reading exercises' });
  }
});

// GET a specific exercise
app.get('/api/exercises/:id', async (req, res) => {
  const exercises = await readJsonFile(exercisesPath);
  if (exercises) {
    const exercise = exercises.find(e => e.id === req.params.id);
    if (exercise) {
      res.json(exercise);
    } else {
      res.status(404).json({ message: 'Exercise not found' });
    }
  } else {
    res.status(500).json({ message: 'Error reading exercises' });
  }
});

app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
});