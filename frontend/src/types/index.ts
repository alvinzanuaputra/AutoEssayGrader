export interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    createdAt: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginFormData {
    emailOrUsername: string;
    password: string;
    rememberMe: boolean;
}

export interface RegisterFormData {
    fullName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
}

export interface Essay {
    id: string;
    title: string;
    topic: string;
    content: string;
    fileName?: string;
    createdAt: string;
    status: 'pending' | 'graded' | 'processing';
    score?: number;
    feedback?: string;
}

export interface GradingCriteria {
    id: string;
    name: string;
    description: string;
    weight: number;
}

export interface NewGradingFormData {
    title: string;
    topic: string;
    content: string;
    criteria: string[];
    file?: File;
}

export interface GradingResult {
    id: string;
    essayId: string;
    score: number;
    maxScore: number;
    feedback: string;
    criteriaScores: {
        criteriaId: string;
        criteriaName: string;
        score: number;
        maxScore: number;
        feedback: string;
    }[];
    gradedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface RegisterResponse {
    user: User;
    message: string;
}

export interface DashboardStats {
    totalEssays: number;
    gradedEssays: number;
    pendingEssays: number;
    averageScore: number;
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface FormValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

export type PasswordStrength = 'weak' | 'medium' | 'strong';

export interface PasswordStrengthResult {
    strength: PasswordStrength;
    message: string;
    hasMinLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
}
