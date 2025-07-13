
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';

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

const MapScreen = () => {
  const params = useLocalSearchParams();
  const stops: Stop[] = JSON.parse(params.stops as string || '[]');
  const day_number = params.day_number;
  const plan_name = params.plan_name;

  const coordinates = stops.map(stop => ({
    latitude: stop.latitude,
    longitude: stop.longitude,
  })).filter(coord => coord.latitude !== 0 && coord.longitude !== 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Route for {plan_name} - Day {day_number}</Text>
      {coordinates.length > 0 ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: coordinates[0].latitude,
            longitude: coordinates[0].longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <UrlTile
            urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
          />
          {stops.map((stop, index) => (
            <Marker
              key={stop.stop_id}
              coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
              title={stop.location_name}
              description={stop.address}
              pinColor="red"
            />
          ))}
          <Polyline
            coordinates={coordinates}
            strokeColor="#000"
            strokeWidth={3}
          />
        </MapView>
      ) : (
        <Text style={styles.noStopsText}>No valid stops with coordinates to display on the map.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  map: {
    flex: 1,
  },
  noStopsText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});

export default MapScreen;
