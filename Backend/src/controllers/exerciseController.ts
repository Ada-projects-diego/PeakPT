import { Request, Response } from 'express';
import Exercise, { IExercise } from '../models/exercise';
import { logger } from '../middleware/loggingMiddleware';

export const getAllExercises = async (req: Request, res: Response) => {
  try {
    const exercises = await Exercise.find();
    logger.info('Retrieved all exercises', { count: exercises.length });
    res.json(exercises);
  } catch (error) {
    logger.error('Error retrieving exercises', { error });
    res.status(500).json({ message: 'Error retrieving exercises' });
  }
};

export const createExercise = async (req: Request, res: Response) => {
  try {
    const newExercise = new Exercise(req.body);
    const savedExercise = await newExercise.save();
    logger.info('Created new exercise', { exercise: savedExercise });
    res.status(201).json(savedExercise);
  } catch (error) {
    logger.error('Error creating exercise', { error, body: req.body });
    res.status(400).json({ message: 'Error creating exercise' });
  }
};

export const getExerciseById = async (req: Request, res: Response) => {
  try {
    const exercise = await Exercise.findOne({ id: req.params.id });
    if (exercise) {
      logger.info('Retrieved exercise by ID', { id: req.params.id, exercise });
      res.json(exercise);
    } else {
      logger.warn('Exercise not found', { id: req.params.id });
      res.status(404).json({ message: 'Exercise not found' });
    }
  } catch (error) {
    logger.error('Error fetching exercise', { error, id: req.params.id });
    res.status(500).json({ message: 'Error fetching exercise' });
  }
};

export const updateExercise = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const updatedExercise = await Exercise.findOneAndUpdate(
      { id: req.params.id },
      { name },
      { new: true }
    );
    if (updatedExercise) {
      logger.info('Updated exercise', { id: req.params.id, updatedExercise });
      res.json(updatedExercise);
    } else {
      logger.warn('Exercise not found for update', { id: req.params.id });
      res.status(404).json({ message: 'Exercise not found' });
    }
  } catch (error) {
    logger.error('Error updating exercise', { error, id: req.params.id, body: req.body });
    res.status(500).json({ message: 'Error updating exercise' });
  }
};

export const deleteExercise = async (req: Request, res: Response) => {
  try {
    const deletedExercise = await Exercise.findOneAndDelete({ id: req.params.id });
    if (deletedExercise) {
      logger.info('Deleted exercise', { id: req.params.id, deletedExercise });
      res.json({ message: 'Exercise deleted successfully' });
    } else {
      logger.warn('Exercise not found for deletion', { id: req.params.id });
      res.status(404).json({ message: 'Exercise not found' });
    }
  } catch (error) {
    logger.error('Error deleting exercise', { error, id: req.params.id });
    res.status(500).json({ message: 'Error deleting exercise' });
  }
};