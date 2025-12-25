import React from 'react';

export interface Event {
  uuid: string; 
  title: string; 
  startTime: string;
  endTime: string;
  countryCode: string;
  city: string;
  location: string;
  category: string; 
  imageUrl: string; 
  organizerName?: string;
  organizerAvatar?: string;
  organizerId?: string; 
  organizerType?: 'user' | 'page';
  coHosts?: UserProfile[]; 
  host: string;
  price?: number;
  currency?: string;
  description?: string;
  isSoldOut?: boolean;
  isEnded?: boolean;
  isLiked?: boolean;
  isOwner?: boolean;
  isRegistered?: boolean; 
  currentParticipants?: number;
  maxParticipants?: number;
  hasCheckedIn?:boolean;
  status?: 'upcoming' | 'full' | 'ended';
  isInterested?: boolean;

  showParticipants?: true,
  showReviews?: true 
}

export interface UserProfile {
  uuid: string;
  name: string;
  email: string;
  username: string;
  avatarUrl: string;
  bio?: string;

  // profile fields (backend POJO)
  accountUuid?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  dateOfBirth?: string; // ISO date string
  countryCode?: string;
  interests?: any; // jsonb
  socialLinks?: any; // jsonb
  preferences?: any; // jsonb
  privacySettings?: any; // jsonb
  createdAt?: string;
  updatedAt?: string;

  // Social profile fields
  coverUrl?: string;
  followers?: number;
  following?: number;
  jobTitle?: string;
  location?: string; // Formatted string e.g. "San Francisco, CA"
  city?: string; // New
  country?: string; // New
  timezone?: string; // New
  joinedDate?: string;
}

export interface ManagedPage {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning';
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface DateFilter {
  start: string;
  end: string;
  isAuto: boolean;
}

export type Theme = 'light' | 'dark' | 'system';
export type ViewMode = 'list' | 'grid';
export type AppPage = 'Discover' | 'Channel' | 'Bookmarks' | 'Profile' | 'Activity' | 'Settings' | 'Support';
export type ActivityTab = 'registered' | 'attended' | 'missed' | 'cancelled';
export type EventCardType = 'app' | 'landing' | 'chat'
export type NotificationType = "EVENT_REGISTERED"  | "EVENT_CREATED"  | string;

// Legacy types for backward compatibility
export interface Organizer {
  name: string;
  avatarUrl: string;
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

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  relatedEventIds?: string[];
  timestamp: Date;
}

export interface ReviewReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  comment: string;
  timestamp: string;
  userType?: 'organizer' | 'user';
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1-5
  comment: string;
  timestamp: string;
  replies: ReviewReply[];
}