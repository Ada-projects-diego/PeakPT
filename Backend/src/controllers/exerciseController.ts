import { Request, Response } from 'express';
import Exercise, { IExercise } from '../models/exercise';

export const getAllExercises = async (req: Request, res: Response) => {
  try {
    const exercises: IExercise[] = await Exercise.find();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exercises', error });
  }
};

export const getExerciseById = async (req: Request, res: Response) => {
  try {
    const exercise = await Exercise.findOne({ id: req.params.id });
    if (exercise) {
      res.json(exercise);
    } else {
      res.status(404).json({ message: 'Exercise not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exercise', error });
  }
};

export const createExercise = async (req: Request, res: Response) => {
  try {
    const { id, name } = req.body;
    const newExercise = new Exercise({ id, name });
    const savedExercise = await newExercise.save();
    res.status(201).json(savedExercise);
  } catch (error) {
    res.status(500).json({ message: 'Error creating exercise', error });
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
      res.json(updatedExercise);
    } else {
      res.status(404).json({ message: 'Exercise not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating exercise', error });
  }
};

export const deleteExercise = async (req: Request, res: Response) => {
  try {
    const deletedExercise = await Exercise.findOneAndDelete({ id: req.params.id });
    if (deletedExercise) {
      res.json({ message: 'Exercise deleted successfully' });
    } else {
      res.status(404).json({ message: 'Exercise not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting exercise', error });
  }
};