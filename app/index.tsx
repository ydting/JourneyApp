
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getTravelPlans, deleteTravelPlan } from '../database/database';

interface TravelPlan {
  plan_id: number;
  plan_name: string;
  destination: string;
  start_date: string;
  end_date: string;
}

const TravelPlansScreen = () => {
  const router = useRouter();
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);

  const fetchTravelPlans = async () => {
    try {
      const plans = await getTravelPlans();
      setTravelPlans(plans as TravelPlan[]);
    } catch (error) {
      console.error('Error fetching travel plans:', error);
      Alert.alert('Error', 'Failed to load travel plans.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTravelPlans();
    }, [])
  );

  const handleDeletePlan = async (plan_id: number) => {
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this travel plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteTravelPlan(plan_id);
              Alert.alert('Success', 'Travel plan deleted.');
              fetchTravelPlans(); // Refresh the list
            } catch (error) {
              console.error('Error deleting travel plan:', error);
              Alert.alert('Error', 'Failed to delete travel plan.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: TravelPlan }) => (
    <View style={styles.planItem}>
      <Text style={styles.planName}>{item.plan_name}</Text>
      <Text>{item.destination}</Text>
      <Text>{item.start_date} to {item.end_date}</Text>
      <View style={styles.planActions}>
        <Button title="View Details" onPress={() => router.push({ pathname: '/planDetail', params: { plan_id: item.plan_id, plan_name: item.plan_name } })} />
        <Button title="Edit" onPress={() => router.push({ pathname: '/addEditTravelPlan', params: item })} />
        <Button title="Delete" onPress={() => handleDeletePlan(item.plan_id)} color="red" />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button
        title="Add New Plan"
        onPress={() => router.push('/addEditTravelPlan')}
      />
      {travelPlans.length === 0 ? (
        <Text style={styles.noPlansText}>No travel plans yet. Add one!</Text>
      ) : (
        <FlatList
          data={travelPlans}
          renderItem={renderItem}
          keyExtractor={(item) => item.plan_id.toString()}
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
  noPlansText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
  planItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  planActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },
});

export default TravelPlansScreen;
