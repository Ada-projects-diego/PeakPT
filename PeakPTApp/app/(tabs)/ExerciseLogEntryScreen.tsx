import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type ExerciseSet = {
  id: string;
  weight: string;
  reps: string;
};

const ExerciseLogEntryScreen = () => {
  const exerciseName = "Push up";
  const [weight, setWeight] = useState('2');
  const [reps, setReps] = useState('10');
  const [sets, setSets] = useState<ExerciseSet[]>([]);
  const [selectedSets, setSelectedSets] = useState<Set<string>>(new Set());

  const changeValue = (setter: React.Dispatch<React.SetStateAction<string>>, value: string, increment: number) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const newValue = Math.max(0, numValue + increment);
      setter(newValue.toString());
    }
  };

  const handleSave = () => {
    const newSet: ExerciseSet = { id: Date.now().toString(), weight, reps };
    setSets(prevSets => [...prevSets, newSet]);
    console.log('API Request:', { exerciseName, set: newSet, action: 'add' });
    setWeight('2');
    setReps('10');
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

  const handleUpdate = () => {
    setSets(prevSets =>
      prevSets.map(set =>
        selectedSets.has(set.id) ? { ...set, weight, reps } : set
      )
    );
    console.log('API Request:', { exerciseName, sets: Array.from(selectedSets), weight, reps, action: 'update' });
    setSelectedSets(new Set());
  };

  const handleDelete = () => {
    setSets(prevSets => prevSets.filter(set => !selectedSets.has(set.id)));
    console.log('API Request:', { exerciseName, sets: Array.from(selectedSets), action: 'delete' });
    setSelectedSets(new Set());
  };

  const toggleSetSelection = (id: string) => {
    setSelectedSets(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  const renderSet = ({ item, index }: { item: ExerciseSet; index: number }) => (
    <TouchableOpacity
      style={[
        styles.setItem,
        selectedSets.has(item.id) && styles.selectedSetItem
      ]}
      onPress={() => toggleSetSelection(item.id)}
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
        {selectedSets.size > 0 ? (
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
        keyExtractor={item => item.id}
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