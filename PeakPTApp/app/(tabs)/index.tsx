import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CalendarView } from '@/components/CalendarView';
import { WorkoutList } from '@/containers/workoutList/workoutList';

export default function HomeScreen() {
  console.log('HomeScreen: Component rendering');

  const [isCalendarView, setIsCalendarView] = useState(false);
  const [hasWorkouts] = useState(true);

  useEffect(() => {
    console.log('HomeScreen: Component mounted');
    return () => {
      console.log('HomeScreen: Component will unmount');
    };
  }, []);

  useEffect(() => {
    console.log(`HomeScreen: View changed to ${isCalendarView ? 'Calendar' : 'List'}`);
  }, [isCalendarView]);

  const toggleView = (isCalendar: boolean | ((prevState: boolean) => boolean)) => {
    console.log(`HomeScreen: Toggling view to ${isCalendar ? 'Calendar' : 'List'}`);
    setIsCalendarView(isCalendar);
  };

  console.log(`HomeScreen: Rendering with ${hasWorkouts ? 'workouts' : 'no workouts'}`);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Welcome to PeakPT</ThemedText>
      <ThemedText type="subtitle" style={styles.subtitle}>Scaling peaks, building strength</ThemedText>
      <View style={styles.toggleContainer}>
        <TouchableOpacity onPress={() => toggleView(false)} style={styles.iconButton}>
          <Ionicons 
            name="list" 
            size={24} 
            color={!isCalendarView ? "#007AFF" : "#666"} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleView(true)} style={styles.iconButton}>
          <Ionicons 
            name="calendar" 
            size={24} 
            color={isCalendarView ? "#007AFF" : "#666"} 
          />
        </TouchableOpacity>
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
    marginBottom: 10,
  },
  subtitle: {
    color: '#B0B0B0',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  iconButton: {
    padding: 10,
    marginHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
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