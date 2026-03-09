import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Card } from '../../src/components/Card';
import { documentDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const screenWidth = Dimensions.get('window').width;

export default function ReportsAnalyticsScreen() {
  const router = useRouter();
  const [reportType, setReportType] = useState('Weekly');

  const handleDownloadCSV = async () => {
    try {
      const csvData = 'Date,Class,Student Name,Roll No,Status\n' +
        '2023-10-12,CS101,Alice Johnson,CS-01,Present\n' +
        '2023-10-12,CS101,Bob Smith,CS-02,Present\n' +
        '2023-10-12,CS101,Charlie Brown,CS-03,Absent';
      
      const filename = `Attendance_Report_${new Date().getTime()}.csv`;
      const fileUri = documentDirectory + filename;
      
      await writeAsStringAsync(fileUri, csvData, { encoding: EncodingType.UTF8 });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to generate CSV report');
    }
  };

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        data: [85, 92, 88, 95, 90],
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ['Attendance %']
  };

  const subjectData = {
    labels: ['CS101', 'MATH', 'PHY', 'ENG', 'BIO'],
    datasets: [{ data: [92, 85, 88, 95, 90] }]
  };

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '6', strokeWidth: '2', stroke: '#2563EB' }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        <TouchableOpacity style={styles.filterButton} onPress={handleDownloadCSV}>
          <Ionicons name="download-outline" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Selector */}
        <View style={styles.selector}>
          {['Weekly', 'Monthly', 'Yearly'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.selectorBtn, reportType === type && styles.selectorBtnActive]}
              onPress={() => setReportType(type)}
            >
              <Text style={[styles.selectorText, reportType === type && styles.selectorTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart Card */}
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Attendance Trend</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Avg. Attendance</Text>
            <Text style={[styles.statValue, { color: '#10B981' }]}>91.2%</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Top Class</Text>
            <Text style={[styles.statValue, { color: '#2563EB' }]}>ENG101</Text>
          </Card>
        </View>

        {/* Bar Chart Card */}
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Attendance by Subject</Text>
          <BarChart
            data={subjectData}
            width={screenWidth - 64}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            style={styles.chart}
          />
        </Card>

        {/* Insight Card */}
        <Card style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="bulb-outline" size={20} color="#CA8A04" />
            <Text style={styles.insightTitle}>Quick Insight</Text>
          </View>
          <Text style={styles.insightText}>
            Attendance is consistently highest on Thursdays (95%). Consider scheduling important 
            assessments during this time for maximum participation.
          </Text>
        </Card>
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
  selector: { flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 4, borderRadius: 12, marginBottom: 20 },
  selectorBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  selectorBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  selectorText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  selectorTextActive: { color: '#2563EB' },
  chartCard: { padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  chart: { marginVertical: 8, borderRadius: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, padding: 16, alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  insightCard: { padding: 16, backgroundColor: '#FEFCE8', borderLeftWidth: 4, borderLeftColor: '#EAB308', marginBottom: 32 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  insightTitle: { fontSize: 14, fontWeight: 'bold', color: '#854D0E' },
  insightText: { fontSize: 13, color: '#854D0E', lineHeight: 20 },
});
