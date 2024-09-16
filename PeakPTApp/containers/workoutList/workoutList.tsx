import React, { useState } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';

type Exercise = {
  name: string;
  reps: number;
  sets: number;
};

type Workout = {
  id: string;
  date: string;
  exercises: Exercise[];
};

// Dummy data
const dummyWorkouts: Workout[] = [
  {
    id: '1',
    date: '2023-09-15',
    exercises: [
      { name: 'Squats', reps: 10, sets: 3 },
      { name: 'Bench Press', reps: 8, sets: 4 },
    ],
  },
  {
    id: '2',
    date: '2023-09-13',
    exercises: [
      { name: 'Deadlift', reps: 5, sets: 5 },
      { name: 'Pull-ups', reps: 8, sets: 3 },
    ],
  },
  {
    id: '3',
    date: '2023-09-01',
    exercises: [
      { name: 'Running', reps: 1, sets: 1 },
    ],
  },
];

const WorkoutItem = ({ workout }: { workout: Workout }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <TouchableOpacity 
      style={styles.workoutItem} 
      onPress={() => setIsExpanded(!isExpanded)}
    >
      {isExpanded ? (
        workout.exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseItem}>
            <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
            <ThemedText style={styles.exerciseDetails}>
              {exercise.sets} sets x {exercise.reps} reps
            </ThemedText>
          </View>
        ))
      ) : (
        <ThemedText style={styles.exerciseSummary}>
          {workout.exercises.length} exercise(s)
        </ThemedText>
      )}
    </TouchableOpacity>
  );
};

export const WorkoutList = () => {
  // Group workouts by date
  const groupedWorkouts = dummyWorkouts.reduce((acc, workout) => {
    if (!acc[workout.date]) {
      acc[workout.date] = [];
    }
    acc[workout.date].push(workout);
    return acc;
  }, {} as Record<string, Workout[]>);

  const sortedDates = Object.keys(groupedWorkouts).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={sortedDates}
        renderItem={({ item: date }) => (
          <View>
            <ThemedText style={styles.dateHeader}>{date}</ThemedText>
            {groupedWorkouts[date].map((workout) => (
              <WorkoutItem key={workout.id} workout={workout} />
            ))}
          </View>
        )}
        keyExtractor={item => item}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No workouts recorded yet.</ThemedText>
        }
      />
      <TouchableOpacity style={styles.addButton} onPress={() => console.log('Add new workout')}>
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#121212',
  },
  dateHeader: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: '#1E1E1E',
  },
  workoutItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  exerciseItem: {
    marginTop: 5,
  },
  exerciseName: {
    color: '#ffffff',
    fontSize: 14,
  },
  exerciseDetails: {
    color: '#999',
    fontSize: 12,
  },
  exerciseSummary: {
    color: '#999',
    fontSize: 14,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});