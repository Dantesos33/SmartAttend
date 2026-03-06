import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ClassManagementScreen from '../screens/ClassManagementScreen';
import StudentManagementScreen from '../screens/StudentManagementScreen';
import CameraScreen from '../screens/CameraScreen';
import ImageProcessingScreen from '../screens/ImageProcessingScreen';
import AttendanceMarkingScreen from '../screens/AttendanceMarkingScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';
import ReportsAnalyticsScreen from '../screens/ReportsAnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Registration: undefined;
  Dashboard: undefined;
  Classes: undefined;
  Students: { classId: string };
  Camera: { classId: string };
  Processing: undefined;
  MarkAttendance: { classId: string };
  History: undefined;
  Reports: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const auth = await AsyncStorage.getItem('isAuthenticated');
      setIsAuthenticated(auth === 'true');
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F8FAFC' }
      }}
      initialRouteName={isAuthenticated ? 'Dashboard' : 'Splash'}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registration" component={RegistrationScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Classes" component={ClassManagementScreen} />
      <Stack.Screen name="Students" component={StudentManagementScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Processing" component={ImageProcessingScreen} />
      <Stack.Screen name="MarkAttendance" component={AttendanceMarkingScreen} />
      <Stack.Screen name="History" component={AttendanceHistoryScreen} />
      <Stack.Screen name="Reports" component={ReportsAnalyticsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
