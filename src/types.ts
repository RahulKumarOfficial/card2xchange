export type Role = 'user' | 'admin';
export type UserStatus = 'active' | 'blocked';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  password?: string; // Stored in memory for this demo
  paymentMethod?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  cardName: string;
  code: string;
  amount: number;
  quantity: number;
  expiryDate?: string;
  date: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  rejectionReason?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  imageUrl: string;
  author: string;
}
