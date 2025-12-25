import { Event, UserProfile, Notification } from '../types';

/**
 * Fetches the list of events from the public JSON file.
 */
export const fetchEvents = async (): Promise<Event[]> => {
  try {
    const response = await fetch('/data/events.json');
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    const events = await response.json();
    // Normalize events to match our type structure
    return events.map((e: any) => ({
      ...e,
      dateStr: e.dateStr || e.date || '',
      organizerName: e.organizerName || e.organizer?.name || '',
      organizerAvatar: e.organizerAvatar || e.organizer?.avatarUrl || '',
      isLiked: e.isLiked || e.isInterested || false,
    }));
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
};

/**
 * Fetches the user profile from the public JSON file.
 */
export const fetchUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await fetch('/data/user.json');
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading user profile:', error);
    // Return a fallback user to prevent app crash
    return {
      uuid: '',
      name: 'Guest',
      username: '@guest',
      email: '',
      avatarUrl: 'GU',
      bio: ''
    };
  }
};

/**
 * Fetches notifications from the public JSON file.
 */
export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await fetch('/data/notifications.json');
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading notifications:', error);
    return [];
  }
};

