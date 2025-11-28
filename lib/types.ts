import React from 'react';

export interface Organizer {
  name: string;
  avatarUrl: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string YYYY-MM-DD
  time: string;
  location: string;
  imageUrl: string;
  organizer: Organizer;
  category: string; // Changed from literal union to string to support dynamic categories
  price: string;
  status: 'upcoming' | 'full' | 'ended';
  attendeesCount: number;
  isInterested?: boolean;
}

export interface DateFilter {
  start: string;
  end: string;
  isAuto: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface User {
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export type ViewMode = 'grid' | 'list';
export type Theme = 'light' | 'dark' | 'system';

export interface Review {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  content: string;
  likes: number;
  comments: number;
  timeAgo: string;
  category: string;
}

export type AppPage = 'discover' | 'interest' | 'profile' | 'activity';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning';
}

export interface UserProfile {
  name: string;
  email: string;
  username: string;
  avatarUrl: string;
  bio?: string;
}