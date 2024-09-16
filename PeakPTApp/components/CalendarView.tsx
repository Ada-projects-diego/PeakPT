import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { ThemedText } from '@/components/ThemedText';

// This would come from your actual data
const workoutDates = {
  '2024-09-01': { marked: true, dotColor: '#50cebb' },
  '2024-09-10': { marked: true, dotColor: '#50cebb' },
  '2024-09-15': { marked: true, dotColor: '#50cebb' },
};

export const CalendarView = () => {
  const onDayPress = (day: DateData) => {
    console.log('selected day', day);
    // Here you would typically show details of the workout for the selected day
    // or navigate to a detail page
  };

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={workoutDates}
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
          dotColor: '#007AFF',
          selectedDotColor: '#ffffff',
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
          textDayHeaderFontSize: 16
        }}
      />
     <ThemedText style={styles.hint}>
  Tap a date to view workout details <br /> or add new exercises to a day
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
});