import { Platform } from 'react-native';

// Use localhost for iOS simulator, 10.0.2.2 for Android emulator
// For physical devices, you must replace this with your computer's local IP address (e.g., '192.168.1.5')
const getBaseUrl = () => {
  if (__DEV__) {
    // Replace with your computer's local IP address from ipconfig
    return 'http://192.168.0.106:8000';
  }
  // Production URL
  return 'http://192.168.0.106:8000';
};

export const API_BASE_URL = getBaseUrl();

/**
 * Register a new student with their photo and roll number
 */
export const registerStudentAPI = async (name: string, roll: string, imageUri: string) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('roll', roll);
  
  // Extract filename
  const filename = imageUri.split('/').pop() || 'photo.jpg';
  
  // Infer type
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;
  
  // @ts-ignore
  formData.append('file', {
    uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
    name: filename,
    type,
  });

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || 'Failed to register student');
    }
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Recognize students in a classroom photo
 */
export const recognizeClassroomAPI = async (imageUri: string, tolerance: number = 0.5) => {
  const formData = new FormData();
  formData.append('tolerance', tolerance.toString());
  
  // Extract filename
  const filename = imageUri.split('/').pop() || 'classroom.jpg';
  
  // Infer type
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;
  
  // @ts-ignore
  formData.append('file', {
    uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
    name: filename,
    type,
  });

  try {
    const response = await fetch(`${API_BASE_URL}/recognize`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || 'Failed to process attendance');
    }
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Fetch all registered students
 */
export const getStudentsAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/students`);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || 'Failed to fetch students');
    }
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Fetch specific student history
 */
export const getStudentHistoryAPI = async (name: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${encodeURIComponent(name)}/history`);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || 'Failed to fetch student history');
    }
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Delete a student by name
 */
export const deleteStudentAPI = async (name: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || 'Failed to delete student');
    }
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
