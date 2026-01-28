import { useState, useCallback, useEffect } from 'react';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  school: string;
  clubName?: string;
  createdAt: string;
}

const AUTH_STORAGE_KEY = 'moyeora_demo_auth';
const USERS_STORAGE_KEY = 'moyeora_demo_users';

// Pre-defined test account
const TEST_ACCOUNT: DemoUser = {
  id: 'test-user-001',
  email: '5070joshua@gmail.com',
  name: '테스트 유저',
  school: '서울과학고',
  clubName: 'S2 Lab',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const TEST_PASSWORD = '123456';

function loadUser(): DemoUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadUsers(): DemoUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const users = raw ? JSON.parse(raw) : [];
    // Ensure test account exists
    if (!users.some((u: DemoUser) => u.email === TEST_ACCOUNT.email)) {
      users.push(TEST_ACCOUNT);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
    return users;
  } catch {
    return [TEST_ACCOUNT];
  }
}

function saveUser(user: DemoUser | null) {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

function saveUsers(users: DemoUser[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function useAuth() {
  const [user, setUser] = useState<DemoUser | null>(loadUser);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with localStorage on mount and ensure test account exists
  useEffect(() => {
    loadUsers(); // This ensures test account is created
    setUser(loadUser());
  }, []);

  const signUp = useCallback(async (data: {
    email: string;
    password: string;
    name: string;
    school: string;
    clubName?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = loadUsers();
    
    // Check if email already exists
    if (users.some(u => u.email === data.email)) {
      setIsLoading(false);
      return { success: false, error: '이미 가입된 이메일입니다.' };
    }
    
    // Create new user
    const newUser: DemoUser = {
      id: 'u' + Math.floor(Math.random() * 1e7).toString(16),
      email: data.email,
      name: data.name,
      school: data.school,
      clubName: data.clubName,
      createdAt: new Date().toISOString(),
    };
    
    // Save to "database"
    saveUsers([...users, newUser]);
    
    // Auto login after signup
    saveUser(newUser);
    setUser(newUser);
    
    setIsLoading(false);
    return { success: true };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = loadUsers();
    const foundUser = users.find(u => u.email === email);
    
    if (!foundUser) {
      setIsLoading(false);
      return { success: false, error: '등록되지 않은 이메일입니다.' };
    }
    
    // Check password for test account
    if (email === TEST_ACCOUNT.email && password !== TEST_PASSWORD) {
      setIsLoading(false);
      return { success: false, error: '비밀번호가 올바르지 않습니다.' };
    }
    
    saveUser(foundUser);
    setUser(foundUser);
    
    setIsLoading(false);
    return { success: true };
  }, []);

  const signOut = useCallback(() => {
    saveUser(null);
    setUser(null);
  }, []);

  const tryDemo = useCallback(() => {
    const guestUser: DemoUser = {
      id: 'guest-demo',
      email: 'guest@demo.moyeora.kr',
      name: '체험 사용자',
      school: '체험 모드',
      clubName: undefined,
      createdAt: new Date().toISOString(),
    };
    saveUser(guestUser);
    setUser(guestUser);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isGuest: user?.id === 'guest-demo',
    signUp,
    signIn,
    signOut,
    tryDemo,
  };
}
