import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Set {
  id: string;
  reps: number;
  weight: number;
}

export interface Exercise {
  id: string;
  name: string;
}

export interface CompletedExercise {
  id: string;
  name: string;
  sets: Set[];
}

export interface Workout {
  date: string;
  name: string;
  exercises: CompletedExercise[];
}

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

export const agent = {
  Workouts: {
    list: (): Promise<Workout[]> => 
      api.get<Workout[]>('/workouts').then(responseBody),
    details: (date: string): Promise<Workout> => 
      api.get<Workout>(`/workouts/${date}`).then(responseBody),
    getExercisesByDate: (date: string, exerciseName: string): Promise<CompletedExercise> =>
      api.get<CompletedExercise>(`/workouts/${date}/exercises`, { params: { name: exerciseName } }).then(responseBody),
    getExerciseByDateAndId: (date: string, exerciseId: string): Promise<CompletedExercise> =>
      api.get<CompletedExercise>(`/workouts/${date}/exercises/${exerciseId}`).then(responseBody),
    deleteExerciseByDateAndId: (date: string, exerciseId: string): Promise<void> =>
      api.delete<void>(`/workouts/${date}/exercises/${exerciseId}`).then(responseBody),
    deleteExerciseByDateAndName: (date: string, exerciseName: string): Promise<void> =>
      api.delete<void>(`/workouts/${date}/exercises`, { params: { name: exerciseName } }).then(responseBody),
    deleteSets: (date: string, exerciseId: string, setIds: string[]): Promise<void> =>
      api.delete<void>(`/workouts/${date}/exercises/${exerciseId}/sets`, { data: { setIds } }).then(responseBody),
    deleteSetsByExerciseName: (date: string, exerciseName: string, setIds: string[]): Promise<void> =>
      api.delete<void>(`/workouts/${date}/exercises/byname/${exerciseName}/sets`, { data: { setIds } }).then(responseBody),
    updateSets: (date: string, exerciseName: string, updates: Array<Partial<Set> & { id: string }>): Promise<CompletedExercise> =>
      api.put<CompletedExercise>(`/workouts/${date}/exercises/byname/${exerciseName}/sets`, { updates }).then(responseBody),
    addSet: (date: string, exerciseName: string, set: Omit<Set, 'id'>): Promise<CompletedExercise> =>
      api.post<CompletedExercise>(`/workouts/${date}/exercises/byname/${exerciseName}/sets`, set).then(responseBody),
  },
  Exercises: {
    list: (): Promise<Exercise[]> => 
      api.get<Exercise[]>('/exercises').then(responseBody),
    details: (id: string): Promise<Exercise> => 
      api.get<Exercise>(`/exercises/${id}`).then(responseBody),
  },
  System: {
    recover: (): Promise<{ message: string }> =>
      api.get<{ message: string }>('/recover').then(responseBody),
  },
};