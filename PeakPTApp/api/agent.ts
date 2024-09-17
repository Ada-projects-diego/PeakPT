import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Exercise {
  id: string;
  name: string;
  sets: Array<{ reps: number; weight: number }>;
}

export interface Workout {
  id: string;
  date: string;
  name: string;
  exercises: Exercise[];
}

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

export const agent = {
  Workouts: {
    list: (): Promise<Workout[]> => 
      api.get<Workout[]>('/workouts').then(responseBody),
    details: (id: string): Promise<Workout> => 
      api.get<Workout>(`/workouts/${id}`).then(responseBody),
    create: (workout: Omit<Workout, 'id'>): Promise<Workout> => 
      api.post<Workout>('/workouts', workout).then(responseBody),
    update: (id: string, workout: Partial<Workout>): Promise<Workout> => 
      api.put<Workout>(`/workouts/${id}`, workout).then(responseBody),
    delete: (id: string): Promise<void> => 
      api.delete<void>(`/workouts/${id}`).then(responseBody),
    getExercisesByDate: (date: string): Promise<Exercise[]> =>
      api.get<Exercise[]>(`/workouts/date/${date}`).then(responseBody),
    addExercise: (date: string, exercise: Omit<Exercise, 'id'>): Promise<Exercise> =>
      api.post<Exercise>(`/workouts/date/${date}/exercises`, exercise).then(responseBody),
    updateExercise: (date: string, exerciseId: string, exercise: Partial<Exercise>): Promise<Exercise> =>
      api.put<Exercise>(`/workouts/date/${date}/exercises/${exerciseId}`, exercise).then(responseBody),
    deleteExercise: (date: string, exerciseId: string): Promise<void> =>
      api.delete<void>(`/workouts/date/${date}/exercises/${exerciseId}`).then(responseBody),
  },
};