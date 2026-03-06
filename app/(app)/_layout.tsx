import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8FAFC' } }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="classes" />
      <Stack.Screen name="students/[classId]" />
      <Stack.Screen name="camera/[classId]" />
      <Stack.Screen name="processing" />
      <Stack.Screen name="mark-attendance/[classId]" />
      <Stack.Screen name="history" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
