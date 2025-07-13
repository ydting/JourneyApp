
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Alert, TextInput, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { getStopsForDay, addStop, updateStop, deleteStop, updateStopOrder } from '../database/database';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import * as Linking from 'expo-linking';

interface Stop {
  stop_id: number;
  day_id: number;
  location_name: string;
  address: string;
  latitude: number;
  longitude: number;
  arrival_time: string;
  departure_time: string;
  notes: string;
  order_index: number;
  media_urls: string; // Stored as JSON string
}

const DayDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { day_id, day_number, plan_name } = params;

  const [stops, setStops] = useState<Stop[]>([]);
  const [newStopLocation, setNewStopLocation] = useState('');

  const fetchStops = async () => {
    if (day_id) {
      try {
        const fetchedStops = await getStopsForDay(Number(day_id));
        setStops(fetchedStops as Stop[]);
      } catch (error) {
        console.error('Error fetching stops:', error);
        Alert.alert('Error', 'Failed to load stops for this day.');
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStops();
    }, [day_id])
  );

  const handleOpenInMaps = () => {
    if (stops.length === 0) {
      Alert.alert('No Stops', 'Please add stops to view them in a map application.');
      return;
    }

    const origin = `${stops[0].latitude},${stops[0].longitude}`;
    const destination = `${stops[stops.length - 1].latitude},${stops[stops.length - 1].longitude}`;
    const waypoints = stops.slice(1, -1).map(stop => `${stop.latitude},${stop.longitude}`).join('|');

    let url = '';
    if (Platform.OS === 'ios') {
      url = `http://maps.apple.com/?saddr=${origin}&daddr=${destination}&dirflg=d`;
      if (waypoints) {
        url += `&waypoints=${waypoints}`;
      }
    } else {
      url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
      if (waypoints) {
        url += `&waypoints=${waypoints}`;
      }
    }

    Linking.openURL(url).catch(err => {
      console.error('An error occurred', err);
      Alert.alert('Error', 'Could not open map application.');
    });
  };

  const handleAddStop = async () => {
    if (!newStopLocation) {
      Alert.alert('Error', 'Please enter a location name for the new stop.');
      return;
    }
    if (day_id) {
      try {
        const newOrderIndex = stops.length > 0 ? Math.max(...stops.map(s => s.order_index)) + 1 : 0;
        await addStop(
          Number(day_id),
          newStopLocation,
          '', // address
          0, // latitude
          0, // longitude
          '', // arrival_time
          '', // departure_time
          '', // notes
          newOrderIndex,
          '[]' // media_urls
        );
        Alert.alert('Success', 'Stop added.');
        setNewStopLocation('');
        fetchStops();
      } catch (error) {
        console.error('Error adding stop:', error);
        Alert.alert('Error', 'Failed to add new stop.');
      }
    }
  };

  const handleDeleteStop = async (stop_id: number) => {
    Alert.alert(
      'Delete Stop',
      'Are you sure you want to delete this stop?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteStop(stop_id);
              Alert.alert('Success', 'Stop deleted.');
              fetchStops();
            } catch (error) {
              console.error('Error deleting stop:', error);
              Alert.alert('Error', 'Failed to delete stop.');
            }
          },
        },
      ]
    );
  };

  const onDragEnd = async ({ data }: { data: Stop[] }) => {
    setStops(data);
    // Update order_index in database
    for (let i = 0; i < data.length; i++) {
      await updateStopOrder(data[i].stop_id, i);
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Stop>) => (
    <ScaleDecorator>
      <View style={[styles.stopItem, isActive && { backgroundColor: '#e0e0e0' }]}>
        <Text style={styles.stopLocation}>{item.location_name}</Text>
        <View style={styles.stopActions}>
          <Button title="Edit" onPress={() => router.push({ pathname: '/addEditStop', params: item })} />
          <Button title="Delete" onPress={() => handleDeleteStop(item.stop_id)} color="red" />
          <Button title="Reorder" onLongPress={drag} />
        </View>
      </View>
    </ScaleDecorator>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.dayTitle}>Plan: {plan_name} - Day {day_number}</Text>
      <View style={styles.buttonContainer}>
        <Button title="View on Map" onPress={() => router.push({ pathname: '/mapScreen', params: { stops: JSON.stringify(stops), day_number: day_number, plan_name: plan_name } })} />
        <Button title="Open in Maps App" onPress={handleOpenInMaps} />
        <Button title="Add New Stop" onPress={handleAddStop} />
      </View>
      <View style={styles.addStopContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Stop Location Name"
          value={newStopLocation}
          onChangeText={setNewStopLocation}
        />
      </View>

      {stops.length === 0 ? (
        <Text style={styles.noStopsText}>No stops added yet. Add one!</Text>
      ) : (
        <DraggableFlatList
          data={stops}
          onDragEnd={onDragEnd}
          keyExtractor={(item) => item.stop_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  addStopContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  noStopsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
  stopItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stopLocation: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopActions: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
});

export default DayDetailScreen;
