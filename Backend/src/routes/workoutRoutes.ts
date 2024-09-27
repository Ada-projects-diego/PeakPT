import express from 'express';
import {
  getWorkouts,
  getWorkoutByDate,
  getExerciseByDateAndName,
  getExerciseByDateAndId,
  deleteExerciseByDateAndId,
  deleteExerciseByDateAndName,
  deleteSetsByDateExerciseIdAndSetIds,
  deleteSetsByDateExerciseNameAndSetIds, 
  bulkUpdateSetsByDateAndExerciseName,
  addNewSetToExercise,
  logWorkoutVision
} from '../controllers/workoutController';

const router = express.Router();

router.get('/', getWorkouts);
router.get('/:date', getWorkoutByDate);
router.get('/:date/exercises', getExerciseByDateAndName);
router.get('/:date/exercises/:exerciseId', getExerciseByDateAndId);

router.delete('/:date/exercises/:exerciseId', deleteExerciseByDateAndId);
router.delete('/:date/exercises', deleteExerciseByDateAndName);
router.delete('/:date/exercises/:exerciseId/sets', deleteSetsByDateExerciseIdAndSetIds);
router.delete('/:date/exercises/byname/:exerciseName/sets', deleteSetsByDateExerciseNameAndSetIds);

router.put('/:date/exercises/byname/:exerciseName/sets', bulkUpdateSetsByDateAndExerciseName);
router.post('/:date/exercises/byname/:exerciseName/sets', addNewSetToExercise);
router.post('/log-wk-vision/:date', logWorkoutVision);

export default router;