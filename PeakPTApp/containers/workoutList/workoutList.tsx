import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { agent, Workout, Exercise } from '@/api/agent';

export const WorkoutList = () => {
  const navigation = useNavigation();
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        console.log('Fetching workouts...');
        const fetchedWorkouts = await agent.Workouts.list();
        console.log('Fetched workouts:', JSON.stringify(fetchedWorkouts, null, 2));
        setWorkouts(fetchedWorkouts);
      } catch (error) {
        console.error('Failed to fetch workouts:', error);
      }
    }; // TODO: move this into it's own file
  
    fetchWorkouts();
  }, []);

  const handleAddWorkout = () => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    console.log('Navigating to ExerciseLogScreen for today:', today);
    navigation.navigate('ExerciseLogScreen' as [never, never], { date: today } as [never, never]);
  };

  const renderWorkoutItem = ({ item: workout }: { item: Workout }) => (
    <WorkoutItem workout={workout} navigation={navigation} />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={workouts}
        renderItem={renderWorkoutItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No workouts recorded yet.</ThemedText>
        }
      />
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={handleAddWorkout}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </ThemedView>
  );
};

const WorkoutItem = ({ workout, navigation }: { workout: Workout; navigation: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const navigateToExerciseLog = () => {
    console.log('Navigating to ExerciseLogScreen for date:', workout.date);
    navigation.navigate('ExerciseLogScreen' as never, { date: workout.date } as never);
  };

  const renderExerciseDetails = (exercise: Exercise) => {
    const totalSets = exercise.sets.length;
    const lastSet = exercise.sets[totalSets - 1];
    return `${totalSets} x ${lastSet.reps} @ ${lastSet.weight} kg`;
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
                {renderExerciseDetails(exercise)}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </View>
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