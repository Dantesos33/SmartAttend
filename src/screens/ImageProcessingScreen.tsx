import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { storage } from '../utils/storage';

type ImageProcessingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Processing'>;

interface Props {
  navigation: ImageProcessingScreenNavigationProp;
}

export default function ImageProcessingScreen({ navigation }: Props) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Analyzing image...');
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    loadImage();
    processImage();
  }, []);

  const loadImage = async () => {
    const uri = await storage.getItem('capturedImage');
    setImageUri(uri);
  };

  const processImage = () => {
    const stages = [
      'Analyzing image...',
      'Detecting faces...',
      'Identifying students...',
      'Matching with database...',
      'Processing complete!',
    ];

    let currentProgress = 0;
    let stageIndex = 0;

    const interval = setInterval(() => {
      currentProgress += 2;
      setProgress(currentProgress);

      const newStageIndex = Math.floor((currentProgress / 100) * stages.length);
      if (newStageIndex !== stageIndex && newStageIndex < stages.length) {
        stageIndex = newStageIndex;
        setStage(stages[stageIndex]);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          navigation.replace('MarkAttendance', { classId: '1' });
        }, 1000);
      }
    }, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {imageUri && (
          <Card style={styles.imageCard}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <View style={styles.badge}>
              <Ionicons name="people" size={16} color="#FFFFFF" />
              <Text style={styles.badgeText}>28 detected</Text>
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
            <Text style={styles.progressLabel}>Processing</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  imageCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 32,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#DBEAFE',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  progressCard: {
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
});
