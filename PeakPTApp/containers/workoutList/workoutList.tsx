import React, { useState } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type Exercise = {
  name: string;
  sets: number;
  reps: number;
  weight: number;
};

type Workout = {
  id: string;
  date: Date;
  name: string;
  exercises: Exercise[];
};

// Updated dummy data
const dummyWorkouts: Workout[] = [
  {
    id: '1',
    date: new Date(2024, 7, 15), // Month is 0-indexed
    name: 'Upper body workout',
    exercises: [
      { name: 'Bent Over Row', sets: 3, reps: 5, weight: 43 },
      { name: 'Bench Press', sets: 3, reps: 5, weight: 20.5 },
      { name: 'Pull up', sets: 3, reps: 5, weight: 0 },
    ],
  },
  {
    id: '2',
    date: new Date(2024, 7, 17), // Month is 0-indexed
    name: 'Leg day workout',
    exercises: [
      { name: 'Squats', sets: 4, reps: 8, weight: 70 },
      { name: 'Deadlifts', sets: 3, reps: 5, weight: 85 },
    ],
  },
  {
    id: '3',
    date: new Date(2024, 7, 19), // Month is 0-indexed
    name: 'Core workout',
    exercises: [
      { name: 'Rolling Planks', sets: 3, reps: 1, weight: 0},
      { name: 'Russian Twists', sets: 3, reps: 20, weight: 5 },
    ],
  },
];

const WorkoutItem = ({ workout }: { workout: Workout }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigation = useNavigation();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const navigateToExerciseLog = () => {
    navigation.navigate('ExerciseLogScreen', { date: workout.date.toISOString() });
  };

  return (
    <View style={styles.workoutContainer}>
      <View style={styles.workoutHeader}>
        <TouchableOpacity onPress={navigateToExerciseLog}>
          <ThemedText style={styles.workoutDate}>{formatDate(workout.date)}</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.workoutName}>{workout.name}</ThemedText>
      </View>
      
      <TouchableOpacity 
        style={styles.workoutSummary}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <ThemedText style={styles.exerciseCount}>
          {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
        </ThemedText>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="#B0B0B0" 
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.exercisesContainer}>
          {workout.exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseItem}>
              <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
              <ThemedText style={styles.exerciseDetails}>
                {exercise.sets} x {exercise.reps} @ {exercise.weight} kg
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export const WorkoutList = () => {
  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={dummyWorkouts}
        renderItem={({ item: workout }) => (
          <WorkoutItem workout={workout} />
        )}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No workouts recorded yet.</ThemedText>
        }
      />
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => {
          const navigation = useNavigation();
          navigation.navigate('ExerciseLogScreen', { date: new Date().toISOString() });
        }}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  workoutContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  workoutDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  workoutName: {
    fontSize: 14,
    color: '#B0B0B0',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  workoutSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseCount: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  exercisesContainer: {
    marginTop: 10,
  },
  exerciseItem: {
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#B0B0B0',
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