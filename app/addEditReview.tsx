
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { addReview, updateReview } from '../database/database';

const AddEditReviewScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [reviewId, setReviewId] = useState<number | null>(null);
  const [stopId, setStopId] = useState<number | null>(null);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (params.review_id) {
      setReviewId(Number(params.review_id));
      setStopId(Number(params.stop_id));
      setRating(params.rating?.toString() || '');
      setComment(params.comment as string);
    } else if (params.stop_id) {
      setStopId(Number(params.stop_id));
    }
  }, [params]);

  const handleSave = async () => {
    if (!stopId || !rating || !comment) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const numRating = parseInt(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      Alert.alert('Error', 'Rating must be a number between 1 and 5.');
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      if (reviewId) {
        // Update existing review
        await updateReview(reviewId, numRating, comment, timestamp);
        Alert.alert('Success', 'Review updated successfully!');
      } else {
        // Add new review
        await addReview(stopId, numRating, comment, timestamp);
        Alert.alert('Success', 'Review added successfully!');
      }
      router.back();
    } catch (error) {
      console.error('Error saving review:', error);
      Alert.alert('Error', 'Failed to save review.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Rating (1-5):</Text>
      <TextInput
        style={styles.input}
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
        placeholder="e.g., 5"
      />

      <Text style={styles.label}>Comment:</Text>
      <TextInput
        style={styles.input}
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
        placeholder="e.g., Great place, highly recommend!"
      />

      <Button title="Save Review" onPress={handleSave} />
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

export default AddEditReviewScreen;
