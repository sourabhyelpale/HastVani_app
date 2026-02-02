/**
 * API Client with Axios
 * Handles authentication, token refresh, and error handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from './config';

// Create axios instance
const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Create ML API instance
export const mlApi = axios.create({
  baseURL: config.mlApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Get stored tokens
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(config.accessTokenKey);
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(config.refreshTokenKey);
};

// Store tokens
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(config.accessTokenKey, accessToken);
  localStorage.setItem(config.refreshTokenKey, refreshToken);
};

// Clear tokens
export const clearTokens = () => {
  localStorage.removeItem(config.accessTokenKey);
  localStorage.removeItem(config.refreshTokenKey);
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (axiosConfig: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && axiosConfig.headers) {
      axiosConfig.headers.Authorization = `${config.tokenPrefix} ${token}`;
    }
    return axiosConfig;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for the token to be refreshed
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `${config.tokenPrefix} ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${config.apiUrl}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data.data;

        setTokens(newAccessToken, newRefreshToken);
        onTokenRefreshed(newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `${config.tokenPrefix} ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const authApi = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    age: number;
    role?: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),

  getCurrentUser: () => api.get('/auth/me'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

export const userApi = {
  getAll: (params?: { page?: number; limit?: number; role?: string }) =>
    api.get('/users', { params }),

  getById: (id: string) => api.get(`/users/${id}`),

  update: (id: string, data: Partial<{
    firstName: string;
    lastName: string;
    age: number;
    avatar: string;
  }>) => api.patch(`/users/${id}`, data),

  getProgress: (id: string) => api.get(`/users/${id}/progress`),

  getAchievements: (id: string) => api.get(`/users/${id}/achievements`),
};

export const moduleApi = {
  getAll: (params?: { category?: string; difficulty?: string; published?: boolean }) =>
    api.get('/modules', { params }),

  getById: (id: string) => api.get(`/modules/${id}`),

  create: (data: {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    order: number;
    estimatedTime: number;
    xpReward: number;
    gemsReward: number;
  }) => api.post('/modules', data),

  update: (id: string, data: Partial<{
    title: string;
    description: string;
    category: string;
    difficulty: string;
    order: number;
    isPublished: boolean;
  }>) => api.patch(`/modules/${id}`, data),

  delete: (id: string) => api.delete(`/modules/${id}`),

  togglePublish: (id: string) => api.post(`/modules/${id}/toggle-publish`),
};

export const lessonApi = {
  getByModule: (moduleId: string) => api.get(`/lessons?module=${moduleId}`),

  getById: (id: string) => api.get(`/lessons/${id}`),

  create: (data: {
    module: string;
    title: string;
    description: string;
    type: string;
    content: Array<{ type: string; content: string; mediaUrl?: string }>;
    questions: Array<{ type: string; question: string; options?: string[]; correctAnswer: string | number; points: number }>;
    order: number;
    duration: number;
    xpReward: number;
  }) => api.post('/lessons', data),

  update: (id: string, data: Partial<{
    title: string;
    description: string;
    content: Array<{ type: string; content: string }>;
    questions: Array<{ type: string; question: string }>;
    isPublished: boolean;
  }>) => api.patch(`/lessons/${id}`, data),

  delete: (id: string) => api.delete(`/lessons/${id}`),

  start: (id: string) => api.post(`/lessons/${id}/start`),

  submitAnswer: (id: string, data: { questionIndex: number; answer: string | number }) =>
    api.post(`/lessons/${id}/submit-answer`, data),

  complete: (id: string, data: { timeSpent: number; answers?: Array<{ questionIndex: number; answer: string | number }> }) =>
    api.post(`/lessons/${id}/complete`, data),
};

export const classApi = {
  getAll: () => api.get('/classes'),

  getById: (id: string) => api.get(`/classes/${id}`),

  create: (data: {
    name: string;
    description: string;
    modules?: string[];
  }) => api.post('/classes', data),

  update: (id: string, data: Partial<{
    name: string;
    description: string;
    modules: string[];
    settings: { allowSelfEnroll: boolean; maxStudents: number };
  }>) => api.patch(`/classes/${id}`, data),

  delete: (id: string) => api.delete(`/classes/${id}`),

  join: (id: string, classCode: string) =>
    api.post(`/classes/${id}/join`, { classCode }),

  getStudents: (id: string) => api.get(`/classes/${id}/students`),

  getLeaderboard: (id: string) => api.get(`/classes/${id}/leaderboard`),
};

export const assignmentApi = {
  getByClass: (classId: string) => api.get(`/assignments?class=${classId}`),

  getById: (id: string) => api.get(`/assignments/${id}`),

  create: (data: {
    class: string;
    title: string;
    description: string;
    type: string;
    content: { lessons?: string[]; questions?: Array<{ type: string; question: string }>; gestures?: string[] };
    dueDate: string;
    xpReward: number;
  }) => api.post('/assignments', data),

  update: (id: string, data: Partial<{
    title: string;
    description: string;
    dueDate: string;
    isPublished: boolean;
  }>) => api.patch(`/assignments/${id}`, data),

  delete: (id: string) => api.delete(`/assignments/${id}`),

  submit: (id: string, data: {
    answers?: Array<{ questionIndex: number; answer: string | number }>;
    gestureResults?: Array<{ gestureName: string; recognized: boolean; confidence: number }>;
  }) => api.post(`/assignments/${id}/submit`, data),

  getSubmissions: (id: string) => api.get(`/assignments/${id}/submissions`),

  gradeSubmission: (assignmentId: string, submissionId: string, data: {
    score: number;
    feedback?: string;
  }) => api.patch(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, data),
};

export const gamificationApi = {
  getMyStats: () => api.get('/gamification/my-stats'),

  getLeaderboard: (type?: string, limit?: number) =>
    api.get('/gamification/leaderboard', { params: { type, limit } }),

  getAllAchievements: () => api.get('/gamification/achievements'),

  claimStreak: () => api.post('/gamification/claim-streak'),

  refillHearts: () => api.post('/gamification/refill-hearts'),

  useStreakFreeze: () => api.post('/gamification/use-streak-freeze'),
};

export const signApi = {
  getAll: (params?: { category?: string; difficulty?: string; search?: string }) =>
    api.get('/signs', { params }),

  getById: (id: string) => api.get(`/signs/${id}`),

  getRandom: (count?: number, category?: string) =>
    api.get('/signs/random', { params: { count, category } }),

  getAlphabet: () => api.get('/signs/alphabet'),

  getNumbers: () => api.get('/signs/numbers'),

  create: (data: {
    name: string;
    description: string;
    category: string;
    difficulty: string;
    videoUrl?: string;
    imageUrl?: string;
    landmarks?: number[][];
  }) => api.post('/signs', data),

  update: (id: string, data: Partial<{
    name: string;
    description: string;
    videoUrl: string;
    imageUrl: string;
    isPublished: boolean;
  }>) => api.patch(`/signs/${id}`, data),

  delete: (id: string) => api.delete(`/signs/${id}`),
};

export const notificationApi = {
  getAll: (params?: { unreadOnly?: boolean; limit?: number }) =>
    api.get('/notifications', { params }),

  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllAsRead: () => api.post('/notifications/mark-all-read'),

  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// ML API methods
export const gestureApi = {
  recognize: (imageData: string) =>
    mlApi.post('/recognize', { image: imageData }),

  recognizeUpload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return mlApi.post('/recognize-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  validateGesture: (imageData: string, expectedGesture: string) =>
    mlApi.post('/validate-gesture', { image: imageData, expected_gesture: expectedGesture }),

  getSupportedGestures: () => mlApi.get('/supported-gestures'),

  extractLandmarks: (imageData: string) =>
    mlApi.post('/extract-landmarks', { image: imageData }),
};

export default api;
