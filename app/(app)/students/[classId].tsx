import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../src/components/Card';
import { getStudentsAPI, deleteStudentAPI } from '../../../src/utils/api';

export default function StudentListScreen() {
  const router = useRouter();
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStudents = async () => {
    try {
      const data = await getStudentsAPI();
      // Handle detailed response: { status: 'success', students: [{ name, roll, attendance_rate, ... }] }
      const studentData = data.students || [];
      const mappedStudents = studentData.map((s: any, index: number) => ({
        id: index.toString(),
        name: s.name,
        roll: s.roll || `STU-${1000 + index}`,
        attendance: s.attendance_rate || 0,
        present_count: s.present_count || 0,
        total_sessions: s.total_sessions || 0
      }));
      setStudents(mappedStudents);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStudents();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const handleDeleteStudent = async (studentName: string) => {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to remove ${studentName}? This will delete their registration data and photo.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteStudentAPI(studentName);
              await fetchStudents();
              Alert.alert('Success', 'Student removed successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete student');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const filteredStudents = Array.isArray(students) ? students.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.roll?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Class Students</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push({ pathname: '/(app)/add-student/[classId]', params: { classId } })}>
          <Ionicons name="person-add" size={22} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or roll number..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
          }
        >
          <View style={styles.statsSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>{students.length}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Avg Attendance</Text>
              <Text style={styles.summaryValue}>
                {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + (s.attendance || 0), 0) / students.length) : 0}%
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Warning</Text>
              <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
                {Array.isArray(students) ? students.filter(s => (s.attendance || 0) < 75).length : 0}
              </Text>
            </View>
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
          ) : filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <TouchableOpacity
                key={student.id}
                onPress={() => router.push({ pathname: '/(app)/student-stats/[studentId]', params: { studentId: student.id, name: student.name } })}
                activeOpacity={0.7}
              >
                <Card style={styles.studentCard}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{student.name.split(' ').map((n: string) => n[0]).join('')}</Text>
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentRoll}>{student.roll || student.student_id || 'No ID'}</Text>
                  </View>
                  <View style={styles.attendanceInfo}>
                    <View style={[styles.attendanceBadge, { backgroundColor: (student.attendance || 0) >= 75 ? '#F0FDF4' : '#FEF2F2' }]}>
                      <Text style={[styles.attendanceText, { color: (student.attendance || 0) >= 75 ? '#10B981' : '#EF4444' }]}>
                        {student.attendance || 0}%
                      </Text>
                    </View>
                    <Text style={styles.sessionsText}>{student.present_count || 0}/{student.total_sessions || 0}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteStudent(student.name)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </Card>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>{searchQuery ? 'No results found' : 'No students registered'}</Text>
            </View>
          )}
        </ScrollView>
      </View>
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
  addButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 16, color: '#0F172A' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  statsSummary: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 10, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  summaryDivider: { width: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
  studentCard: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 14, fontWeight: 'bold', color: '#2563EB' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  studentRoll: { fontSize: 13, color: '#64748B' },
  attendanceInfo: { alignItems: 'flex-end', marginRight: 12 },
  attendanceBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 2 },
  attendanceText: { fontSize: 12, fontWeight: 'bold' },
  sessionsText: { fontSize: 11, color: '#94A3B8' },
  deleteButton: { padding: 8, marginLeft: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyStateText: { marginTop: 12, fontSize: 16, color: '#64748B' },
});
