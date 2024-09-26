import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
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

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity 
      style={styles.exerciseItem}
      onPress={() => navigation.navigate('ExerciseLogEntryScreen' as never, { 
        exerciseId: item._id, 
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
        keyExtractor={item => item._id}
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
});

export default ExerciseLibraryScreen;