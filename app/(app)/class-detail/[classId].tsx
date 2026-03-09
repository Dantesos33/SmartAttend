import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { storage } from "../../../src/utils/storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../../src/components/Card";
import * as ImagePicker from "expo-image-picker";

export default function ClassDetailScreen() {
  const router = useRouter();
  const { classId } = useLocalSearchParams<{ classId: string }>();

  const [className, setClassName] = React.useState("Class Detail");

  React.useEffect(() => {
    const loadClassName = async () => {
      const email = await storage.getItem("userEmail");
      if (email) {
        const storedClasses = await storage.getObject<any[]>(
          `classes_${email}`,
        );
        if (storedClasses) {
          const cls = storedClasses.find((c) => c.id === classId);
          if (cls) setClassName(`${cls.name} - ${cls.subject}`);
        }
      }
    };
    loadClassName();
  }, [classId]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      // Save uri and navigate to processing
      const { storage } = require("../../../src/utils/storage");
      await storage.setItem("capturedImage", result.assets[0].uri);
      router.push({ pathname: "/(app)/processing", params: { classId } });
    }
  };

  const options = [
    {
      title: "Add Students",
      subtitle: "Register new students to this class",
      icon: "person-add",
      color: "#2563EB",
      onPress: () =>
        router.push({
          pathname: "/(app)/add-student/[classId]",
          params: { classId },
        }),
    },
    {
      title: "View Students",
      subtitle: "Check attendance history and stats",
      icon: "people",
      color: "#8B5CF6",
      onPress: () =>
        router.push({
          pathname: "/(app)/students/[classId]",
          params: { classId },
        }),
    },
    {
      title: "Take Attendance",
      subtitle: "Capture or upload classroom photo",
      icon: "camera",
      color: "#10B981",
      onPress: () => {
        // Show options for Camera or Gallery
        router.push({
          pathname: "/(app)/camera/[classId]",
          params: { classId },
        });
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {className}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>What would you like to do?</Text>

        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionCard}
            onPress={option.onPress}
            activeOpacity={0.7}
          >
            <Card style={styles.cardInternal}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${option.color}15` },
                ]}
              >
                <Ionicons
                  name={option.icon as any}
                  size={28}
                  color={option.color}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </Card>
          </TouchableOpacity>
        ))}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
    flex: 1,
    textAlign: "center",
  },
  content: { padding: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 24,
  },
  optionCard: { marginBottom: 16 },
  cardInternal: { flexDirection: "row", alignItems: "center", padding: 20 },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  textContainer: { flex: 1 },
  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 4,
  },
  optionSubtitle: { fontSize: 14, color: "#64748B" },
});
