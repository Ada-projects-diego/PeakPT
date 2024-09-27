import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { agent, Exercise } from '@/api/agent';

type RootStackParamList = {
  ExerciseLibraryScreen: { date: string };
  ExerciseLogEntryScreen: { exerciseId: string; exerciseName: string; date: string };
};

type ExerciseLibraryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExerciseLibraryScreen'>;
type ExerciseLibraryScreenRouteProp = RouteProp<RootStackParamList, 'ExerciseLibraryScreen'>;

const ExerciseLibraryScreen = () => {
  console.log('ExerciseLibraryScreen: Rendering component');
  const navigation = useNavigation<ExerciseLibraryScreenNavigationProp>();
  const route = useRoute<ExerciseLibraryScreenRouteProp>();
  const { date } = route.params;
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchExercises = useCallback(async () => {
    console.log('ExerciseLibraryScreen: Fetching exercises');
    try {
      const data = await agent.Exercises.list();
      console.log(`ExerciseLibraryScreen: Fetched ${data.length} exercises`);
      setExercises(data);
      setIsLoading(false);
    } catch (error) {
      console.error('ExerciseLibraryScreen: Error fetching exercises:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleSearch = useCallback((query: string) => {
    console.log('ExerciseLibraryScreen: Searching for', query);
    setSearchQuery(query);
  }, []);

  const filteredExercises = useMemo(() => {
    console.log('ExerciseLibraryScreen: Filtering exercises');
    return exercises.filter(exercise =>
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [exercises, searchQuery]);

  const renderExerciseItem = useCallback(({ item }: { item: Exercise }) => (
    <TouchableOpacity 
      style={styles.exerciseItem}
      onPress={() => {
        console.log('ExerciseLibraryScreen: Navigating to ExerciseLogEntryScreen for', item.name);
        navigation.navigate('ExerciseLogEntryScreen', { 
          exerciseId: item._id, 
          exerciseName: item.name, 
          date: date 
        });
      }}
    >
      <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>
      <Ionicons name="chevron-forward" size={20} color="#808080" />
    </TouchableOpacity>
  ), [navigation, date]);

  console.log(`ExerciseLibraryScreen: Rendering ${filteredExercises.length} exercises`);

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