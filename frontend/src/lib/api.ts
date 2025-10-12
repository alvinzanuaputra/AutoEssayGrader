// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface User {
  id: number;
  email: string;
  fullname: string;
  username: string;
  notelp?: string;
  institution?: string;
  biografi?: string;
  profile_picture?: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  is_oauth_user?: boolean;
}

export interface UpdateProfileData {
  fullname?: string;
  email?: string;
  username?: string;
  notelp?: string;
  institution?: string;
  biografi?: string;
  profile_picture?: string;
}

export interface RegisterData {
  fullname: string;
  username: string;
  email: string;
  password: string;
  notelp?: string;
  institution?: string;
  biografi?: string;
  profile_picture?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface ApiError {
  detail: string;
}

// Helper function to handle API errors
const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An error occurred';
};

// Register user
export const registerUser = async (data: RegisterData): Promise<RegisterResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }

    return await response.json();
  } catch (error: unknown) {
    throw new Error(handleApiError(error));
  }
};

// Login user
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    return await response.json();
  } catch (error: unknown) {
    throw new Error(handleApiError(error));
  }
};

// Get current user
export const getCurrentUser = async (token: string): Promise<User> => {
  try {
    console.log("📡 API: Calling getCurrentUser with token:", token.substring(0, 20) + "...");

    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("📡 API: Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API: Error response:", errorText);
      throw new Error('Failed to get user information: ' + errorText);
    }

    const userData = await response.json();
    console.log("✅ API: User data received:", userData);
    return userData;
  } catch (error: unknown) {
    console.error("❌ API: getCurrentUser error:", error);
    throw new Error(handleApiError(error));
  }
};

// Get OAuth authorization URL
export const getGoogleAuthUrl = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/oauth/google`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to get Google authorization URL');
    }

    const data = await response.json();
    return data.authorization_url;
  } catch (error: unknown) {
    throw new Error(handleApiError(error));
  }
};

export const getGithubAuthUrl = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/oauth/github`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to get GitHub authorization URL');
    }

    const data = await response.json();
    return data.authorization_url;
  } catch (error: unknown) {
    throw new Error(handleApiError(error));
  }
};

// Update user profile
export const updateUserProfile = async (token: string, data: UpdateProfileData): Promise<User> => {
  try {
    console.log("📡 API: Updating user profile with data:", data);

    const response = await fetch(`${API_URL}/api/users/me`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log("📡 API: Update response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API: Error response:", errorText);

      // Parse error message
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.detail || 'Failed to update profile');
      } catch {
        throw new Error(errorText || 'Failed to update profile');
      }
    }

    const userData = await response.json();
    console.log("✅ API: Profile updated successfully:", userData);
    return userData;
  } catch (error: unknown) {
    console.error("❌ API: updateUserProfile error:", error);
    // Don't wrap error again, just throw it
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update profile');
  }
};


// Storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Helper to get cookie value
function getCookieValue(name: string): string | null {
  if (typeof window === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }
  return null;
}

// Token management
export const saveAuthData = (token: string, user: User) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // Try to get from cookies first (primary storage)
    const cookieToken = getCookieValue('token');
    if (cookieToken) {
      return cookieToken;
    }

    // Fallback to localStorage
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
  }
  return null;
};

export const getAuthUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
