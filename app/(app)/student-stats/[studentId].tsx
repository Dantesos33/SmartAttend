import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../src/components/Card';
import { getStudentHistoryAPI } from '../../../src/utils/api';

export default function StudentStatsScreen() {
  const router = useRouter();
  const { studentId, name } = useLocalSearchParams<{ studentId: string, name: string }>();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getStudentHistoryAPI(name);
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };
    if (name) fetchHistory();
  }, [name]);

  const attendanceHistory = stats?.history || [];
  const presentCount = stats?.present_count || 0;
  const attendanceRate = stats?.attendance_rate || 0;
  const totalSessions = stats?.total_sessions || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{name?.[0] || 'S'}</Text>
          </View>
          <Text style={styles.studentName}>{name || 'Student Name'}</Text>
          <Text style={styles.studentId}>Roll No: {stats?.roll || 'N/A'}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 24 }} />
        ) : (
          <>
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <Text style={styles.statLabel}>Attendance</Text>
                <Text style={[styles.statValue, { color: attendanceRate >= 75 ? '#10B981' : '#EF4444' }]}>
                  {attendanceRate}%
                </Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statLabel}>Present</Text>
                <Text style={styles.statValue}>{presentCount}</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statLabel}>Total</Text>
                <Text style={styles.statValue}>{totalSessions}</Text>
              </Card>
            </View>

            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Attendance Logs</Text>
              {attendanceHistory.length > 0 ? (
                attendanceHistory.map((log: any, index: number) => (
                  <Card key={index} style={styles.logCard}>
                    <View style={styles.logLeft}>
                      <Ionicons 
                        name={log.status === 'Present' ? 'checkmark-circle' : 'close-circle'} 
                        size={24} 
                        color={log.status === 'Present' ? '#10B981' : '#EF4444'} 
                      />
                      <View>
                        <Text style={styles.logDate}>{log.date}</Text>
                        <Text style={styles.logTime}>{log.time}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: log.status === 'Present' ? '#F0FDF4' : '#FEF2F2' }]}>
                      <Text style={[styles.statusText, { color: log.status === 'Present' ? '#10B981' : '#EF4444' }]}>
                        {log.status}
                      </Text>
                    </View>
                  </Card>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="calendar-outline" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyText}>No attendance records yet</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  content: { padding: 24 },
  profileSection: { alignItems: 'center', marginBottom: 32 },
  avatarLarge: { width: 80, height: 80, borderRadius: 30, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarLargeText: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  studentName: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  studentId: { fontSize: 14, color: '#64748B' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statCard: { flex: 1, padding: 16, alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  historySection: {},
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  logCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginBottom: 12 },
  logLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logDate: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  logTime: { fontSize: 12, color: '#64748B' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 12, fontSize: 14, color: '#64748B' },
});
