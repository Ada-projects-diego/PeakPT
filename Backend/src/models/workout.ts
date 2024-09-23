import mongoose, { Schema, Document } from 'mongoose';

export interface ISet extends Document {
  id: string;
  reps: number;
  weight: number;
}

export interface IExercise extends Document {
  id: string;
  name: string;
  sets: ISet[];
}

export interface IWorkout extends Document {
  date: Date;
  name: string;
  exercises: IExercise[];
}

export const SetSchema: Schema = new Schema({
  id: { type: String, required: true },
  reps: { type: Number, required: true },
  weight: { type: Number, required: true }
});

export const ExerciseSchema: Schema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  sets: [SetSchema]
});

export const WorkoutSchema: Schema = new Schema({
  date: { type: Date, required: true },
  name: { type: String, required: true },
  exercises: [ExerciseSchema]
});

const Workout = mongoose.model<IWorkout>('Workout', WorkoutSchema);

export default Workout;