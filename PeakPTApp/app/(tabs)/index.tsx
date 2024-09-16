import React, { useState } from 'react';
import { StyleSheet, Switch, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CalendarView } from '@/components/CalendarView';
import { WorkoutList } from '@/containers/workoutList/WorkoutList';

const StartTrackingButton = () => (
  <TouchableOpacity style={styles.button}>
    <ThemedText style={styles.buttonText}>Start Tracking</ThemedText>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const [isCalendarView, setIsCalendarView] = useState(false);
  const [hasWorkouts, setHasWorkouts] = useState(true); // Changed to true for testing

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Welcome to Your Workout Tracker</ThemedText>
      
      <View style={styles.toggleContainer}>
        <Ionicons name="list" size={24} color={!isCalendarView ? "#007AFF" : "#666"} />
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isCalendarView ? "#007AFF" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setIsCalendarView(!isCalendarView)}
          value={isCalendarView}
          style={styles.switch}
        />
        <Ionicons name="calendar" size={24} color={isCalendarView ? "#007AFF" : "#666"} />
      </View>

      {hasWorkouts ? (
        <View style={styles.contentContainer}>
          {isCalendarView ? <CalendarView /> : <WorkoutList />}
        </View>
      ) : (
        <ThemedView style={styles.noWorkoutsContainer}>
          <ThemedText style={styles.noWorkoutsText}>
            No workouts yet. Start tracking your progress!
          </ThemedText>
          <StartTrackingButton />
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  switch: {
    marginHorizontal: 10,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  noWorkoutsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noWorkoutsText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});