
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { addTravelPlan, updateTravelPlan } from '../database/database';

const AddEditTravelPlanScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [planId, setPlanId] = useState<number | null>(null);
  const [planName, setPlanName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (params.plan_id) {
      setPlanId(Number(params.plan_id));
      setPlanName(params.plan_name as string);
      setDestination(params.destination as string);
      setStartDate(params.start_date as string);
      setEndDate(params.end_date as string);
    }
  }, [params]);

  const handleSave = async () => {
    if (!planName || !destination || !startDate || !endDate) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      if (planId) {
        // Update existing plan
        await updateTravelPlan(planId, planName, destination, startDate, endDate);
        Alert.alert('Success', 'Travel plan updated successfully!');
      } else {
        // Add new plan
        await addTravelPlan(planName, destination, startDate, endDate);
        Alert.alert('Success', 'Travel plan added successfully!');
      }
      router.back();
    } catch (error) {
      console.error('Error saving travel plan:', error);
      Alert.alert('Error', 'Failed to save travel plan.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Plan Name:</Text>
      <TextInput
        style={styles.input}
        value={planName}
        onChangeText={setPlanName}
        placeholder="e.g., European Adventure"
      />

      <Text style={styles.label}>Destination:</Text>
      <TextInput
        style={styles.input}
        value={destination}
        onChangeText={setDestination}
        placeholder="e.g., Paris, France"
      />

      <Text style={styles.label}>Start Date (YYYY-MM-DD):</Text>
      <TextInput
        style={styles.input}
        value={startDate}
        onChangeText={setStartDate}
        placeholder="e.g., 2025-07-15"
      />

      <Text style={styles.label}>End Date (YYYY-MM-DD):</Text>
      <TextInput
        style={styles.input}
        value={endDate}
        onChangeText={setEndDate}
        placeholder="e.g., 2025-07-30"
      />

      <Button title="Save Plan" onPress={handleSave} />
      <View style={{ marginTop: 10 }}>
        <Button title="Cancel" onPress={() => router.back()} color="gray" />
      </View>
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
});

export default AddEditTravelPlanScreen;
