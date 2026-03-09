import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../../../src/utils/storage';

export default function AttendanceMarkingScreen() {
  const router = useRouter();
  const { classId } = useLocalSearchParams<{ classId: string }>();
  
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      const dataStr = await storage.getItem('attendanceResult');
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        // Backend returns: { status: '...', message: '...', data: { ...attendance_data } }
        setAttendanceData(parsed.data || parsed);
      }
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={{ padding: 8 }} onPress={() => router.replace('/(app)/dashboard')}>
           <Ionicons name="home" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Class {classId} Results</Text>
      </View>
      
      {attendanceData ? (
        <ScrollView style={styles.scrollContent}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Attendance Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryVal}>{attendanceData.total_students || 0}</Text>
              </View>
              <View style={styles.summaryBox}>
                <Text style={[styles.summaryLabel, { color: '#10B981' }]}>Present</Text>
                <Text style={[styles.summaryVal, { color: '#10B981' }]}>{attendanceData.present_count || 0}</Text>
              </View>
              <View style={styles.summaryBox}>
                <Text style={[styles.summaryLabel, { color: '#EF4444' }]}>Absent</Text>
                <Text style={[styles.summaryVal, { color: '#EF4444' }]}>{attendanceData.absent_count || 0}</Text>
              </View>
            </View>
            {attendanceData.unknown_faces > 0 && (
              <View style={styles.unknownBox}>
                <Ionicons name="warning" size={16} color="#F59E0B" />
                <Text style={styles.unknownText}>
                  {attendanceData.unknown_faces} unknown face(s) detected
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.sectionTitle}>Present Students</Text>
          {attendanceData.present?.map((student: string, index: number) => (
             <View key={`present-${index}`} style={styles.studentStatRow}>
               <View style={styles.statusDotPresent} />
               <Text style={styles.studentNameText}>{student}</Text>
               <Ionicons name="checkmark-circle" size={20} color="#10B981" />
             </View>
          ))}
          {attendanceData.present?.length === 0 && (
             <Text style={styles.noStudentsText}>No students recognized</Text>
          )}

          <Text style={styles.sectionTitle}>Absent Students</Text>
          {attendanceData.absent?.map((student: string, index: number) => (
             <View key={`absent-${index}`} style={styles.studentStatRow}>
               <View style={styles.statusDotAbsent} />
               <Text style={styles.studentNameText}>{student}</Text>
               <Ionicons name="close-circle" size={20} color="#EF4444" />
             </View>
          ))}
          {attendanceData.absent?.length === 0 && (
             <Text style={styles.noStudentsText}>All registered students are present!</Text>
          )}
          
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/(app)/dashboard')}>
             <Text style={styles.doneBtnText}>Finish & Update Records</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>No attendance data found.</Text>
          <Text style={styles.subtitle}>Please try capturing a photo again.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 8, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  scrollContent: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B' },
  summaryCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#0F172A' },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  summaryBox: { alignItems: 'center', flex: 1 },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 4, textTransform: 'uppercase' },
  summaryVal: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  unknownBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, marginTop: 16 },
  unknownText: { fontSize: 13, color: '#92400E', fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 12, color: '#475569' },
  studentStatRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: 'transparent' },
  statusDotPresent: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 12 },
  statusDotAbsent: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginRight: 12 },
  studentNameText: { fontSize: 16, fontWeight: '500', flex: 1, color: '#1E293B' },
  noStudentsText: { fontSize: 14, color: '#94A3B8', fontStyle: 'italic', marginBottom: 16, textAlign: 'center' },
  doneBtn: { backgroundColor: '#2563EB', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 40, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  doneBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
