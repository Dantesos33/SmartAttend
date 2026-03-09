import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { storage } from "../../src/utils/storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";

export default function ClassManagementScreen() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const loadClasses = async () => {
    const email = await storage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
      const storedClasses = await storage.getObject<any[]>(`classes_${email}`);
      if (storedClasses) {
        setClasses(storedClasses);
      } else {
        // Initialize with default classes for new users if desired, or keep empty
        setClasses([]);
      }
    }
  };

  React.useEffect(() => {
    loadClasses();
  }, []);

  const handleSaveClass = async () => {
    if (newClassName && newSubject && userEmail) {
      let updatedClasses;
      if (editingClass) {
        updatedClasses = classes.map((cls) =>
          cls.id === editingClass.id
            ? { ...cls, name: newClassName, subject: newSubject }
            : cls,
        );
      } else {
        const newCls = {
          id: Date.now().toString(),
          name: newClassName,
          subject: newSubject,
          students: 0,
          time: "TBD",
          color: ["#2563EB", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"][
            Math.floor(Math.random() * 5)
          ],
        };
        updatedClasses = [newCls, ...classes];
      }

      await storage.setObject(`classes_${userEmail}`, updatedClasses);
      setClasses(updatedClasses);
      setModalVisible(false);
      setEditingClass(null);
      setNewClassName("");
      setNewSubject("");
    }
  };

  const handleDeleteClass = (id: string) => {
    Alert.alert(
      "Delete Class",
      "Are you sure you want to delete this class? This will also remove all student associations for this class.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedClasses = classes.filter((cls) => cls.id !== id);
            await storage.setObject(`classes_${userEmail}`, updatedClasses);
            await storage.removeItem(`students_${userEmail}_${id}`);
            setClasses(updatedClasses);
          },
        },
      ],
    );
  };

  const openEditModal = (cls: any) => {
    setEditingClass(cls);
    setNewClassName(cls.name);
    setNewSubject(cls.subject);
    setModalVisible(true);
  };

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
        <Text style={styles.headerTitle}>My Classes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#64748B"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search classes or subjects..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredClasses.length > 0 ? (
            filteredClasses.map((cls) => (
              <View key={cls.id} style={styles.cardWrapper}>
                <TouchableOpacity
                  style={styles.classCardTouch}
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
                            {cls.students} students
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
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#CBD5E1"
                    />
                  </Card>
                </TouchableOpacity>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openEditModal(cls)}
                  >
                    <Ionicons name="pencil" size={18} color="#2563EB" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleDeleteClass(cls.id)}
                  >
                    <Ionicons name="trash" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>
                No classes found matching "{searchQuery}"
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Add Class Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View
            onStartShouldSetResponder={() => true}
            style={{ width: "100%" }}
          >
            <Card style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingClass ? "Edit Class" : "Add New Class"}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Class Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. CS101"
                  value={newClassName}
                  onChangeText={setNewClassName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Computer Science"
                  value={newSubject}
                  onChangeText={setNewSubject}
                />
              </View>

              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setModalVisible(false);
                    setEditingClass(null);
                    setNewClassName("");
                    setNewSubject("");
                  }}
                  variant="outline"
                  style={{ flex: 1 }}
                />
                <Button
                  title={editingClass ? "Save Changes" : "Create Class"}
                  onPress={handleSaveClass}
                  style={{ flex: 2, marginLeft: 12 }}
                />
              </View>
            </Card>
          </View>
        </Pressable>
      </Modal>
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
  addButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 16, color: "#0F172A" },
  scrollContent: { padding: 16, paddingTop: 0 },
  cardWrapper: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  classCardTouch: {
    flex: 1,
  },
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionButtons: {
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  classInfo: { flex: 1 },
  className: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  classSubject: { fontSize: 14, color: "#64748B", marginBottom: 4 },
  classDetails: { flexDirection: "row", gap: 12 },
  classDetail: { flexDirection: "row", alignItems: "center", gap: 4 },
  classDetailText: { fontSize: 12, color: "#64748B" },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    padding: 24,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    color: "#0F172A",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 8,
  },
});
