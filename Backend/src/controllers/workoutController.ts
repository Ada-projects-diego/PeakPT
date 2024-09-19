import { Request, Response } from 'express';
import Workout, { IWorkout } from '../models/workout';

export const getWorkouts = async (req: Request, res: Response) => {
  try {
    const workouts: IWorkout[] = await Workout.find();
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workouts', error });
  }
};