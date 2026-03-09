import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../src/components/Button";
import { Input } from "../../src/components/Input";
import { storage } from "../../src/utils/storage";

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const storedName = await storage.getItem("userName");
      const storedEmail = await storage.getItem("userEmail");
      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
    };
    loadUserData();
  }, []);

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Name and email are required");
      return;
    }

    setLoading(true);
    try {
      await storage.setItem("userName", name);
      await storage.setItem("userEmail", email);
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to save profile changes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {name
                  ? name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "U"}
              </Text>
              <TouchableOpacity style={styles.editAvatarBtn}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              leftIcon={
                <Ionicons name="person-outline" size={20} color="#94A3B8" />
              }
            />

            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <Ionicons name="mail-outline" size={20} color="#94A3B8" />
              }
            />

            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={loading}
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: { padding: 24 },
  avatarSection: { alignItems: "center", marginBottom: 32 },
  avatarLarge: {
    width: 100,
    height: 100,
    backgroundColor: "#2563EB",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarLargeText: { fontSize: 32, fontWeight: "bold", color: "#FFFFFF" },
  editAvatarBtn: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#0F172A",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  form: { gap: 8 },
  saveButton: { marginTop: 24 },
});
