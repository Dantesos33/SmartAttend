import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { storage } from '../../../src/utils/storage';

export default function CameraScreen() {
  const router = useRouter();
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        if (photo) {
          // Save image URI to storage
          await storage.setItem('capturedImage', photo.uri);
          // Pass classId to processing screen if needed, or rely on storage
          router.push({ pathname: '/(app)/processing', params: { classId } });
        }
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert('Error', 'Failed to capture image');
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await storage.setItem('capturedImage', result.assets[0].uri);
        router.push({ pathname: '/(app)/processing', params: { classId } });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#94A3B8" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            Please enable camera access in your device settings to take attendance photos.
          </Text>
          <Button
            title="Grant Permission"
            onPress={requestPermission}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          {/* Header */}
          <SafeAreaView style={styles.cameraHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowCamera(false)}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>Capture Photo</Text>
            <TouchableOpacity
              style={styles.flashButton}
              onPress={() => Alert.alert('Info', 'Flash control coming soon')}
            >
              <Ionicons name="flash-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Controls */}
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraFacing}
            >
              <Ionicons name="camera-reverse" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <View style={styles.placeholder} />
          </View>
        </CameraView>
      </View>
    );
  }

  // Selection Screen
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Take Attendance</Text>
          <Text style={styles.headerSubtitle}>Class {classId}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Instructions */}
          <Card style={styles.instructionCard}>
            <View style={styles.instructionContent}>
              <View style={styles.instructionIcon}>
                <Ionicons name="camera" size={20} color="#2563EB" />
              </View>
              <View style={styles.instructionText}>
                <Text style={styles.instructionTitle}>Instructions</Text>
                <Text style={styles.instructionDescription}>
                  Capture a group photo of the classroom or upload an existing photo.
                  The system will automatically detect and mark attendance.
                </Text>
              </View>
            </View>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => setShowCamera(true)}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="camera" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.actionTitle}>Capture Photo</Text>
              <Text style={styles.actionDescription}>Use device camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCardOutline}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainerOutline}>
                <Ionicons name="images" size={40} color="#64748B" />
              </View>
              <Text style={styles.actionTitleOutline}>Upload Photo</Text>
              <Text style={styles.actionDescription}>Choose from gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Tips */}
          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>Tips for best results:</Text>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Ensure good lighting in the classroom</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Capture all students in the frame</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Hold camera steady for clear images</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  cameraContainer: { flex: 1, backgroundColor: '#000000' },
  camera: { flex: 1 },
  cameraHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'rgba(0, 0, 0, 0.3)' },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  cameraTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  flashButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  cameraControls: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 32 },
  flipButton: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  captureButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255, 255, 255, 0.5)' },
  captureButtonInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E2E8F0' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerContent: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  headerSubtitle: { fontSize: 14, color: '#64748B' },
  content: { flex: 1, padding: 24 },
  instructionCard: { backgroundColor: '#EFF6FF', marginBottom: 24 },
  instructionContent: { flexDirection: 'row', gap: 12 },
  instructionIcon: { width: 40, height: 40, backgroundColor: '#2563EB', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  instructionText: { flex: 1 },
  instructionTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  instructionDescription: { fontSize: 13, color: '#475569', lineHeight: 18 },
  actions: { gap: 12, marginBottom: 24 },
  actionCard: { backgroundColor: '#2563EB', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  actionCardOutline: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0' },
  scrollContent: { flex: 1 },
  actionIconContainer: { width: 64, height: 64, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  actionIconContainerOutline: { width: 64, height: 64, backgroundColor: '#F1F5F9', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  actionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  actionTitleOutline: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  actionDescription: { fontSize: 14, color: '#94A3B8' },
  tips: { marginTop: 8 },
  tipsTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 },
  tipItem: { flexDirection: 'row', marginBottom: 8 },
  tipBullet: { fontSize: 14, color: '#2563EB', marginRight: 8, fontWeight: 'bold' },
  tipText: { flex: 1, fontSize: 14, color: '#64748B' },
  placeholder: { width: 40 },
  permissionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  permissionTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginTop: 16, marginBottom: 8 },
  permissionText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24 },
});
