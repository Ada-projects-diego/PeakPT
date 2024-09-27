import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { agent, Set } from '@/api/agent';

type RootStackParamList = {
  ExerciseLogEntryScreen: { exerciseId: string; exerciseName: string; date: string };
};

type ExerciseLogEntryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExerciseLogEntryScreen'>;
type ExerciseLogEntryScreenRouteProp = RouteProp<RootStackParamList, 'ExerciseLogEntryScreen'>;

const ExerciseLogEntryScreen = () => {
  console.log('ExerciseLogEntryScreen: Rendering component');
  const navigation = useNavigation<ExerciseLogEntryScreenNavigationProp>();
  const route = useRoute<ExerciseLogEntryScreenRouteProp>();
  const { exerciseId, exerciseName, date } = route.params;

  const [weight, setWeight] = useState('10');
  const [reps, setReps] = useState('10');
  const [sets, setSets] = useState<Set[]>([]);
  const [selectedSets, setSelectedSets] = useState<string[]>([]);

  const fetchExerciseDetails = useCallback(async () => {
    try {
      console.log('ExerciseLogEntryScreen: Fetching exercise details:', date, exerciseId);
      const exercise = await agent.Workouts.getExerciseByDateAndId(date, exerciseId);
      console.log('ExerciseLogEntryScreen: Exercise details:', exercise);
      setSets(exercise.sets);
    } catch (error) {
      console.error('ExerciseLogEntryScreen: Failed to fetch exercise details:', error);
    }
  }, [date, exerciseId]);

  useFocusEffect(
    useCallback(() => {
      fetchExerciseDetails();
    }, [fetchExerciseDetails])
  );

  const changeValue = useCallback((setter: React.Dispatch<React.SetStateAction<string>>, value: string, increment: number) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const newValue = Math.max(0, numValue + increment);
      setter(newValue.toString());
    }
  }, []);

  const handleSave = useCallback(async () => {
    try {
      console.log('ExerciseLogEntryScreen: Saving new set');
      const newSet: Omit<Set, '_id'> = { 
        reps: parseInt(reps), 
        weight: parseFloat(weight) 
      };
      const updatedExercise = await agent.Workouts.addSet(date, exerciseName, newSet);
      console.log('ExerciseLogEntryScreen: Updated exercise received:', updatedExercise);
      if (Array.isArray(updatedExercise.sets)) {
        setSets(updatedExercise.sets);
      } else {
        console.error('ExerciseLogEntryScreen: Unexpected response structure:', updatedExercise);
      }
      console.log('ExerciseLogEntryScreen: New set saved successfully');
    } catch (error) {
      console.error('ExerciseLogEntryScreen: Failed to save set:', error);
    }
  }, [date, exerciseName, reps, weight]);

  const handleClear = useCallback(() => {
    console.log('ExerciseLogEntryScreen: Clearing input');
    setWeight('0');
    setReps('0');
  }, []);

  const handleInputChange = useCallback((setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setter(numValue.toString());
    } else if (value === '') {
      setter('');
    }
  }, []);

  const handleUpdate = useCallback(async () => {
    try {
      console.log('ExerciseLogEntryScreen: Updating sets');
      const updates = selectedSets.map(id => ({
        id,
        reps: parseInt(reps),
        weight: parseFloat(weight)
      }));
      const updatedExercise = await agent.Workouts.updateSets(date, exerciseName, updates);
      
      setSets(prevSets => prevSets.map(set => {
        const updatedSet = updatedExercise.sets.find(s => s._id === set._id);
        return updatedSet || set;
      }));
      
      setSelectedSets([]);
      console.log('ExerciseLogEntryScreen: Sets updated successfully');
    } catch (error) {
      console.error('ExerciseLogEntryScreen: Failed to update sets:', error);
    }
  }, [date, exerciseName, reps, weight, selectedSets]);

  const handleDelete = useCallback(async () => {
    try {
      console.log('ExerciseLogEntryScreen: Deleting sets');
      await agent.Workouts.deleteSets(date, exerciseId, selectedSets);
      setSets(sets => sets.filter(set => !selectedSets.includes(set._id)));
      setSelectedSets([]);
      console.log('ExerciseLogEntryScreen: Sets deleted successfully');
    } catch (error) {
      console.error('ExerciseLogEntryScreen: Failed to delete sets:', error);
    }
  }, [date, exerciseId, selectedSets]);

  const toggleSetSelection = useCallback((id: string) => {
    setSelectedSets(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(setId => setId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  }, []);

  const renderSet = useCallback(({ item, index }: { item: Set; index: number }) => (
    <TouchableOpacity
      style={[
        styles.setItem,
        selectedSets.includes(item._id) && styles.selectedSetItem
      ]}
      onPress={() => toggleSetSelection(item._id)}
      key={`${item._id}-${index}`}
    >
      <ThemedText style={styles.setText}>
        {index + 1}   {item.weight} kgs   {item.reps} reps
      </ThemedText>
    </TouchableOpacity>
  ), [selectedSets, toggleSetSelection]);

  const isActionDisabled = useMemo(() => parseInt(reps) === 0, [reps]);

  console.log('ExerciseLogEntryScreen: Rendering', sets.length, 'sets');

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>{exerciseName}</ThemedText>
      
      {/* Weight Input */}
      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>WEIGHT (kgs)</ThemedText>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.button} onPress={() => changeValue(setWeight, weight, -1)}>
            <Ionicons name="remove" size={24} color="#fff" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={(value) => handleInputChange(setWeight, value)}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={() => changeValue(setWeight, weight, 1)}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Reps Input */}
      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>REPS</ThemedText>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.button} onPress={() => changeValue(setReps, reps, -1)}>
            <Ionicons name="remove" size={24} color="#fff" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={reps}
            onChangeText={(value) => handleInputChange(setReps, value)}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={() => changeValue(setReps, reps, 1)}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {selectedSets.length > 0 ? (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.updateButton, isActionDisabled && styles.disabledButton]}
              onPress={handleUpdate}
              disabled={isActionDisabled}
            >
              <ThemedText style={styles.buttonText}>UPDATE</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
              <ThemedText style={styles.buttonText}>DELETE</ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.saveButton, isActionDisabled && styles.disabledButton]}
              onPress={handleSave}
              disabled={isActionDisabled}
            >
              <ThemedText style={styles.buttonText}>SAVE</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={handleClear}>
              <ThemedText style={styles.buttonText}>CLEAR</ThemedText>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Set List */}
      <FlatList
        data={sets}
        renderItem={renderSet}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        style={styles.setList}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2C2C2C',
    borderRadius: 10,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 50,
    textAlign: 'center',
    fontSize: 20,
    color: '#FFFFFF',
  },
  button: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3A3A3A',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  clearButton: {
    backgroundColor: '#2196F3',
    marginLeft: 10,
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#666666',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  setList: {
    flex: 1,
  },
  setItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedSetItem: {
    backgroundColor: '#2C2C2C',
  },
  setText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default ExerciseLogEntryScreen;