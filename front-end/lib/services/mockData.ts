import { Notification, UserProfile, ManagedPage } from '../types';

export const INITIAL_USER: UserProfile = {
  uuid: '019b07b1-f589-7af7-8d95-a6bb5b1507a5',
  name: 'John Doe',
  username: '@johndoe',
  email: 'john.doe@example.com',
  avatarUrl: 'https://gravatar.com/avatar/735400c71459b8cd7802fd9f7e507156?s=400&d=robohash&r=x',
  bio: 'Event enthusiast and tech lover.',
  
};

export const MOCK_PAGES: ManagedPage[] = [
  { id: 'p1', name: 'TechDaily Community', avatarUrl: 'https://i.pravatar.cc/100?img=10' },
  { id: 'p2', name: 'NYC Nightlife', avatarUrl: 'https://i.pravatar.cc/100?img=12' }
];

export const MOCK_USERS: UserProfile[] = [
  { uuid: '019b07b1-2df4-7b73-8996-4f341acd58ad', name: 'Jane Smith', username: '@janesmith', email: 'jane@test.com', avatarUrl: 'https://i.pravatar.cc/100?img=5' },
  { uuid: '019b07b1-50f1-7107-9c62-c09d7d000d8a', name: 'Alex Rivera', username: '@arivera', email: 'alex@test.com', avatarUrl: 'https://i.pravatar.cc/100?img=3' },
  { uuid: '019b07b1-9159-7d85-92c8-01f26f877aaf', name: 'Sarah Connor', username: '@sarahc', email: 'sarah@test.com', avatarUrl: 'https://i.pravatar.cc/100?img=9' },
];

export const ALL_CATEGORIES = ['All', 'Music', 'Tech', 'Art', 'Gaming', 'Education', 'Business', 'Food', 'Sports', 'Health', 'Fashion', 'Other'];
export const AVAILABLE_COUNTRIES = ['USA', 'UK', 'Canada', 'Germany', 'France', 'Japan', 'Vietnam'];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Ticket Confirmed',
    message: 'You have successfully booked tickets for Tech Conference 2024.',
    time: '2 mins ago',
    isRead: false,
    type: 'success'
  },
  {
    id: '2',
    title: 'Event Reminder',
    message: 'Summer Music Festival starts tomorrow at 18:00.',
    time: '1 hour ago',
    isRead: false,
    type: 'info'
  },
  {
    id: '3',
    title: 'New Event Nearby',
    message: 'A new Art Exhibition has been scheduled near your location.',
    time: '5 hours ago',
    isRead: true,
    type: 'info'
  },
  {
    id: '4',
    title: 'Payment Update',
    message: 'Your payment method is about to expire.',
    time: '1 day ago',
    isRead: true,
    type: 'warning'
  }
];

