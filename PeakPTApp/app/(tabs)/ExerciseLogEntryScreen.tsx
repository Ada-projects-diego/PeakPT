import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const ExerciseLogEntryScreen = () => {
  const router = useRouter();
  const exerciseName = "Push up";
  const [weight, setWeight] = useState('0');
  const [reps, setReps] = useState('0');

  const changeValue = (setter: React.Dispatch<React.SetStateAction<string>>, value: string, increment: number) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const newValue = Math.max(0, numValue + increment);
      setter(newValue.toString());
    }
  };

  const handleSave = () => {
    console.log('Saving:', { exerciseName, weight, reps });
    router.back();
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
            onFocus={() => setWeight('')}
            onBlur={() => weight === '' && setWeight('0')}
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
            onFocus={() => setReps('')}
            onBlur={() => reps === '' && setReps('0')}
          />
          <TouchableOpacity style={styles.button} onPress={() => changeValue(setReps, reps, 1)}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
          <ThemedText style={styles.buttonText}>SAVE</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={handleClear}>
          <ThemedText style={styles.buttonText}>CLEAR</ThemedText>
        </TouchableOpacity>
      </View>
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
    marginTop: 20,
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExerciseLogEntryScreen;