import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import { agent, Workout, CompletedExercise } from '@/api/agent';

// Define the navigation param list type
type RootStackParamList = {
  ExerciseLogScreen: { date: string };
  // Add other screen params as needed
};

// Utility function for collapsible logging
const collapsibleStringify = (obj: any, depth: number = 0): string => {
  if (depth > 2) return '...'; // Limit depth to prevent overly nested output
  if (typeof obj !== 'object' || obj === null) return JSON.stringify(obj);
  
  if (Array.isArray(obj)) {
    const items = obj.map(item => collapsibleStringify(item, depth + 1));
    return `[${items.join(', ')}]`;
  }
  
  const props = Object.keys(obj).map(key => 
    `${key}: ${collapsibleStringify(obj[key], depth + 1)}`
  );
  return `{${props.join(', ')}}`;
};

export const WorkoutList = () => {
  console.log('WorkoutList: Component rendering');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const fetchWorkouts = useCallback(async () => {
    try {
      console.log('WorkoutList: Fetching workouts...');
      const fetchedWorkouts = await agent.Workouts.list();
      console.log('WorkoutList: Fetched workouts summary:', 
        collapsibleStringify(fetchedWorkouts.map(w => ({ 
          date: w.date, 
          name: w.name, 
          exerciseCount: w.exercises.length 
        }))));
      setWorkouts(fetchedWorkouts);
    } catch (error) {
      console.error('WorkoutList: Failed to fetch workouts:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('WorkoutList: Screen focused, fetching workouts');
      fetchWorkouts();
    }, [fetchWorkouts])
  );

  const handleAddWorkout = () => {
    const today = new Date().toISOString().split('T')[0];
    console.log('WorkoutList: Navigating to ExerciseLogScreen for today:', today);
    navigation.navigate('ExerciseLogScreen', { date: today });
  };

  const renderWorkoutItem = useMemo(() => ({ item }: { item: Workout }) => (
    <WorkoutItem workout={item} navigation={navigation} />
  ), [navigation]);

  console.log(`WorkoutList: Rendering ${workouts.length} workouts`);

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={workouts}
        renderItem={renderWorkoutItem}
        keyExtractor={(item) => item.date}
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

const WorkoutItem = ({ 
  workout, 
  navigation 
}: { 
  workout: Workout; 
  navigation: NavigationProp<RootStackParamList> 
}) => {
  console.log(`WorkoutItem: Rendering workout for ${workout.date}`);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const navigateToExerciseLog = () => {
    console.log('WorkoutItem: Navigating to ExerciseLogScreen for date:', workout.date);
    navigation.navigate('ExerciseLogScreen', { date: workout.date });
  };

  const renderExerciseDetails = (exercise: CompletedExercise) => {
    const setGroups = exercise.sets.reduce((acc, set) => {
      const key = `${set.reps}@${set.weight}`;
      if (!acc[key]) {
        acc[key] = { reps: set.reps, weight: set.weight, count: 1 };
      } else {
        acc[key].count++;
      }
      return acc;
    }, {} as { [key: string]: { reps: number; weight: number; count: number } });

    const details = Object.values(setGroups).map(group => 
      `${group.count}x${group.reps} @ ${group.weight}kg`
    );

    return details.length > 0 ? (
      <View>
        {details.map((detail, index) => (
          <ThemedText key={index} style={styles.exerciseDetailLine}>
            {detail}
          </ThemedText>
        ))}
      </View>
    ) : (
      <ThemedText style={styles.exerciseDetailLine}>No sets recorded</ThemedText>
    );
  };

  console.log(`WorkoutItem: Expanded state for ${workout.date}: ${isExpanded}`);

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
            <View key={`${workout.date}-${exercise.name}-${index}`} style={styles.exerciseItem}>
              <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
              {renderExerciseDetails(exercise)}
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
  exerciseDetailLine: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 2,
  },
});