import {
    User,
    LoginResponse,
    RegisterResponse,
    ApiResponse,
    Essay,
    DashboardStats,
} from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockUsers: User[] = [
    {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        createdAt: new Date().toISOString(),
    },
];

const mockEssays: Essay[] = [
    {
        id: '1',
        title: 'The Impact of Technology on Education',
        topic: 'Education Technology',
        content: 'Technology has revolutionized the way we learn...',
        status: 'graded',
        score: 85,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '2',
        title: 'Climate Change and Its Effects',
        topic: 'Environmental Science',
        content: 'Climate change is one of the most pressing issues...',
        status: 'graded',
        score: 92,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
        id: '3',
        title: 'The Future of Artificial Intelligence',
        topic: 'Technology',
        content: 'Artificial Intelligence is rapidly advancing...',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
];

export const mockLogin = async (
    emailOrUsername: string,
    password: string
): Promise<ApiResponse<LoginResponse>> => {
    await delay(1500);
    if (!emailOrUsername || !password) {
        return {
            success: false,
            error: 'Email/username and password are required',
        };
    }

    const existingUser = mockUsers.find(
        u => u.email === emailOrUsername || u.username === emailOrUsername
    );

    if (existingUser || emailOrUsername.includes('@') || emailOrUsername.length >= 4) {
        const user = existingUser || {
            id: Math.random().toString(36).substr(2, 9),
            username: emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername,
            email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@example.com`,
            fullName: 'User ' + Math.random().toString(36).substr(2, 5),
            createdAt: new Date().toISOString(),
        };

        return {
            success: true,
            data: {
                user,
                token: 'mock-jwt-token-' + Math.random().toString(36).substr(2, 9),
            },
        };
    }

    return {
        success: false,
        error: 'Invalid credentials',
    };
};

export const mockRegister = async (
    fullName: string,
    email: string,
    username: string,
    password: string
): Promise<ApiResponse<RegisterResponse>> => {
    await delay(2000);

    if (!fullName || !email || !username || !password) {
        return {
            success: false,
            error: 'All fields are required',
        };
    }

    // Check if user already exists
    const existingUser = mockUsers.find(
        u => u.email === email || u.username === username
    );

    if (existingUser) {
        return {
            success: false,
            error: 'User with this email or username already exists',
        };
    }

    // Create new user
    const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        email,
        fullName,
        createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    return {
        success: true,
        data: {
            user: newUser,
            message: 'Registration successful! Please login.',
        },
    };
};

export const mockSubmitEssay = async (
    title: string,
    topic: string,
    content: string,
    _criteria: string[],
): Promise<ApiResponse<Essay>> => {
    await delay(2000);

    if (!title || !topic || !content) {
        return {
            success: false,
            error: 'Title, topic, and content are required',
        };
    }

    const newEssay: Essay = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        topic,
        content,
        status: 'processing',
        createdAt: new Date().toISOString(),
    };

    // Simulate grading process (in real app, this would be async)
    setTimeout(() => {
        newEssay.status = 'graded';
        newEssay.score = Math.floor(Math.random() * 30) + 70; // Random score 70-100
    }, 3000);

    mockEssays.push(newEssay);

    return {
        success: true,
        data: newEssay,
        message: 'Essay submitted successfully! Grading in progress...',
    };
};

export const mockGetEssayHistory = async (): Promise<ApiResponse<Essay[]>> => {
    await delay(500);

    return {
        success: true,
        data: mockEssays,
    };
};

export const mockGetDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
    await delay(500);

    const totalEssays = mockEssays.length;
    const gradedEssays = mockEssays.filter(e => e.status === 'graded').length;
    const pendingEssays = mockEssays.filter(e => e.status === 'pending' || e.status === 'processing').length;

    const gradedScores = mockEssays
        .filter(e => e.status === 'graded' && e.score !== undefined)
        .map(e => e.score as number);

    const averageScore = gradedScores.length > 0
        ? Math.round(gradedScores.reduce((a, b) => a + b, 0) / gradedScores.length)
        : 0;

    return {
        success: true,
        data: {
            totalEssays,
            gradedEssays,
            pendingEssays,
            averageScore,
        },
    };
};

export const mockGetGradingCriteria = async () => {
    await delay(300);

    return {
        success: true,
        data: [
            { id: '1', name: 'Grammar & Spelling', description: 'Checks for grammatical errors and spelling mistakes', weight: 20 },
            { id: '2', name: 'Content Quality', description: 'Evaluates the quality and relevance of content', weight: 30 },
            { id: '3', name: 'Structure & Organization', description: 'Assesses the logical flow and organization', weight: 25 },
            { id: '4', name: 'Vocabulary & Style', description: 'Reviews word choice and writing style', weight: 15 },
            { id: '5', name: 'Argumentation', description: 'Evaluates the strength of arguments presented', weight: 10 },
        ],
    };
};
