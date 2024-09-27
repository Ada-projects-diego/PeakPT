import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { agent, Workout } from '@/api/agent';

export const CalendarView = () => {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [key, setKey] = useState(0);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setIsLoading(true);
        const fetchedWorkouts = await agent.Workouts.list();
        setWorkouts(fetchedWorkouts);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch workouts:', err);
        setError('Failed to load workouts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const workoutDates = workouts.reduce((acc, workout) => {
    const date = workout.date.split('T')[0];
    acc[date] = { marked: true };
    return acc;
  }, {} as { [key: string]: { marked: boolean } });

  const onDayPress = (day: DateData) => {
    console.log('Day pressed:', day.dateString);
    try {
      navigation.navigate('ExerciseLogScreen' as never, { date: day.dateString } as never);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const goToToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentDate(today);
    setKey(prevKey => prevKey + 1);  // Force re-render of Calendar
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Ionicons name="today-outline" size={24} color="#007AFF" />
          <ThemedText style={styles.todayButtonText}>Today</ThemedText>
        </TouchableOpacity>
      </View>
      
      {isLoading && (
        <View style={styles.overlayContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Loading workouts...</ThemedText>
        </View>
      )}
      
      <Calendar
        key={key}
        current={currentDate}
        markedDates={{
          ...workoutDates,
          [currentDate]: { ...workoutDates[currentDate], marked: true }
        }}
        onDayPress={onDayPress}
        theme={{
          backgroundColor: '#1e1e1e',
          calendarBackground: '#1e1e1e',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#007AFF',
          dayTextColor: '#ffffff',
          textDisabledColor: '#4d4d4d',
          arrowColor: '#007AFF',
          monthTextColor: '#ffffff',
          indicatorColor: '#007AFF',
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 16,
        }}
        dayComponent={({date, state, marking}) => {
          const isToday = date?.dateString === currentDate;
          const isMarked = marking?.marked;
          return (
            <TouchableOpacity
              onPress={() => date && onDayPress({dateString: date.dateString, day: date.day, month: date.month, year: date.year, timestamp: date.timestamp})}
              style={[
                styles.dayContainer,
                isMarked && styles.markedDay,
                isToday && styles.todayDay
              ]}
            >
              <ThemedText style={[
                styles.dayText,
                state === 'disabled' && styles.disabledDayText,
                isToday && styles.todayText
              ]}>
                {date?.day}
              </ThemedText>
            </TouchableOpacity>
          );
        }}
      />
      
      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity onPress={() => navigation.navigate('HomeScreen' as never)} style={styles.retryButton}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      )}
      
      <ThemedText style={styles.hint}>
        Tap a date to view workout details or add new exercises to a day
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#1e1e1e',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  todayButtonText: {
    color: '#007AFF',
    marginLeft: 5,
  },
  hint: {
    textAlign: 'center',
    marginTop: 10,
    color: '#b6c1cd',
  },
  dayContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  markedDay: {
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  todayDay: {
    backgroundColor: '#007AFF',
  },
  dayText: {
    color: '#ffffff',
    fontSize: 16,
  },
  disabledDayText: {
    color: '#4d4d4d',
  },
  todayText: {
    fontWeight: 'bold',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    color: '#ffffff',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 5,
    margin: 10,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});