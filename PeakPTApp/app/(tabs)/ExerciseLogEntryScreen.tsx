import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation, useRoute } from '@react-navigation/native';
import { agent, Set } from '@/api/agent';

// Good page to talk about, especially the callback function stuff
// TODO: problem with ids being undefined but needed to be passed to the backend

type RouteParams = {
  exerciseId: string;
  exerciseName: string;
  date: string;
};

const ExerciseLogEntryScreen = () => {
  const navigation = useNavigation(); // In case we implement backtracking
  const route = useRoute();
  const { exerciseId, exerciseName, date } = route.params as RouteParams;

  const [weight, setWeight] = useState('10');
  const [reps, setReps] = useState('10');
  const [sets, setSets] = useState<Set[]>([]);
  const [selectedSets, setSelectedSets] = useState<string[]>([]);

  const fetchExerciseDetails = useCallback(async () => {
    try {
      console.log('Fetching exercise details:', date, exerciseId);
      const exercise = await agent.Workouts.getExerciseByDateAndId(date, exerciseId);
      console.log('Exercise details:', exercise);
      setSets(exercise.sets);
    } catch (error) {
      console.error('Failed to fetch exercise details:', error);
    }
  }, [date, exerciseId]);
  
  useEffect(() => {
    fetchExerciseDetails();
  }, [fetchExerciseDetails]);

  const changeValue = (setter: React.Dispatch<React.SetStateAction<string>>, value: string, increment: number) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const newValue = Math.max(0, numValue + increment);
      setter(newValue.toString());
    }
  };

  const handleSave = async () => {
    try {
      const newSet: Omit<Set, "id"> = { reps: parseInt(reps), weight: parseFloat(weight) };
      const updatedExercise = await agent.Workouts.addSet(date, exerciseName, newSet);
      setSets(updatedExercise.sets);
      setWeight(weight);
      setReps(reps);
    } catch (error) {
      console.error('Failed to save set:', error);
    }
  };

  const handleClear = () => {
    setWeight('0');
    setReps('0');
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setter(numValue.toString());
    } else if (value === '') {
      setter('');
    }
  };

  const handleUpdate = async () => {
    try {
      const updates = selectedSets.map(id => ({
        id,
        reps: parseInt(reps),
        weight: parseFloat(weight)
      }));
      const updatedExercise = await agent.Workouts.updateSets(date, exerciseName, updates);
      setSets(updatedExercise.sets);
      setSelectedSets([]);
    } catch (error) {
      console.error('Failed to update sets:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await agent.Workouts.deleteSets(date, exerciseId, selectedSets);
      setSets(sets.filter(set => !selectedSets.includes(set._id)));
      setSelectedSets([]);
    } catch (error) {
      console.error('Failed to delete sets:', error);
    }
  };

  const toggleSetSelection = (id: string) => {
    setSelectedSets(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(setId => setId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };


  const renderSet = ({ item, index }: { item: Set; index: number }) => (
    <TouchableOpacity
      style={[
        styles.setItem,
        selectedSets.includes(item._id) && styles.selectedSetItem
      ]}
      onPress={() => toggleSetSelection(item._id)}
      key={`${item._id}-${index}`} // Add this line
    >
      <ThemedText style={styles.setText}>
        {index + 1}   {item.weight} kgs   {item.reps} reps
      </ThemedText>
    </TouchableOpacity>
  );

  const isActionDisabled = parseInt(reps) === 0;

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>{exerciseName}</ThemedText>
      
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