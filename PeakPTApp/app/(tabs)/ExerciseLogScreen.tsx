import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation, useRoute } from '@react-navigation/native';
import { agent, CompletedExercise } from '@/api/agent';

type RouteParams = {
  date: string;
};

const ExerciseLogScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { date: routeDate } = route.params as RouteParams;
  const [currentDate, setCurrentDate] = useState(new Date(routeDate));
  const [exercises, setExercises] = useState<CompletedExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentDate(new Date(routeDate));
  }, [routeDate]);

  useEffect(() => {
    fetchExercisesForDate(currentDate);
  }, [currentDate]);

  const handleCameraPress = () => {
    // TODO: Implement camera functionality
    console.log('Camera button pressed');
    // navigation.navigate('FakePhotoScreen' as never);
  };

  const fetchExercisesForDate = async (date: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const dateString = date.toISOString().split('T')[0];
      const workout = await agent.Workouts.details(dateString);
      setExercises(workout.exercises || []); // Use an empty array if exercises is undefined
    } catch (err) {
      console.error('Failed to fetch exercises:', err);
      setError('Failed to load exercises. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    navigation.setParams({ date: newDate.toISOString() } as never);
  };

  const addExercise = () => {
    navigation.navigate('ExerciseLibraryScreen' as never, { date: currentDate.toISOString().split('T')[0] } as never);
  };
  
  const editExercise = (exercise: CompletedExercise) => {
    navigation.navigate('ExerciseLogEntryScreen' as never, { 
      exerciseId: exercise.id, 
      exerciseName: exercise.name, 
      date: currentDate.toISOString().split('T')[0] 
    } as never);
  };

  const initiateDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      try {
        const dateString = currentDate.toISOString().split('T')[0];
        await agent.Workouts.deleteExerciseByDateAndId(dateString, deletingId);
        setExercises(exercises.filter(exercise => exercise.id !== deletingId));
      } catch (err) {
        console.error('Failed to delete exercise:', err);
        setError('Failed to delete exercise. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const renderExercise = ({ item }: { item: CompletedExercise }) => (
    <View style={styles.exerciseContainer}>
      <View style={styles.exerciseHeader}>
        <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>
        <View style={styles.exerciseActions}>
          {deletingId === item.id ? (
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
              <TouchableOpacity onPress={() => initiateDelete(item.id)} style={styles.actionButton}>
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
  );

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
      ) : exercises.length === 0 ? (
        <ThemedText style={styles.emptyText}>No exercises recorded for this date.</ThemedText>
      ) : (
        <FlatList
          data={exercises}
          renderItem={renderExercise}
          keyExtractor={(item) => item.id}
          style={styles.exerciseList}
        />
      )}

      <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress}>
        <Ionicons name="camera" size={30} color="#FFFFFF" />
      </TouchableOpacity>

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
  cameraButton: {
    position: 'absolute',
    right: 20,
    bottom: 100, // Positioned 40px above the add button
    backgroundColor: '#1E90FF',
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

export default ExerciseLogScreen;