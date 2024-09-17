const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Fake data
let workouts = [
  {
    id: '1',
    date: '2024-07-15',
    name: 'Upper Body Workout',
    exercises: [
      { name: 'Bench Press', sets: 3, reps: 10, weight: 60 },
      { name: 'Pull-ups', sets: 3, reps: 8, weight: 0 },
    ],
  },
  {
    id: '2',
    date: '2024-07-17',
    name: 'Lower Body Workout',
    exercises: [
      { name: 'Squats', sets: 4, reps: 8, weight: 80 },
      { name: 'Deadlifts', sets: 3, reps: 5, weight: 100 },
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