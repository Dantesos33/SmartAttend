import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/Card';
import { storage } from '../../src/utils/storage';
import { recognizeClassroomAPI } from '../../src/utils/api';

export default function ImageProcessingScreen() {
  const router = useRouter();
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Initializing...');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const loadImage = async () => {
    try {
      const uri = await storage.getItem('capturedImage');
      if (uri) {
        setImageUri(uri);
      } else {
        Alert.alert('Error', 'No image found to process', [
          { text: 'Go Back', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  };

  const processImage = async () => {
    if (!imageUri) return;

    try {
      setStage('Sending to backend...');
      setProgress(20);
      
      setProgress(50);
      setStage('Analyzing faces...');
      const response = await recognizeClassroomAPI(imageUri);
      
      setProgress(100);
      setStage('Processing complete!');
      
      // Pass attendance data to the next screen via storage
      await storage.setItem('attendanceResult', JSON.stringify(response));

      setTimeout(() => {
        // Navigate to results view
        router.replace({ 
          pathname: '/(app)/mark-attendance/[classId]', 
          params: { classId: classId || '1' } 
        });
      }, 1000);
    } catch (error: any) {
      console.error(error);
      setStage('Error occurred');
      Alert.alert('Processing Failed', error.message || 'An error occurred during image processing', [
        { text: 'Retry', onPress: () => processImage() },
        { text: 'Go Back', onPress: () => router.back() }
      ]);
    }
  };

  useEffect(() => {
    loadImage();
  }, []);

  useEffect(() => {
    if (imageUri) {
      processImage();
    }
  }, [imageUri]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {imageUri && (
          <Card style={styles.imageCard}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <View style={styles.badge}>
              <Ionicons name="people" size={16} color="#FFFFFF" />
              <Text style={styles.badgeText}>Processing...</Text>
            </View>
          </Card>
        )}

        <View style={styles.statusContainer}>
          <View style={styles.iconContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
          <Text style={styles.statusTitle}>{stage}</Text>
          <Text style={styles.statusSubtitle}>{progress}% complete</Text>
        </View>

        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Status</Text>
            <Text style={styles.progressValue}>{progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  imageCard: { padding: 0, overflow: 'hidden', marginBottom: 32 },
  image: { width: '100%', height: 250, borderRadius: 16 },
  badge: { position: 'absolute', top: 16, right: 16, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 4 },
  badgeText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  statusContainer: { alignItems: 'center', marginBottom: 32 },
  iconContainer: { width: 80, height: 80, backgroundColor: '#DBEAFE', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  statusTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  statusSubtitle: { fontSize: 14, color: '#64748B' },
  progressCard: { padding: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressLabel: { fontSize: 14, fontWeight: '500', color: '#374151' },
  progressValue: { fontSize: 14, fontWeight: 'bold', color: '#2563EB' },
  progressBar: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 4 },
});
