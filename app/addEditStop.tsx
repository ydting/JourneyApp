
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { addStop, updateStop, getReviewsForStop, deleteReview } from '../database/database';

interface Review {
  review_id: number;
  stop_id: number;
  rating: number;
  comment: string;
  timestamp: string;
}

const AddEditStopScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [stopId, setStopId] = useState<number | null>(null);
  const [dayId, setDayId] = useState<number | null>(null);
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [notes, setNotes] = useState('');
  const [orderIndex, setOrderIndex] = useState('');
  const [mediaUrls, setMediaUrls] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (params.stop_id) {
      setStopId(Number(params.stop_id));
      setDayId(Number(params.day_id));
      setLocationName(params.location_name as string);
      setAddress(params.address as string);
      setLatitude(params.latitude?.toString() || '');
      setLongitude(params.longitude?.toString() || '');
      setArrivalTime(params.arrival_time as string);
      setDepartureTime(params.departure_time as string);
      setNotes(params.notes as string);
      setOrderIndex(params.order_index?.toString() || '');
      setMediaUrls(params.media_urls as string);
    } else if (params.day_id) {
      setDayId(Number(params.day_id));
      setOrderIndex('0');
    }
  }, [params]);

  const fetchReviews = async () => {
    if (stopId) {
      try {
        const fetchedReviews = await getReviewsForStop(stopId);
        setReviews(fetchedReviews as Review[]);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        Alert.alert('Error', 'Failed to load reviews.');
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [stopId])
  );

  const handleDeleteReview = async (review_id: number) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteReview(review_id);
              Alert.alert('Success', 'Review deleted.');
              fetchReviews();
            } catch (error) {
              console.error('Error deleting review:', error);
              Alert.alert('Error', 'Failed to delete review.');
            }
          },
        },
      ]
    );
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewItem}>
      <Text>Rating: {item.rating}/5</Text>
      <Text>Comment: {item.comment}</Text>
      <Text style={styles.reviewTimestamp}>{new Date(item.timestamp).toLocaleDateString()}</Text>
      <View style={styles.reviewActions}>
        <Button title="Edit" onPress={() => router.push({ pathname: '/addEditReview', params: { ...item, stop_id: stopId } })} />
        <Button title="Delete" onPress={() => handleDeleteReview(item.review_id)} color="red" />
      </View>
    </View>
  );

  const handleSave = async () => {
    if (!locationName || !dayId) {
      Alert.alert('Error', 'Location Name and Day ID are required.');
      return;
    }

    try {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const ordIndex = parseInt(orderIndex);

      if (stopId) {
        await updateStop(
          stopId,
          locationName,
          address,
          isNaN(lat) ? 0 : lat,
          isNaN(lon) ? 0 : lon,
          arrivalTime,
          departureTime,
          notes,
          isNaN(ordIndex) ? 0 : ordIndex,
          mediaUrls
        );
        Alert.alert('Success', 'Stop updated successfully!');
      } else {
        await addStop(
          dayId,
          locationName,
          address,
          isNaN(lat) ? 0 : lat,
          isNaN(lon) ? 0 : lon,
          arrivalTime,
          departureTime,
          notes,
          isNaN(ordIndex) ? 0 : ordIndex,
          mediaUrls
        );
        Alert.alert('Success', 'Stop added successfully!');
      }
      router.back();
    } catch (error) {
      console.error('Error saving stop:', error);
      Alert.alert('Error', 'Failed to save stop.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Location Name:</Text>
      <TextInput
        style={styles.input}
        value={locationName}
        onChangeText={setLocationName}
        placeholder="e.g., Eiffel Tower"
      />

      <Text style={styles.label}>Address:</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="e.g., Champ de Mars, 75007 Paris, France"
      />

      <Text style={styles.label}>Latitude:</Text>
      <TextInput
        style={styles.input}
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
        placeholder="e.g., 48.8584"
      />

      <Text style={styles.label}>Longitude:</Text>
      <TextInput
        style={styles.input}
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
        placeholder="e.g., 2.2945"
      />

      <Text style={styles.label}>Arrival Time (HH:MM):</Text>
      <TextInput
        style={styles.input}
        value={arrivalTime}
        onChangeText={setArrivalTime}
        placeholder="e.g., 09:00"
      />

      <Text style={styles.label}>Departure Time (HH:MM):</Text>
      <TextInput
        style={styles.input}
        value={departureTime}
        onChangeText={setDepartureTime}
        placeholder="e.g., 11:00"
      />

      <Text style={styles.label}>Notes:</Text>
      <TextInput
        style={styles.input}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
        placeholder="e.g., Remember to book tickets in advance."
      />

      {(latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
              }}
            />
          </MapView>
        </View>
      )}

      <Button title="Save Stop" onPress={handleSave} />
      <View style={{ marginTop: 10 }}>
        <Button title="Cancel" onPress={() => router.back()} color="gray" />
      </View>

      {stopId && (
        <View style={styles.reviewsContainer}>
          <Text style={styles.reviewsTitle}>Reviews</Text>
          <Button title="Add Review" onPress={() => router.push({ pathname: '/addEditReview', params: { stop_id: stopId } })} />
          {reviews.length === 0 ? (
            <Text style={styles.noReviewsText}>No reviews yet. Add one!</Text>
          ) : (
            <FlatList
              data={reviews}
              renderItem={renderReviewItem}
              keyExtractor={(item) => item.review_id.toString()}
            />
          )}
        </View>
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
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  mapContainer: {
    height: 200,
    width: '100%',
    marginBottom: 15,
    borderRadius: 5,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  reviewsContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reviewItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 1,
  },
  reviewTimestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
    gap: 10,
  },
  noReviewsText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
});

export default AddEditStopScreen;
