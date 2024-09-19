import mongoose, { Schema, Document } from 'mongoose';

interface ISet extends Document {
  id: string;
  reps: number;
  weight: number;
}

interface IExercise extends Document {
  id: string;
  name: string;
  sets: ISet[];
}

export interface IWorkout extends Document {
  date: Date;
  name: string;
  exercises: IExercise[];
}

const SetSchema: Schema = new Schema({
  id: { type: String, required: true },
  reps: { type: Number, required: true },
  weight: { type: Number, required: true }
});

const ExerciseSchema: Schema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  sets: [SetSchema]
});

const WorkoutSchema: Schema = new Schema({
  date: { type: Date, required: true },
  name: { type: String, required: true },
  exercises: [ExerciseSchema]
});

export default mongoose.model<IWorkout>('Workout', WorkoutSchema);