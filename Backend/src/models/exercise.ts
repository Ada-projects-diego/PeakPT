import mongoose, { Schema, Document } from 'mongoose';

export interface IExercise extends Document {
  id: string;
  name: string;
}

const ExerciseSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true }
});

export default mongoose.model<IExercise>('Exercise', ExerciseSchema);