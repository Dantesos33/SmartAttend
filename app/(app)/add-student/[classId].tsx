import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Button } from "../../../src/components/Button";
import { Card } from "../../../src/components/Card";
import { registerStudentAPI } from "../../../src/utils/api";
import { storage } from "../../../src/utils/storage";

export default function AddStudentScreen() {
  const router = useRouter();
  const { classId } = useLocalSearchParams<{ classId: string }>();

  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!name || !rollNumber || !imageUri) {
      Alert.alert(
        "Error",
        "Please fill in Name, Roll Number and provide a Photo",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await registerStudentAPI(name, rollNumber, imageUri);

      const email = await storage.getItem("userEmail");
      if (email) {
        // Associate with class using user-specific key
        const classIdKey = `students_${email}_${classId}`;
        const existingStudents =
          (await storage.getObject<any[]>(classIdKey)) || [];
        const updatedStudents = [...existingStudents, { name, rollNumber }];
        await storage.setObject(classIdKey, updatedStudents);

        // Update student count in user-specific classes list
        const storedClasses =
          (await storage.getObject<any[]>(`classes_${email}`)) || [];
        const updatedClasses = storedClasses.map((cls) =>
          cls.id === classId
            ? { ...cls, students: (cls.students || 0) + 1 }
            : cls,
        );
        await storage.setObject(`classes_${email}`, updatedClasses);
      }

      Alert.alert(
        "Success",
        response.message || `${name} has been added to the class`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to register student");
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
        <Text style={styles.headerTitle}>Add New Student</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.formCard}>
          <Text style={styles.subtitle}>
            Enter student information and provide a clear face photo for
            registration.
          </Text>

          <TouchableOpacity style={styles.photoPicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera" size={32} color="#64748B" />
                <Text style={styles.photoPickerText}>Select Student Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Roll Number / ID</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="card-outline"
                size={20}
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="2023-CS-01"
                value={rollNumber}
                onChangeText={setRollNumber}
              />
            </View>
          </View>

          <Button
            title="Register Student"
            onPress={handleRegister}
            style={styles.submitBtn}
            loading={loading}
          />
        </Card>

        <View style={styles.helpBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#2563EB"
          />
          <Text style={styles.helpText}>
            A clear photo is required for the face recognition system to
            accurately mark attendance.
          </Text>
        </View>
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
  content: { padding: 24 },
  formCard: { padding: 24 },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 20,
    textAlign: "center",
  },
  photoPicker: { alignSelf: "center", marginBottom: 24 },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F1F5F9",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  photoPickerText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },
  previewImage: { width: 120, height: 120, borderRadius: 60 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#475569", marginBottom: 8 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 16, color: "#0F172A" },
  submitBtn: { marginTop: 12 },
  helpBox: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#DBEAFE",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  helpText: { flex: 1, fontSize: 13, color: "#1E40AF", lineHeight: 18 },
});
