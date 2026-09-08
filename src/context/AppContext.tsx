import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Transaction, BlogPost } from '../types';
import Swal from 'sweetalert2';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  transactions: Transaction[];
  login: (email: string, password: string) => void;
  register: (user: Omit<User, 'id' | 'role' | 'status'>) => void;
  logout: () => void;
  updateUserStatus: (userId: string, status: 'active' | 'blocked') => void;
  editUserPassword: (userId: string, newPass: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'status'>) => void;
  updatePaymentMethod: (userId: string, method: string) => void;
  updateTransactionStatus: (transactionId: string, status: 'pending' | 'approved' | 'completed' | 'rejected', reason?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial mock data
const MOCK_ADMIN: User = {
  id: 'admin-1',
  name: 'Anuj Admin',
  email: 'anuj8986@rahul.com',
  phone: '1234567890',
  role: 'admin',
  status: 'active',
  password: 'Anuj7250#@'
};

const MOCK_USER: User = {
  id: 'user-1',
  name: 'Test User',
  email: 'user@example.com',
  phone: '0987654321',
  role: 'user',
  status: 'active',
  password: 'user'
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    userId: 'user-1',
    cardName: 'Amazon Gift Card',
    code: 'AMZN-1234-5678',
    amount: 100,
    quantity: 1,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'completed'
  },
  {
    id: 'tx-2',
    userId: 'user-1',
    cardName: 'Steam Wallet',
    code: 'STM-9876-5432\nSTM-1111-2222',
    amount: 50,
    quantity: 2,
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'pending'
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load from local storage or set defaults
  useEffect(() => {
    const storedUsers = localStorage.getItem('cx_users');
    const storedTransactions = localStorage.getItem('cx_transactions');
    const storedCurrentUser = localStorage.getItem('cx_currentUser');

    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      
      // Migration: Ensure the new admin credentials are set even if old ones exist
      const hasNewAdmin = parsedUsers.some((u: User) => u.email === 'anuj8986@rahul.com');
      if (!hasNewAdmin) {
        // Remove old admin and push new one
        const updatedUsers = parsedUsers.filter((u: User) => u.role !== 'admin');
        updatedUsers.unshift(MOCK_ADMIN);
        setUsers(updatedUsers);
      } else {
        setUsers(parsedUsers);
      }
    } else {
      setUsers([MOCK_ADMIN, MOCK_USER]);
    }

    if (storedTransactions) {
      const parsedTxs = JSON.parse(storedTransactions).map((t: any) => ({
        ...t,
        quantity: t.quantity || 1 // Migration for old data
      }));
      setTransactions(parsedTxs);
    } else {
      setTransactions(MOCK_TRANSACTIONS);
    }

    if (storedCurrentUser) {
      setCurrentUser(JSON.parse(storedCurrentUser));
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (users.length > 0) localStorage.setItem('cx_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (transactions.length > 0) localStorage.setItem('cx_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cx_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cx_currentUser');
    }
  }, [currentUser]);

  const login = (email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      if (user.status === 'blocked') {
        Swal.fire({
          icon: 'error',
          title: 'Account Blocked',
          text: 'Your account has been blocked. Please contact support.',
        });
        return;
      }
      setCurrentUser(user);
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: `Welcome back, ${user.name}!`,
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Invalid email or password. Please check your credentials or sign up.',
      });
    }
  };

  const register = (newUserData: Omit<User, 'id' | 'role' | 'status'>) => {
    if (users.some(u => u.email === newUserData.email)) {
      Swal.fire({
        icon: 'warning',
        title: 'Registration Failed',
        text: 'An account with this email already exists.',
      });
      return;
    }
    const newUser: User = {
      ...newUserData,
      id: `user-${Date.now()}`,
      role: 'user',
      status: 'active'
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    Swal.fire({
      icon: 'success',
      title: 'Registration Successful',
      text: 'Your account has been created.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const logout = () => {
    setCurrentUser(null);
    Swal.fire({
      icon: 'info',
      title: 'Logged Out',
      text: 'You have been successfully logged out.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const updateUserStatus = (userId: string, status: 'active' | 'blocked') => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
  };

  const editUserPassword = (userId: string, newPass: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPass } : u));
    Swal.fire({
      icon: 'success',
      title: 'Password Updated',
      text: 'Password has been successfully updated.',
    });
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date' | 'status'>) => {
    const newTx: Transaction = {
      ...transaction,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      status: 'pending'
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const updatePaymentMethod = (userId: string, method: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, paymentMethod: method } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, paymentMethod: method } : null);
    }
  };

  const updateTransactionStatus = (transactionId: string, status: 'pending' | 'approved' | 'completed' | 'rejected', reason?: string) => {
    setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status, rejectionReason: reason } : t));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      transactions,
      login,
      register,
      logout,
      updateUserStatus,
      editUserPassword,
      addTransaction,
      updatePaymentMethod,
      updateTransactionStatus
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
