import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Base URL for the API
const API_BASE_URL = 'http://192.168.54.30:8000/api'; // Change this to your actual API endpoint

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  console.log('API response status:', response.status);

  if (response.status === 401) {
    // Unauthorized, clear token and user data
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('farmer_assistant_user');
    throw new Error('Unauthorized access. Please log in again.');
  }
  if (!response.ok) {
    // Try to parse error message from response
    try {
      const errorData = await response.json();
      console.log('Registration error details:', errorData);
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    } catch (e) {
      throw new Error(`HTTP error ${response.status}`);
    }
  }

  return response.json();
};

// Function to submit soil data to backend
export const submitSoilData = async (data: {
  user_id: string;
  nitrogen?: string;
  phosphorus?: string;
  potassium?: string;
  ec?: string;
  pH?: string;
  soilMoisture?: string;
  temperature?: string;
  humidity?: string;
  altitude?: string;
  pressure?: string;
  soilTemperature?: string;
  reading_time?: string;
  device_id?: string;
  latitude?: number;
  longitude?: number;
}) => {
  if (Platform.OS === 'web') {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true, message: 'Data submitted successfully' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/submit_soil_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('API error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Submission failed',
    };
  }
};

// Function to get recommendations based on farmer ID
export const getRecommendations = async (farmerId: string) => {
  // For demo purposes, simulate a successful API call
  if (Platform.OS === 'web') {
    // Mock successful response for web
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return {
      success: true,
      data: [
        // Mock data would be returned here
        // The actual UI already has this mock data hardcoded
      ],
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/recommendations?farmer_id=${farmerId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
        },
      }
    );

    return handleResponse(response);
  } catch (error) {
    console.error('API error:', error);
    // For demo/development, return success anyway
    return {
      success: true,
      data: [
        // Mock data would be returned here
        // The actual UI already has this mock data hardcoded
      ],
    };
  }
};

const USER_STORAGE_KEY = 'farmer_assistant_user';

// Function to login using Laravel Sanctum API
export const loginApi = async (phone: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ phone, password }),
    });

    const data = await handleResponse(response);

    if (!data.user || !data.token) {
      throw new Error('Invalid login response');
    }
    // Store user with the same key as AuthContext
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    await AsyncStorage.setItem('token', data.token);

    return {
      success: true,
      user: data.user,
      token: data.token,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Login failed',
    };
  }
};

// Function to register using Laravel Sanctum API
export const registerApi = async (userData: {
  name: string;
  phone: string;
  password: string;
  password_confirmation: string; // <-- add this
  location?: string;
  landSize?: string;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await handleResponse(response);

    if (!data.user || !data.token) {
      throw new Error('Invalid registration response');
    }
    // Store user with the same key as AuthContext
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    await AsyncStorage.setItem('token', data.token);

    return {
      success: true,
      user: data.user,
      token: data.token,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed',
    };
  }
};

// Function to fetch all soil readings for a user
export const getUserSoilReadings = async (userId: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/soil_readings?user_id=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
        },
      }
    );
    return await handleResponse(response);
  } catch (error) {
    console.error('API error:', error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to fetch readings',
      data: [],
    };
  }
};
