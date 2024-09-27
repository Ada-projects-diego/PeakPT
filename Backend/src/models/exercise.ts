import mongoose, { Schema, Document } from 'mongoose';

export interface IExercise extends Document {
  name: string;
}

const ExerciseSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true }
});

export default mongoose.model<IExercise>('Exercise', ExerciseSchema);