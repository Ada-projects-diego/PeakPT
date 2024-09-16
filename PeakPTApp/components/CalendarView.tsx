import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { ThemedText } from '@/components/ThemedText';

// This would come from your actual data
const workoutDates = {
  '2024-09-01': { marked: true },
  '2024-09-10': { marked: true },
  '2024-09-15': { marked: true },
};

export const CalendarView = () => {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  const onDayPress = (day: DateData) => {
    console.log('selected day', day);
    // Here you would typically show details of the workout for the selected day
    // or navigate to a detail page
  };

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={{
          ...workoutDates,
          [today]: { ...workoutDates[today], today: true }
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
          const isToday = date?.dateString === today;
          const isMarked = marking?.marked;
          return (
            <View style={[
              styles.dayContainer,
              isMarked && styles.markedDay,
              isToday && styles.todayDay
            ]}>
              <ThemedText style={[
                styles.dayText,
                state === 'disabled' && styles.disabledDayText,
                isToday && styles.todayText
              ]}>
                {date?.day}
              </ThemedText>
            </View>
          );
        }}
      />
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
});