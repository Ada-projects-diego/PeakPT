import mongoose, { Schema, Document } from 'mongoose';

export interface ISet extends Document {
  reps: number;
  weight: number;
}

export interface ICompletedExercise extends Document {
  name: string;
  sets: ISet[];
}

export interface IWorkout extends Document {
  date: Date;
  name: string;
  exercises: ICompletedExercise[];
}

const SetSchema: Schema = new Schema({
  reps: { type: Number, required: true },
  weight: { type: Number, required: true }
}, { _id: true });

const CompletedExerciseSchema: Schema = new Schema({
  name: { type: String, required: true },
  sets: [SetSchema]
});

const WorkoutSchema: Schema = new Schema({
  date: { type: Date, required: true },
  name: { type: String, required: true },
  exercises: [CompletedExerciseSchema]
});

export default mongoose.model<IWorkout>('Workout', WorkoutSchema);