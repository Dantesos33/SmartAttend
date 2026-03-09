import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { storage } from "../../src/utils/storage";
import { Card } from "../../src/components/Card";

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");

  React.useEffect(() => {
    const loadUserData = async () => {
      const name = await storage.getItem("userName");
      const email = await storage.getItem("userEmail");
      if (name) setUserName(name);
      if (email) setUserEmail(email);
    };
    loadUserData();
  }, []);

  const handleLogout = async () => {
    await storage.removeItem("isAuthenticated");
    router.replace("/(auth)/login");
  };

  interface SettingItem {
    label: string;
    icon: string;
    color: string;
    type: "switch" | "link";
    value?: boolean;
    onToggle?: (val: boolean) => void;
    onPress?: () => void;
  }

  interface Section {
    title: string;
    items: SettingItem[];
  }

  const sections: Section[] = [
    {
      title: "Preferences",
      items: [
        {
          label: "Push Notifications",
          icon: "notifications-outline",
          color: "#2563EB",
          type: "switch",
          value: notifications,
          onToggle: setNotifications,
        },
        {
          label: "Dark Mode",
          icon: "moon-outline",
          color: "#64748B",
          type: "switch",
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          label: "Auto-save Photos",
          icon: "camera-outline",
          color: "#10B981",
          type: "switch",
          value: autoSave,
          onToggle: setAutoSave,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          label: "Edit Profile",
          icon: "person-outline",
          color: "#8B5CF6",
          type: "link",
          onPress: () => router.push("/(app)/profile"),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </Text>
            </View>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{userEmail}</Text>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => router.push("/(app)/profile")}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Sections */}
        {sections.map((section, sIndex) => (
          <View key={sIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.sectionCard}>
              {section.items.map((item, iIndex) => (
                <TouchableOpacity
                  key={iIndex}
                  style={[
                    styles.settingItem,
                    iIndex === section.items.length - 1 && {
                      borderBottomWidth: 0,
                    },
                  ]}
                  onPress={item.onPress}
                  disabled={item.type === "switch"}
                >
                  <View style={styles.settingLabelContainer}>
                    <View
                      style={[
                        styles.itemIcon,
                        { backgroundColor: `${item.color}15` },
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={item.color}
                      />
                    </View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  {item.type === "switch" &&
                  "value" in item &&
                  "onToggle" in item ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
                      thumbColor={item.value ? "#2563EB" : "#F1F5F9"}
                    />
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#CBD5E1"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout of Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>SmartAttend Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#0F172A" },
  scrollContent: { padding: 16 },
  profileCard: { padding: 24, alignItems: "center", marginBottom: 24 },
  profileHeader: { alignItems: "center" },
  avatarLarge: {
    width: 80,
    height: 80,
    backgroundColor: "#2563EB",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    position: "relative",
  },
  avatarLargeText: { fontSize: 28, fontWeight: "bold", color: "#FFFFFF" },
  editAvatarBtn: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#0F172A",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 4,
  },
  profileEmail: { fontSize: 14, color: "#64748B", marginBottom: 16 },
  editProfileBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  editProfileText: { fontSize: 14, fontWeight: "600", color: "#475569" },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: { padding: 0, overflow: "hidden" },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { fontSize: 16, fontWeight: "500", color: "#0F172A" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 24,
  },
  logoutText: { color: "#EF4444", fontWeight: "bold", fontSize: 16 },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 40,
  },
});
