import face_recognition
import cv2
import numpy as np
import os
from datetime import datetime
import csv
import json

class ClassroomAttendanceSystem:
    def __init__(self, known_students_dir="known_students"):
        """Initialize the attendance system"""
        self.known_face_encodings = []
        self.known_face_names = []
        self.known_students_dir = known_students_dir
        self.metadata_path = os.path.join(known_students_dir, "metadata.json")
        self.sessions_path = "attendance_sessions.json"
        
        # Ensure directory exists
        os.makedirs(self.known_students_dir, exist_ok=True)
        
        # Load metadata
        self.metadata = self._load_json(self.metadata_path, {})
        # Load sessions
        self.sessions = self._load_json(self.sessions_path, [])
        
        # Load any existing students
        self.load_known_students_from_dir()

    def _load_json(self, path, default):
        if os.path.exists(path):
            try:
                with open(path, 'r') as f:
                    return json.load(f)
            except:
                return default
        return default

    def _save_json(self, path, data):
        with open(path, 'w') as f:
            json.dump(data, f, indent=4)

    def load_known_students_from_dir(self):
        """Load all student images from the known_students directory"""
        print("Loading known students...")
        # Clear existing to avoid duplicates if re-called
        self.known_face_encodings = []
        self.known_face_names = []
        
        for filename in os.listdir(self.known_students_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                filepath = os.path.join(self.known_students_dir, filename)
                # remove extension, replace '_' back to space
                student_name = os.path.splitext(filename)[0].replace('_', ' ')
                self.load_student_image(filepath, student_name)
        print(f"Loaded {len(self.known_face_names)} known students.")

    def load_student_image(self, image_path, student_name, roll=None):
        """Load a single student image and create face encoding"""
        try:
            # Load image
            image = face_recognition.load_image_file(image_path)

            # Get face encodings
            encodings = face_recognition.face_encodings(image)

            if len(encodings) > 0:
                # Update metadata if roll is provided
                if roll:
                    self.metadata[student_name] = {"roll": roll}
                    self._save_json(self.metadata_path, self.metadata)
                
                # Check if already loaded
                if student_name in self.known_face_names:
                    idx = self.known_face_names.index(student_name)
                    self.known_face_encodings[idx] = encodings[0]
                else:
                    self.known_face_encodings.append(encodings[0])
                    self.known_face_names.append(student_name)
                
                return True, f"Successfully loaded: {student_name}"
            else:
                return False, f"No face detected in image for: {student_name}"
        except Exception as e:
            return False, f"Error loading {student_name}: {str(e)}"

    def remove_student(self, student_name):
        """Remove a student from the system and delete their image file"""
        if student_name not in self.known_face_names:
            return False, f"Student {student_name} not found."

        try:
            # Find index
            index = self.known_face_names.index(student_name)
            
            # Remove from lists
            self.known_face_names.pop(index)
            self.known_face_encodings.pop(index)
            
            # Remove from metadata
            if student_name in self.metadata:
                del self.metadata[student_name]
                self._save_json(self.metadata_path, self.metadata)
            
            # Delete file
            safe_name = student_name.replace(" ", "_")
            found_file = False
            for ext in ['.jpg', '.jpeg', '.png']:
                file_path = os.path.join(self.known_students_dir, f"{safe_name}{ext}")
                if os.path.exists(file_path):
                    os.remove(file_path)
                    found_file = True
                    break
            
            if not found_file:
                return True, f"Student {student_name} removed from memory, but image file not found."
                
            return True, f"Successfully removed student: {student_name}"
        except Exception as e:
            return False, f"Error removing {student_name}: {str(e)}"

    def recognize_classroom(self, classroom_image_path, tolerance=0.5):
        """Recognize students in classroom image"""
        if not self.known_face_encodings:
            return None, "No student data loaded. Please upload student images first."

        print("Analyzing classroom image...")

        # Load classroom image
        classroom_image = face_recognition.load_image_file(classroom_image_path)
        classroom_image_cv = cv2.cvtColor(classroom_image, cv2.COLOR_RGB2BGR)

        # Detect faces
        face_locations = face_recognition.face_locations(classroom_image)
        face_encodings = face_recognition.face_encodings(classroom_image, face_locations)

        # Track attendance
        present_students = []
        unknown_faces = 0
        face_details = []

        # Process each detected face
        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            # Compare with known faces
            matches = face_recognition.compare_faces(
                self.known_face_encodings, face_encoding, tolerance=tolerance
            )
            name = "Unknown"
            confidence = 0.0

            # Calculate face distances
            face_distances = face_recognition.face_distance(
                self.known_face_encodings, face_encoding
            )

            if len(face_distances) > 0:
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = self.known_face_names[best_match_index]
                    confidence = 1 - face_distances[best_match_index]
                    if name not in present_students:
                        present_students.append(name)
                else:
                    unknown_faces += 1
            else:
                unknown_faces += 1

            face_details.append({
                'name': name,
                'confidence': float(confidence), # Ensure it's JSON serializable
                'location': (top, right, bottom, left)
            })

            # Optional: Annotate image
            color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
            cv2.rectangle(classroom_image_cv, (left, top), (right, bottom), color, 2)
            label = f"{name} ({confidence:.2%})" if name != "Unknown" else "Unknown"
            cv2.rectangle(classroom_image_cv, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
            cv2.putText(classroom_image_cv, label, (left + 6, bottom - 6),
                       cv2.FONT_HERSHEY_DUPLEX, 0.5, (255, 255, 255), 1)

        # Prepare attendance data
        absent_students = [name for name in self.known_face_names
                          if name not in present_students]

        attendance_data = {
            'date': datetime.now().strftime("%Y-%m-%d"),
            'time': datetime.now().strftime("%H:%M:%S"),
            'total_students': len(self.known_face_names),
            'present': sorted(present_students),
            'absent': sorted(absent_students),
            'present_count': len(present_students),
            'absent_count': len(absent_students),
            'unknown_faces': unknown_faces,
            'face_details': face_details,
        }
        
        # Save annotated image
        os.makedirs("output", exist_ok=True)
        annotated_path = f"output/annotated_classroom_{datetime.now().strftime('%Y%md_%H%M%S')}.jpg"
        cv2.imwrite(annotated_path, classroom_image_cv)
        attendance_data['annotated_image_path'] = annotated_path

        return attendance_data, "Recognition complete!"

    def log_attendance(self, attendance_data):
        """Log the attendance session to persistent storage"""
        self.sessions.append(attendance_data)
        self._save_json(self.sessions_path, self.sessions)
        return True

    def get_student_stats(self, student_name):
        """Get summarized stats for a specific student"""
        total_sessions = 0
        present_count = 0
        history = []

        for session in self.sessions:
            total_sessions += 1
            if student_name in session.get('present', []):
                present_count += 1
                history.append({
                    "date": session.get('date'),
                    "time": session.get('time'),
                    "status": "Present"
                })
            elif student_name in session.get('absent', []):
                history.append({
                    "date": session.get('date'),
                    "time": session.get('time'),
                    "status": "Absent"
                })

        attendance_rate = 0
        if total_sessions > 0:
            attendance_rate = round((present_count / total_sessions) * 100)

        return {
            "name": student_name,
            "roll": self.metadata.get(student_name, {}).get("roll", "N/A"),
            "attendance_rate": attendance_rate,
            "present_count": present_count,
            "total_sessions": total_sessions,
            "history": history
        }

    def get_all_students_stats(self):
        """Get stats for all known students"""
        return [self.get_student_stats(name) for name in self.known_face_names]
