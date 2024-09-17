const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Updated fake data to match WorkoutList structure
let workouts = [
  {
    id: '1',
    date: '2024-09-05T00:00:00.000Z', // ISO date string
    name: 'Upper body workout',
    exercises: [
      { name: 'Bent Over Row', sets: 3, reps: 5, weight: 43 },
      { name: 'Bench Press', sets: 3, reps: 5, weight: 20.5 },
      { name: 'Pull up', sets: 3, reps: 5, weight: 0 },
      { name: 'Overhead Press', sets: 3, reps: 5, weight: 25 },
      { name: 'Dumbbell Curls', sets: 3, reps: 10, weight: 10 },
    ],
  },
  {
    id: '2',
    date: '2024-09-07T00:00:00.000Z', // ISO date string
    name: 'Leg day workout',
    exercises: [
      { name: 'Squats', sets: 4, reps: 8, weight: 70 },
      { name: 'Deadlifts', sets: 3, reps: 5, weight: 85 },
      { name: 'Leg Press', sets: 3, reps: 10, weight: 100 },
      { name: 'Lunges', sets: 3, reps: 12, weight: 20 },
    ],
  },
  {
    id: '3',
    date: '2024-09-09T00:00:00.000Z', // ISO date string
    name: 'Core workout',
    exercises: [
      { name: 'Rolling Planks', sets: 3, reps: 1, weight: 0 },
      { name: 'Russian Twists', sets: 3, reps: 20, weight: 5 },
      { name: 'Leg Raises', sets: 3, reps: 15, weight: 0 },
      { name: 'Bicycle Crunches', sets: 3, reps: 20, weight: 0 },
    ],
  },
];

// GET all workouts
app.get('/api/workouts', (req, res) => {
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

app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
});