import React, { useState } from 'react';
import { StyleSheet, View, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type Exercise = {
  id: string;
  name: string;
  workoutCount: number;
};

const initialExercises: Exercise[] = [
  { id: '1', name: 'Ab Wheel Rollout', workoutCount: 0 },
  { id: '2', name: 'Banana', workoutCount: 3 },
  { id: '3', name: 'Cable Crunch', workoutCount: 0 },
  { id: '4', name: 'Crunch', workoutCount: 0 },
  { id: '5', name: 'Crunch Machine', workoutCount: 0 },
  { id: '6', name: 'Decline Crunch', workoutCount: 0 },
  { id: '7', name: 'Dragon Flag', workoutCount: 7 },
  { id: '8', name: 'Hanging Knee Raise', workoutCount: 1 },
  { id: '9', name: 'Hanging Leg Mid Bar', workoutCount: 0 },
];

const ExerciseLibraryScreen = () => {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filteredExercises = initialExercises.filter(exercise =>
      exercise.name.toLowerCase().includes(query.toLowerCase())
    );
    setExercises(filteredExercises);
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity 
      style={styles.exerciseItem}
      onPress={() => router.push({
        pathname: '/ExerciseLogEntryScreen',
        params: { exerciseName: item.name }
      })}
    >
      <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>
      <View style={styles.workoutCountContainer}>
        <ThemedText style={styles.workoutCount}>{item.workoutCount} workouts</ThemedText>
        <Ionicons name="chevron-forward" size={20} color="#808080" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
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
        data={exercises}
        renderItem={renderExerciseItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  workoutCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutCount: {
    fontSize: 14,
    color: '#808080',
    marginRight: 5,
  },
});

export default ExerciseLibraryScreen;