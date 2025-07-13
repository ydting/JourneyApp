
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { getDaysForPlan, addDay, deleteDay } from '../database/database';

interface Day {
  day_id: number;
  plan_id: number;
  day_number: number;
}

const PlanDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { plan_id, plan_name } = params;

  const [days, setDays] = useState<Day[]>([]);

  const fetchDays = async () => {
    if (plan_id) {
      try {
        const fetchedDays = await getDaysForPlan(Number(plan_id));
        setDays(fetchedDays as Day[]);
      } catch (error) {
        console.error('Error fetching days:', error);
        Alert.alert('Error', 'Failed to load days for this plan.');
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDays();
    }, [plan_id])
  );

  const handleAddDay = async () => {
    if (plan_id) {
      try {
        const newDayNumber = days.length > 0 ? Math.max(...days.map(d => d.day_number)) + 1 : 1;
        await addDay(Number(plan_id), newDayNumber);
        Alert.alert('Success', `Day ${newDayNumber} added.`);
        fetchDays();
      } catch (error) {
        console.error('Error adding day:', error);
        Alert.alert('Error', 'Failed to add new day.');
      }
    }
  };

  const handleDeleteDay = async (day_id: number) => {
    Alert.alert(
      'Delete Day',
      'Are you sure you want to delete this day and all its stops?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteDay(day_id);
              Alert.alert('Success', 'Day deleted.');
              fetchDays();
            } catch (error) {
              console.error('Error deleting day:', error);
              Alert.alert('Error', 'Failed to delete day.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Day }) => (
    <View style={styles.dayItem}>
      <Text style={styles.dayNumber}>Day {item.day_number}</Text>
      <View style={styles.dayActions}>
        <Button title="View/Edit" onPress={() => router.push({ pathname: '/dayDetail', params: { day_id: item.day_id, day_number: item.day_number, plan_name: plan_name } })} />
        <Button title="Delete" onPress={() => handleDeleteDay(item.day_id)} color="red" />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.planName}>{plan_name}</Text>
      <Button title="Add New Day" onPress={handleAddDay} />
      {days.length === 0 ? (
        <Text style={styles.noDaysText}>No days added yet. Add one!</Text>
      ) : (
        <FlatList
          data={days}
          renderItem={renderItem}
          keyExtractor={(item) => item.day_id.toString()}
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
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  noDaysText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
  dayItem: {
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
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayActions: {
    flexDirection: 'row',
    gap: 10,
  },
});

export default PlanDetailScreen;
