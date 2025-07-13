
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, Platform, FlatList } from 'react-native';
import * as Calendar from 'expo-calendar';
import { useLocalSearchParams } from 'expo-router';

interface TravelPlan {
  plan_id: number;
  plan_name: string;
  destination: string;
  start_date: string;
  end_date: string;
}

const CalendarScreen = () => {
  const params = useLocalSearchParams();
  const travelPlan: TravelPlan = params as TravelPlan;

  const [calendars, setCalendars] = useState<Calendar.Calendar[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const fetchedCalendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        setCalendars(fetchedCalendars);
        if (fetchedCalendars.length > 0) {
          setSelectedCalendarId(fetchedCalendars[0].id);
        }
      } else {
        Alert.alert('Permission required', 'Please grant calendar permissions to use this feature.');
      }
    })();
  }, []);

  const addEventToCalendar = async () => {
    if (!selectedCalendarId || !travelPlan.plan_name || !travelPlan.start_date || !travelPlan.end_date) {
      Alert.alert('Error', 'Please select a calendar and ensure plan details are available.');
      return;
    }

    try {
      const startDate = new Date(travelPlan.start_date);
      const endDate = new Date(travelPlan.end_date);

      const eventId = await Calendar.createEventAsync(selectedCalendarId, {
        title: travelPlan.plan_name,
        startDate,
        endDate,
        location: travelPlan.destination,
        notes: `Travel plan to ${travelPlan.destination} from ${travelPlan.start_date} to ${travelPlan.end_date}.`,
        allDay: true,
      });
      Alert.alert('Success', `Event added to calendar with ID: ${eventId}`);
    } catch (error) {
      console.error('Error adding event to calendar:', error);
      Alert.alert('Error', 'Failed to add event to calendar.');
    }
  };

  const renderCalendarItem = ({ item }: { item: Calendar.Calendar }) => (
    <Button
      title={item.title}
      onPress={() => setSelectedCalendarId(item.id)}
      color={item.id === selectedCalendarId ? 'blue' : 'gray'}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add "{travelPlan.plan_name}" to Calendar</Text>
      <Text style={styles.subtitle}>Select a Calendar:</Text>
      {calendars.length > 0 ? (
        <FlatList
          data={calendars}
          renderItem={renderCalendarItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarList}
        />
      ) : (
        <Text>No calendars found or permissions not granted.</Text>
      )}

      {selectedCalendarId && (
        <Button title="Add to Selected Calendar" onPress={addEventToCalendar} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  calendarList: {
    marginBottom: 20,
  },
});

export default CalendarScreen;
