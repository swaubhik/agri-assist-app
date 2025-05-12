import { Platform } from 'react-native';

// Base URL for the API
const API_BASE_URL = 'https://example.com/api'; // Change this to your actual API endpoint

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Try to parse error message from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    } catch (e) {
      throw new Error(`HTTP error ${response.status}`);
    }
  }
  
  return response.json();
};

// Function to submit soil data to backend
export const submitSoilData = async (data: {
  farmerId: string;
  nitrogenValue: number;
  phosphorusValue: number;
  potassiumValue: number;
  location?: { latitude: number; longitude: number };
}) => {
  // For demo purposes, simulate a successful API call
  if (Platform.OS === 'web') {
    // Mock successful response for web
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: 'Data submitted successfully' };
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/submit_soil_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('API error:', error);
    // For demo/development, return success anyway
    return { success: true, message: 'Data submitted successfully (mock)' };
  }
};

// Function to get recommendations based on farmer ID
export const getRecommendations = async (farmerId: string) => {
  // For demo purposes, simulate a successful API call
  if (Platform.OS === 'web') {
    // Mock successful response for web
    await new Promise(resolve => setTimeout(resolve, 1200));
    return { 
      success: true, 
      data: [
        // Mock data would be returned here
        // The actual UI already has this mock data hardcoded
      ]
    };
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/recommendations?farmer_id=${farmerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('API error:', error);
    // For demo/development, return success anyway
    return { 
      success: true, 
      data: [
        // Mock data would be returned here
        // The actual UI already has this mock data hardcoded
      ]
    };
  }
};

// Function to login (mock for demo)
export const loginApi = async (phone: string, password: string) => {
  // For demo purposes, simulate a successful API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Always return success for demo
  return { 
    success: true, 
    user: {
      id: '123',
      name: 'Demo Farmer',
      phone,
      location: 'Punjab, India',
      landSize: '5 acres',
    }
  };
};

// Function to register (mock for demo)
export const registerApi = async (userData: {
  name: string;
  phone: string;
  password: string;
  location?: string;
  landSize?: string;
}) => {
  // For demo purposes, simulate a successful API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Always return success for demo
  return { 
    success: true, 
    user: {
      id: Math.random().toString(36).substring(2, 15),
      ...userData,
    }
  };
};