import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { agent, Exercise } from '@/api/agent';

type RouteParams = {
  date: string;
};

const ExerciseLibraryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { date } = route.params as RouteParams;
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddExerciseModalVisible, setIsAddExerciseModalVisible] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const data = await agent.Exercises.list();
      setExercises(data);
      setFilteredExercises(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = exercises.filter(exercise =>
      exercise.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredExercises(filtered);
  };

  const handleAddExercise = async () => {
    if (newExerciseName.trim()) {
      try {
        const newExercise = await agent.Exercises.create({ name: newExerciseName.trim() });
        setExercises([...exercises, newExercise]);
        setFilteredExercises([...filteredExercises, newExercise]);
        setNewExerciseName('');
        setIsAddExerciseModalVisible(false);
      } catch (error) {
        console.error('Error adding exercise:', error);
      }
    }
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity 
      style={styles.exerciseItem}
      onPress={() => navigation.navigate('ExerciseLogEntryScreen' as never, { 
        exerciseId: item.id, 
        exerciseName: item.name, 
        date: date 
      } as never)}
    >
      <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>
      <Ionicons name="chevron-forward" size={20} color="#808080" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Exercise Library</ThemedText>
        <TouchableOpacity onPress={() => setIsAddExerciseModalVisible(true)}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#808080" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises"
          placeholderTextColor="#808080"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      <FlatList
        data={filteredExercises}
        renderItem={renderExerciseItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
      <Modal
        visible={isAddExerciseModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Add New Exercise</ThemedText>
            <TextInput
              style={styles.modalInput}
              placeholder="Exercise name"
              placeholderTextColor="#808080"
              value={newExerciseName}
              onChangeText={setNewExerciseName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAddExerciseModalVisible(false)}
              >
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddExercise}
              >
                <ThemedText>Add</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1E1E1E',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    borderRadius: 10,
    margin: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  exerciseName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#2C2C2C',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#FFFFFF',
  },
  modalInput: {
    backgroundColor: '#3C3C3C',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#4C4C4C',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
});

export default ExerciseLibraryScreen;