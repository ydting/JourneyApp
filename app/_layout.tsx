
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDatabase } from '../database/database';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
  useEffect(() => {
    const setupDatabase = async () => {
      await initDatabase();
    };
    setupDatabase();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'My Travel Plans' }} />
        <Stack.Screen name="addEditTravelPlan" options={{ title: 'Add/Edit Plan' }} />
        <Stack.Screen name="planDetail" options={{ title: 'Plan Details', headerBackTitle: 'Back' }} />
        <Stack.Screen name="dayDetail" options={{ title: 'Day Details', headerBackTitle: 'Back' }} />
        <Stack.Screen name="addEditStop" options={{ title: 'Add/Edit Stop', headerBackTitle: 'Back' }} />
        <Stack.Screen name="mapScreen" options={{ title: 'Route Map', headerBackTitle: 'Back' }} />
        <Stack.Screen name="addEditReview" options={{ title: 'Add/Edit Review', headerBackTitle: 'Back' }} />
        <Stack.Screen name="calendarScreen" options={{ title: 'Add to Calendar', headerBackTitle: 'Back' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
