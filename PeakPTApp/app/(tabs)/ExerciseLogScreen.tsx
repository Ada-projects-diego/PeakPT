import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { agent, CompletedExercise } from '@/api/agent';

type RootStackParamList = {
  ExerciseLogScreen: { date: string };
  ExerciseLibraryScreen: { date: string };
  ExerciseLogEntryScreen: { exerciseId: string; exerciseName: string; date: string };
};

type ExerciseLogScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExerciseLogScreen'>;
type ExerciseLogScreenRouteProp = RouteProp<RootStackParamList, 'ExerciseLogScreen'>;

const ExerciseLogScreen = () => {
  console.log('ExerciseLogScreen: Rendering component');
  const navigation = useNavigation<ExerciseLogScreenNavigationProp>();
  const route = useRoute<ExerciseLogScreenRouteProp>();
  const { date: routeDate } = route.params;
  const [currentDate, setCurrentDate] = useState(new Date(routeDate));
  const [exercises, setExercises] = useState<CompletedExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchExercisesForDate = useCallback(async (date: Date) => {
    console.log('ExerciseLogScreen: Fetching exercises for date', date.toISOString());
    setIsLoading(true);
    setError(null);
    try {
      const dateString = date.toISOString().split('T')[0];
      const workout = await agent.Workouts.details(dateString);
      console.log('ExerciseLogScreen: Fetched workout', JSON.stringify(workout));
      setExercises(workout.exercises || []);
    } catch (err) {
      console.error('ExerciseLogScreen: Failed to load exercises', err);
      setError('Failed to load exercises. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('ExerciseLogScreen: Screen focused, fetching exercises');
      setCurrentDate(new Date(routeDate));
      fetchExercisesForDate(new Date(routeDate));
    }, [routeDate, fetchExercisesForDate])
  );

  const changeDate = useCallback((days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    console.log('ExerciseLogScreen: Changing date to', newDate.toISOString());
    navigation.setParams({ date: newDate.toISOString().split('T')[0] });
  }, [currentDate, navigation]);

  const addExercise = useCallback(() => {
    console.log('ExerciseLogScreen: Navigating to ExerciseLibraryScreen');
    navigation.navigate('ExerciseLibraryScreen', { date: currentDate.toISOString().split('T')[0] });
  }, [navigation, currentDate]);

  const editExercise = useCallback((exercise: CompletedExercise) => {
    console.log('ExerciseLogScreen: Navigating to ExerciseLogEntryScreen for exercise', exercise._id);
    navigation.navigate('ExerciseLogEntryScreen', {
      exerciseId: exercise._id,
      exerciseName: exercise.name,
      date: currentDate.toISOString().split('T')[0]
    });
  }, [navigation, currentDate]);

  const initiateDelete = useCallback((id: string) => {
    console.log('ExerciseLogScreen: Initiating delete for exercise', id);
    setDeletingId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deletingId) {
      console.log('ExerciseLogScreen: Confirming delete for exercise', deletingId);
      try {
        const dateString = currentDate.toISOString().split('T')[0];
        await agent.Workouts.deleteExerciseByDateAndId(dateString, deletingId);
        setExercises(prevExercises => prevExercises.filter(exercise => exercise._id !== deletingId));
        console.log('ExerciseLogScreen: Exercise deleted successfully');
      } catch (err) {
        console.error('ExerciseLogScreen: Failed to delete exercise', err);
        setError('Failed to delete exercise. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  }, [deletingId, currentDate]);

  const cancelDelete = useCallback(() => {
    console.log('ExerciseLogScreen: Cancelling delete');
    setDeletingId(null);
  }, []);

  const renderExercise = useCallback(({ item }: { item: CompletedExercise }) => (
    <View style={styles.exerciseContainer}>
      <View style={styles.exerciseHeader}>
        <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>
        <View style={styles.exerciseActions}>
          {deletingId === item._id ? (
            <>
              <TouchableOpacity onPress={confirmDelete} style={styles.actionButton}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#4CD964" />
              </TouchableOpacity>
              <TouchableOpacity onPress={cancelDelete} style={styles.actionButton}>
                <Ionicons name="close-circle-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => editExercise(item)} style={styles.actionButton}>
                <Ionicons name="create-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => initiateDelete(item._id)} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      {item.sets.map((set, index) => (
        <View key={index} style={styles.setContainer}>
          <ThemedText style={styles.setText}>Set {index + 1}:</ThemedText>
          <ThemedText style={styles.setText}>{set.reps} reps</ThemedText>
          <ThemedText style={styles.setText}>{set.weight} kg</ThemedText>
        </View>
      ))}
    </View>
  ), [deletingId, confirmDelete, cancelDelete, editExercise, initiateDelete]);

  const memoizedExercises = useMemo(() => exercises, [exercises]);

  console.log('ExerciseLogScreen: Rendering', memoizedExercises.length, 'exercises');

  return (
    <ThemedView style={styles.container}>
      <View style={styles.dateContainer}>
        <TouchableOpacity onPress={() => changeDate(-1)}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText style={styles.dateText}>
          {currentDate.toDateString()}
        </ThemedText>
        <TouchableOpacity onPress={() => changeDate(1)}>
          <Ionicons name="chevron-forward" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : memoizedExercises.length === 0 ? (
        <ThemedText style={styles.emptyText}>No exercises recorded for this date.</ThemedText>
      ) : (
        <FlatList
          data={memoizedExercises}
          renderItem={renderExercise}
          keyExtractor={(item) => item._id}
          style={styles.exerciseList}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={addExercise}>
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
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exerciseList: {
    flex: 1,
  },
  exerciseContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  exerciseActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
  },
  setContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  setText: {
    color: '#B0B0B0',
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
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ExerciseLogScreen;