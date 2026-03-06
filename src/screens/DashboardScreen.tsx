import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

export default function DashboardScreen({ navigation }: Props) {
  const stats = [
    { title: 'Total Classes', value: '12', icon: 'book-outline', color: '#2563EB' },
    { title: 'Total Students', value: '345', icon: 'people-outline', color: '#8B5CF6' },
    { title: 'Avg. Attendance', value: '92%', icon: 'trending-up-outline', color: '#10B981' },
  ];

  const classes = [
    { id: '1', name: 'CS101', subject: 'Computer Science', students: 30, time: 'Mon, Wed, Fri', color: '#2563EB' },
    { id: '2', name: 'MATH202', subject: 'Mathematics', students: 38, time: 'Tue, Thu', color: '#8B5CF6' },
    { id: '3', name: 'PHY301', subject: 'Physics', students: 25, time: 'Mon, Wed', color: '#EC4899' },
    { id: '4', name: 'ENG101', subject: 'English', students: 35, time: 'Tue, Thu', color: '#10B981' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>John Doe</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <Card key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.title}</Text>
            </Card>
          ))}
        </View>

        {/* Quick Action */}
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Classes')}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionContent}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="camera" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>Take Attendance</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Classes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Classes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Classes')}>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>

            {classes.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                onPress={() => navigation.navigate('Students', { classId: cls.id })}
                activeOpacity={0.7}
              >
                <Card style={styles.classCard}>
                  <View style={[styles.classIcon, { backgroundColor: cls.color }]}>
                    <Ionicons name="book" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{cls.name}</Text>
                    <Text style={styles.classSubject}>{cls.subject}</Text>
                    <View style={styles.classDetails}>
                      <View style={styles.classDetail}>
                        <Ionicons name="people-outline" size={12} color="#64748B" />
                        <Text style={styles.classDetailText}>{cls.students} students</Text>
                      </View>
                      <View style={styles.classDetail}>
                        <Ionicons name="time-outline" size={12} color="#64748B" />
                        <Text style={styles.classDetailText}>{cls.time}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Links</Text>
            <View style={styles.quickLinks}>
              <TouchableOpacity
                style={styles.quickLink}
                onPress={() => navigation.navigate('History')}
              >
                <Card style={styles.quickLinkCard}>
                  <View style={[styles.quickLinkIcon, { backgroundColor: '#FFF7ED' }]}>
                    <Ionicons name="time" size={22} color="#F97316" />
                  </View>
                  <Text style={styles.quickLinkText}>History</Text>
                </Card>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickLink}
                onPress={() => navigation.navigate('Reports')}
              >
                <Card style={styles.quickLinkCard}>
                  <View style={[styles.quickLinkIcon, { backgroundColor: '#F0FDF4' }]}>
                    <Ionicons name="bar-chart" size={22} color="#10B981" />
                  </View>
                  <Text style={styles.quickLinkText}>Reports</Text>
                </Card>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  avatar: {
    width: 48,
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2563EB',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  sectionLink: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  classIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  classSubject: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  classDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  classDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  classDetailText: {
    fontSize: 12,
    color: '#64748B',
  },
  quickLinks: {
    flexDirection: 'row',
    gap: 12,
  },
  quickLink: {
    flex: 1,
  },
  quickLinkCard: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  quickLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
});
