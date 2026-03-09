import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../src/components/Card";
import { storage } from "../../src/utils/storage";
import { getStudentsAPI } from "../../src/utils/api";

export default function DashboardScreen() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [classes, setClasses] = useState<any[]>([]);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          // Fetch stats
          const data = await getStudentsAPI();
          if (data && data.students) {
            setStudentCount(data.students.length);
          }

          // Fetch user info
          const name = await storage.getItem("userName");
          const email = await storage.getItem("userEmail");
          if (name) setUserName(name);
          if (email) setUserEmail(email);
          // Fetch classes using user-specific key
          if (email) {
            const storedClasses = await storage.getObject<any[]>(
              `classes_${email}`,
            );
            if (storedClasses) {
              setClasses(storedClasses);
            }
          }
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        }
      };

      fetchData();
    }, []),
  );

  const handleLogout = async () => {
    setMenuVisible(false);
    await storage.removeItem("isAuthenticated");
    router.replace("/(auth)/login");
  };

  const menuItems = [
    {
      label: "Profile",
      icon: "person-outline",
      onPress: () => {
        setMenuVisible(false);
        router.push("/(app)/profile");
      },
    },
    {
      label: "Settings",
      icon: "settings-outline",
      onPress: () => {
        setMenuVisible(false);
        router.push("/(app)/settings");
      },
    },
    {
      label: "Logout",
      icon: "log-out-outline",
      onPress: handleLogout,
      color: "#EF4444",
    },
  ];

  const stats = [
    {
      title: "Total Classes",
      value: classes.length.toString(),
      icon: "book-outline",
      color: "#2563EB",
    },
    {
      title: "Total Students",
      value: studentCount.toString(),
      icon: "people-outline",
      color: "#8B5CF6",
    },
    {
      title: "Avg. Attendance",
      value: "92%",
      icon: "trending-up-outline",
      color: "#10B981",
    },
  ];

  // Use dynamic classes

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <Card key={index} style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: `${stat.color}15` },
                ]}
              >
                <Ionicons
                  name={stat.icon as any}
                  size={20}
                  color={stat.color}
                />
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
            onPress={() => router.push("/(app)/classes")}
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
              <TouchableOpacity onPress={() => router.push("/(app)/classes")}>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>

            {classes.slice(0, 3).map((cls) => (
              <TouchableOpacity
                key={cls.id}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/class-detail/[classId]",
                    params: { classId: cls.id },
                  })
                }
                activeOpacity={0.7}
              >
                <Card style={styles.classCard}>
                  <View
                    style={[styles.classIcon, { backgroundColor: cls.color }]}
                  >
                    <Ionicons name="book" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{cls.name}</Text>
                    <Text style={styles.classSubject}>{cls.subject}</Text>
                    <View style={styles.classDetails}>
                      <View style={styles.classDetail}>
                        <Ionicons
                          name="people-outline"
                          size={12}
                          color="#64748B"
                        />
                        <Text style={styles.classDetailText}>
                          {cls.students || 0} students
                        </Text>
                      </View>
                      <View style={styles.classDetail}>
                        <Ionicons
                          name="time-outline"
                          size={12}
                          color="#64748B"
                        />
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
                onPress={() => router.push("/(app)/history")}
              >
                <Card style={styles.quickLinkCard}>
                  <View
                    style={[
                      styles.quickLinkIcon,
                      { backgroundColor: "#FFF7ED" },
                    ]}
                  >
                    <Ionicons name="time" size={22} color="#F97316" />
                  </View>
                  <Text style={styles.quickLinkText}>History</Text>
                </Card>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickLink}
                onPress={() => router.push("/(app)/reports")}
              >
                <Card style={styles.quickLinkCard}>
                  <View
                    style={[
                      styles.quickLinkIcon,
                      { backgroundColor: "#F0FDF4" },
                    ]}
                  >
                    <Ionicons name="bar-chart" size={22} color="#10B981" />
                  </View>
                  <Text style={styles.quickLinkText}>Reports</Text>
                </Card>
              </TouchableOpacity>
            </View>

            <View style={styles.quickLinks}>
              <TouchableOpacity
                style={styles.quickLink}
                onPress={() => router.push("/(app)/settings")}
              >
                <Card style={styles.quickLinkCard}>
                  <View
                    style={[
                      styles.quickLinkIcon,
                      { backgroundColor: "#F3F4F6" },
                    ]}
                  >
                    <Ionicons name="settings" size={22} color="#6B7280" />
                  </View>
                  <Text style={styles.quickLinkText}>Settings</Text>
                </Card>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Profile Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <View style={styles.menuAvatar}>
                <Text style={styles.menuAvatarText}>
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.menuName}>{userName}</Text>
                <Text style={styles.menuEmail}>{userEmail}</Text>
              </View>
            </View>

            <View style={styles.menuDivider} />

            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View
                  style={[
                    styles.menuItemIcon,
                    {
                      backgroundColor: item.color
                        ? `${item.color}15`
                        : "#F1F5F9",
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={item.color || "#64748B"}
                  />
                </View>
                <Text
                  style={[
                    styles.menuItemText,
                    item.color ? { color: item.color } : {},
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
  },
  avatar: {
    width: 48,
    height: 48,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: "#64748B",
    textAlign: "center",
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2563EB",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  quickActionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
  },
  sectionLink: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
  },
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  classIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
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
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  classSubject: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  classDetails: {
    flexDirection: "row",
    gap: 12,
  },
  classDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  classDetailText: {
    fontSize: 12,
    color: "#64748B",
  },
  quickLinks: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  quickLink: {
    flex: 1,
  },
  quickLinkCard: {
    alignItems: "center",
    paddingVertical: 16,
  },
  quickLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 80,
    paddingRight: 16,
  },
  menuContainer: {
    width: 250,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  menuAvatar: {
    width: 40,
    height: 40,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuAvatarText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563EB",
  },
  menuName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
  },
  menuEmail: {
    fontSize: 12,
    color: "#64748B",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  menuItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
});
