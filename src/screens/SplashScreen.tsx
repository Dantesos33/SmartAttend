import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../utils/storage';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

export default function SplashScreen({ navigation }: Props) {
  const scaleAnim = new Animated.Value(0.8);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    // Animate logo
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after delay
    const timer = setTimeout(async () => {
      const isAuthenticated = await storage.getItem('isAuthenticated');
      navigation.replace(isAuthenticated === 'true' ? 'Dashboard' : 'Login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* App Icon */}
        <View style={styles.iconWrapper}>
          <View style={styles.iconMain}>
            <Ionicons name="camera" size={48} color="#FFFFFF" />
          </View>
          <View style={styles.iconBadge}>
            <Ionicons name="people" size={20} color="#FFFFFF" />
          </View>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>SmartAttend</Text>
        <Text style={styles.tagline}>Automated Classroom Attendance</Text>

        {/* Loading Dots */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.dotAnimated]} />
          <View style={[styles.dot, styles.dotAnimated, { animationDelay: '0.2s' }]} />
          <View style={[styles.dot, styles.dotAnimated, { animationDelay: '0.4s' }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 32,
  },
  iconMain: {
    width: 96,
    height: 96,
    backgroundColor: '#2563EB',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 40,
    height: 40,
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 48,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  dotAnimated: {
    // Animation would be handled with Reanimated or Animated API
  },
});
