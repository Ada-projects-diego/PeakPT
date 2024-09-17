const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Updated fake data to match new Exercise structure
let workouts = [
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

// GET all workouts
app.get('/api/workouts', (req, res) => {
  console.log('GET /api/workouts - Returning workouts:', JSON.stringify(workouts, null, 2));
  res.json(workouts);
});

// GET a specific workout
app.get('/api/workouts/:id', (req, res) => {
  const workout = workouts.find(w => w.id === req.params.id);
  if (workout) {
    res.json(workout);
  } else {
    res.status(404).json({ message: 'Workout not found' });
  }
});

// POST a new workout
app.post('/api/workouts', (req, res) => {
  const newWorkout = {
    id: (workouts.length + 1).toString(),
    ...req.body,
  };
  workouts.push(newWorkout);
  res.status(201).json(newWorkout);
});

// PUT (update) a workout
app.put('/api/workouts/:id', (req, res) => {
  const index = workouts.findIndex(w => w.id === req.params.id);
  if (index !== -1) {
    workouts[index] = { ...workouts[index], ...req.body };
    res.json(workouts[index]);
  } else {
    res.status(404).json({ message: 'Workout not found' });
  }
});

// DELETE a workout
app.delete('/api/workouts/:id', (req, res) => {
  const index = workouts.findIndex(w => w.id === req.params.id);
  if (index !== -1) {
    workouts.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Workout not found' });
  }
});

// GET exercises for a specific date
app.get('/api/workouts/date/:date', (req, res) => {
  console.log(`GET /api/workouts/date/${req.params.date} - Requested date:`, req.params.date);
  const workout = workouts.find(w => w.date.startsWith(req.params.date));
  if (workout) {
    console.log('Returning exercises:', JSON.stringify(workout.exercises, null, 2));
    res.json(workout.exercises);
  } else {
    console.log('No workout found for date:', req.params.date);
    res.json([]);
  }
});

// POST a new exercise for a specific date
app.post('/api/workouts/date/:date/exercises', (req, res) => {
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
  res.status(201).json(newExercise);
});

// PUT (update) an exercise for a specific date
app.put('/api/workouts/date/:date/exercises/:exerciseId', (req, res) => {
  const workout = workouts.find(w => w.date.startsWith(req.params.date));
  if (workout) {
    const exerciseIndex = workout.exercises.findIndex(e => e.id === req.params.exerciseId);
    if (exerciseIndex !== -1) {
      workout.exercises[exerciseIndex] = { ...workout.exercises[exerciseIndex], ...req.body };
      res.json(workout.exercises[exerciseIndex]);
    } else {
      res.status(404).json({ message: 'Exercise not found' });
    }
  } else {
    res.status(404).json({ message: 'Workout not found' });
  }
});

// DELETE an exercise for a specific date
app.delete('/api/workouts/date/:date/exercises/:exerciseId', (req, res) => {
  const workout = workouts.find(w => w.date.startsWith(req.params.date));
  if (workout) {
    const exerciseIndex = workout.exercises.findIndex(e => e.id === req.params.exerciseId);
    if (exerciseIndex !== -1) {
      workout.exercises.splice(exerciseIndex, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Exercise not found' });
    }
  } else {
    res.status(404).json({ message: 'Workout not found' });
  }
});

app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
});