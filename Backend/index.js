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

// GET all workouts
app.get('/api/workouts', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    res.json(workouts);
  } else {
    res.status(500).json({ message: 'Error reading workouts' });
  }
});

// GET workout by date
app.get('/api/workouts/:date', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(req.params.date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }
    
    const workout = workouts.find(w => w.date === req.params.date);
    if (workout) {
      res.json(workout);
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } else {
    res.status(500).json({ message: 'Error reading workouts' });
  }
});

// GET completed exercise by date and exercise name
app.get('/api/workouts/:date/exercises', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(req.params.date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const workout = workouts.find(w => w.date === req.params.date);
    if (workout) {
      const exercise = workout.exercises.find(e => e.name.toLowerCase() === req.query.name.toLowerCase());
      if (exercise) {
        res.json(exercise);
      } else {
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } else {
    res.status(500).json({ message: 'Error reading workouts' });
  }
});

// GET completed exercise by date and exercise id
app.get('/api/workouts/:date/exercises/:exerciseId', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(req.params.date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const workout = workouts.find(w => w.date === req.params.date);
    if (workout) {
      const exercise = workout.exercises.find(e => e.id === req.params.exerciseId);
      if (exercise) {
        res.json(exercise);
      } else {
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } else {
    res.status(500).json({ message: 'Error reading workouts' });
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

// GET exercise by id
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

// DELETE completed exercise by date and exercise id
app.delete('/api/workouts/:date/exercises/:exerciseId', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(req.params.date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const workoutIndex = workouts.findIndex(w => w.date === req.params.date);
    if (workoutIndex !== -1) {
      const exerciseIndex = workouts[workoutIndex].exercises.findIndex(e => e.id === req.params.exerciseId);
      if (exerciseIndex !== -1) {
        workouts[workoutIndex].exercises.splice(exerciseIndex, 1);
        await writeJsonFile(workoutsPath, workouts);
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } else {
    res.status(500).json({ message: 'Error reading workouts' });
  }
});

// DELETE completed exercise by date and exercise name
app.delete('/api/workouts/:date/exercises', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(req.params.date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const workoutIndex = workouts.findIndex(w => w.date === req.params.date);
    if (workoutIndex !== -1) {
      const exerciseName = req.query.name;
      if (!exerciseName) {
        return res.status(400).json({ message: 'Exercise name is required in query parameter' });
      }
      const exerciseIndex = workouts[workoutIndex].exercises.findIndex(e => e.name.toLowerCase() === exerciseName.toLowerCase());
      if (exerciseIndex !== -1) {
        workouts[workoutIndex].exercises.splice(exerciseIndex, 1);
        await writeJsonFile(workoutsPath, workouts);
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } else {
    res.status(500).json({ message: 'Error reading workouts' });
  }
});

// DELETE sets by date, exercise id, and set id(s)
app.delete('/api/workouts/:date/exercises/:exerciseId/sets', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(req.params.date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const workoutIndex = workouts.findIndex(w => w.date === req.params.date);
    if (workoutIndex !== -1) {
      const exerciseIndex = workouts[workoutIndex].exercises.findIndex(e => e.id === req.params.exerciseId);
      if (exerciseIndex !== -1) {
        const setIds = req.body.setIds;
        if (!Array.isArray(setIds) || setIds.length === 0) {
          return res.status(400).json({ message: 'setIds must be a non-empty array in the request body' });
        }
        workouts[workoutIndex].exercises[exerciseIndex].sets = workouts[workoutIndex].exercises[exerciseIndex].sets.filter(set => !setIds.includes(set.id));
        await writeJsonFile(workoutsPath, workouts);
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } else {
    res.status(500).json({ message: 'Error reading workouts' });
  }
});

app.delete('/api/workouts/:date/exercises/byname/:exerciseName/sets', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(req.params.date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const workoutIndex = workouts.findIndex(w => w.date === req.params.date);
    if (workoutIndex !== -1) {
      const exerciseIndex = workouts[workoutIndex].exercises.findIndex(e => e.name.toLowerCase() === req.params.exerciseName.toLowerCase());
      if (exerciseIndex !== -1) {
        const setIds = req.body.setIds;
        if (!Array.isArray(setIds) || setIds.length === 0) {
          return res.status(400).json({ message: 'setIds must be a non-empty array in the request body' });
        }
        workouts[workoutIndex].exercises[exerciseIndex].sets = workouts[workoutIndex].exercises[exerciseIndex].sets.filter(set => !setIds.includes(set.id));
        await writeJsonFile(workoutsPath, workouts);
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } else {
    res.status(500).json({ message: 'Error reading workouts' });
  }
});

// DELETE sets by date, exercise name, and set id(s)
app.delete('/api/workouts/:date/exercises/byname/:exerciseName/sets', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(req.params.date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const workoutIndex = workouts.findIndex(w => w.date === req.params.date);
    if (workoutIndex !== -1) {
      const exerciseIndex = workouts[workoutIndex].exercises.findIndex(e => e.name.toLowerCase() === req.params.exerciseName.toLowerCase());
      if (exerciseIndex !== -1) {
        const setIds = req.body.setIds;
        if (!Array.isArray(setIds) || setIds.length === 0) {
          return res.status(400).json({ message: 'setIds must be a non-empty array in the request body' });
        }
        workouts[workoutIndex].exercises[exerciseIndex].sets = workouts[workoutIndex].exercises[exerciseIndex].sets.filter(set => !setIds.includes(set.id));
        await writeJsonFile(workoutsPath, workouts);
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } else {
    res.status(500).json({ message: 'Error reading workouts' });
  }
});

// Bulk update sets by date, exercise name, and set id(s)
app.put('/api/workouts/:date/exercises/byname/:exerciseName/sets', async (req, res) => {
  const workouts = await readJsonFile(workoutsPath);
  if (workouts) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(req.params.date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const workoutIndex = workouts.findIndex(w => w.date === req.params.date);
    if (workoutIndex !== -1) {
      const exerciseIndex = workouts[workoutIndex].exercises.findIndex(e => e.name.toLowerCase() === req.params.exerciseName.toLowerCase());
      if (exerciseIndex !== -1) {
        const updates = req.body.updates;
        if (!Array.isArray(updates) || updates.length === 0) {
          return res.status(400).json({ message: 'updates must be a non-empty array in the request body' });
        }
        
        let hasInvalidReps = false;
        updates.forEach(update => {
          const setIndex = workouts[workoutIndex].exercises[exerciseIndex].sets.findIndex(set => set.id === update.id);
          if (setIndex !== -1) {
            if (update.reps !== undefined) {
              if (update.reps <= 0) {
                hasInvalidReps = true;
                return;
              }
              workouts[workoutIndex].exercises[exerciseIndex].sets[setIndex].reps = update.reps;
            }
            if (update.weight !== undefined) {
              workouts[workoutIndex].exercises[exerciseIndex].sets[setIndex].weight = update.weight;
            }
          }
        });

        if (hasInvalidReps) {
          return res.status(400).json({ message: 'Reps must be greater than 0' });
        }

        await writeJsonFile(workoutsPath, workouts);
        res.json(workouts[workoutIndex].exercises[exerciseIndex]);
      } else {
        res.status(404).json({ message: 'Exercise not found' });
      }
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } else {
    res.status(500).json({ message: 'Error reading workouts' });
  }
});

// Add a new set to an exercise (handles new workout, new exercise, and existing exercise scenarios)
app.post('/api/workouts/:date/exercises/byname/:exerciseName/sets', async (req, res) => {
  let workouts = await readJsonFile(workoutsPath);
  if (!workouts) {
    return res.status(500).json({ message: 'Error reading workouts' });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(req.params.date)) {
    return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
  }

  const { reps, weight } = req.body;
  if (typeof reps !== 'number' || reps < 1) {
    return res.status(400).json({ message: 'Reps must be a number greater than 0' });
  }
  if (typeof weight !== 'number' || weight < 0) {
    return res.status(400).json({ message: 'Weight must be a non-negative number' });
  }

  let workout = workouts.find(w => w.date === req.params.date);
  let exercise;

  if (!workout) {
    // Scenario 1: New workout
    workout = {
      date: req.params.date,
      name: "Custom workout",
      exercises: []
    };
    workouts.push(workout);
  }

  exercise = workout.exercises.find(e => e.name.toLowerCase() === req.params.exerciseName.toLowerCase());

  if (!exercise) {
    // Scenario 2: New exercise in existing workout
    exercise = {
      id: (workout.exercises.length + 1).toString(),
      name: req.params.exerciseName,
      sets: []
    };
    workout.exercises.push(exercise);
  }

  // Scenario 3: Add new set to existing exercise (also applies to scenarios 1 and 2)
  const newSet = {
    id: (exercise.sets.length + 1).toString(),
    reps,
    weight
  };
  exercise.sets.push(newSet);

  await writeJsonFile(workoutsPath, workouts);
  res.status(201).json(exercise);
});

// Recover db
app.get('/api/recover', async (req, res) => {
  const initialWorkouts = [
    {
      "date": "2024-09-05",
      "name": "Upper body workout",
      "exercises": [
        {
          "id": "1",
          "name": "Bent Over Row",
          "sets": [
            {
              "id": "1",
              "reps": 5,
              "weight": 43
            },
            {
              "id": "2",
              "reps": 5,
              "weight": 43
            },
            {
              "id": "3",
              "reps": 5,
              "weight": 43
            }
          ]
        },
        {
          "id": "2",
          "name": "Bench Press",
          "sets": [
            {
              "id": "1",
              "reps": 5,
              "weight": 20.5
            },
            {
              "id": "2",
              "reps": 5,
              "weight": 20.5
            },
            {
              "id": "3",
              "reps": 5,
              "weight": 20.5
            }
          ]
        },
        {
          "id": "3",
          "name": "Pull up",
          "sets": [
            {
              "id": "1",
              "reps": 5,
              "weight": 0
            },
            {
              "id": "2",
              "reps": 5,
              "weight": 0
            },
            {
              "id": "3",
              "reps": 5,
              "weight": 0
            }
          ]
        }
      ]
    },
    {
      "date": "2024-09-07",
      "name": "Leg day workout",
      "exercises": [
        {
          "id": "1",
          "name": "Squats",
          "sets": [
            {
              "id": "1",
              "reps": 8,
              "weight": 70
            },
            {
              "id": "2",
              "reps": 8,
              "weight": 70
            },
            {
              "id": "3",
              "reps": 8,
              "weight": 70
            },
            {
              "id": "4",
              "reps": 8,
              "weight": 70
            }
          ]
        },
        {
          "id": "2",
          "name": "Deadlifts",
          "sets": [
            {
              "id": "1",
              "reps": 5,
              "weight": 85
            },
            {
              "id": "2",
              "reps": 5,
              "weight": 85
            },
            {
              "id": "3",
              "reps": 5,
              "weight": 85
            }
          ]
        }
      ]
    },
    {
      "date": "2024-09-09",
      "name": "Core workout",
      "exercises": [
        {
          "id": "1",
          "name": "Rolling Planks",
          "sets": [
            {
              "id": "1",
              "reps": 1,
              "weight": 0
            },
            {
              "id": "2",
              "reps": 1,
              "weight": 0
            },
            {
              "id": "3",
              "reps": 1,
              "weight": 0
            }
          ]
        },
        {
          "id": "2",
          "name": "Russian Twists",
          "sets": [
            {
              "id": "1",
              "reps": 20,
              "weight": 5
            },
            {
              "id": "2",
              "reps": 20,
              "weight": 5
            },
            {
              "id": "3",
              "reps": 20,
              "weight": 5
            }
          ]
        }
      ]
    }
  ];

  try {
    await writeJsonFile(workoutsPath, initialWorkouts);
    res.status(200).json({ message: 'Database recovered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error recovering database', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
});