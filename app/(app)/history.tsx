import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/Card';

export default function AttendanceHistoryScreen() {
  const router = useRouter();

  const history = [
    { id: '1', className: 'CS101', date: 'Oct 12, 2023', time: '10:00 AM', present: 28, total: 30, status: 'Completed' },
    { id: '2', className: 'MATH202', date: 'Oct 11, 2023', time: '02:00 PM', present: 35, total: 38, status: 'Completed' },
    { id: '3', className: 'PHY301', date: 'Oct 10, 2023', time: '11:00 AM', present: 24, total: 25, status: 'Completed' },
    { id: '4', className: 'CS101', date: 'Oct 09, 2023', time: '10:00 AM', present: 26, total: 30, status: 'Completed' },
    { id: '5', className: 'ENG101', date: 'Oct 08, 2023', time: '09:00 AM', present: 33, total: 35, status: 'Completed' },
    { id: '6', className: 'BIO101', date: 'Oct 07, 2023', time: '01:00 PM', present: 28, total: 28, status: 'Completed' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance History</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.periodContainer}>
          <Text style={styles.periodTitle}>Recent Sessions</Text>
        </View>

        {history.map((session) => {
          const percentage = Math.round((session.present / session.total) * 100);
          return (
            <TouchableOpacity key={session.id} activeOpacity={0.7}>
              <Card style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{session.className}</Text>
                    <View style={styles.dateTime}>
                      <Ionicons name="calendar-outline" size={14} color="#64748B" />
                      <Text style={styles.dateText}>{session.date}</Text>
                      <Ionicons name="time-outline" size={14} color="#64748B" style={{ marginLeft: 8 }} />
                      <Text style={styles.dateText}>{session.time}</Text>
                    </View>
                  </View>
                  <View style={[styles.percentageBadge, { backgroundColor: percentage > 90 ? '#F0FDF4' : '#FFF7ED' }]}>
                    <Text style={[styles.percentageText, { color: percentage > 90 ? '#10B981' : '#F97316' }]}>
                      {percentage}%
                    </Text>
                  </View>
                </View>
                
                <View style={styles.sessionStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Present</Text>
                    <Text style={styles.statValue}>{session.present}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Absent</Text>
                    <Text style={styles.statValue}>{session.total - session.present}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total</Text>
                    <Text style={styles.statValue}>{session.total}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
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
  filterButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 16 },
  periodContainer: { marginBottom: 16 },
  periodTitle: { fontSize: 16, fontWeight: '600', color: '#64748B' },
  sessionCard: { marginBottom: 12, padding: 16 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  classInfo: { flex: 1 },
  className: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  dateTime: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 12, color: '#64748B', marginLeft: 4 },
  percentageBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  percentageText: { fontSize: 14, fontWeight: 'bold' },
  sessionStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  statDivider: { width: 1, height: 24, backgroundColor: '#E2E8F0' },
});
