import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation } from '@react-navigation/native';

type Exercise = {
  id: string;
  name: string;
  sets: Array<{ reps: number; weight: number }>;
};

const ExerciseLogScreen = () => {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: '1',
      name: 'Bench Press',
      sets: [
        { reps: 10, weight: 135 },
        { reps: 8, weight: 155 },
        { reps: 6, weight: 175 },
      ],
    },
    {
      id: '2',
      name: 'Squats',
      sets: [
        { reps: 12, weight: 185 },
        { reps: 10, weight: 205 },
        { reps: 8, weight: 225 },
      ],
    },
  ]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const addExercise = () => {
    navigation.navigate('ExerciseLibraryScreen' as never);
  };

  const editExercise = (exercise: Exercise) => {
    navigation.navigate('ExerciseLogEntryScreen' as never, { exercise } as never);
  };

  const initiateDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      setExercises(exercises.filter(exercise => exercise.id !== deletingId));
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
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
          <ThemedText style={styles.setText}>{set.weight} lbs</ThemedText>
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

      <FlatList
        data={exercises}
        renderItem={renderExercise}
        keyExtractor={(item) => item.id}
        style={styles.exerciseList}
      />

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
});

export default ExerciseLogScreen;