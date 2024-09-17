import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
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
  },
};