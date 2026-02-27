import { Event, Notification, UserProfile } from './types';

// Helper to get relative dates for demo purposes
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const CATEGORIES = ['All', 'Tech', 'Art', 'Social', 'Workshop', 'Wellness', 'Music', 'Gaming'];

// Updated NAV_ITEMS with IDs for internal routing
export const NAV_ITEMS = [
  { label: 'Community', id: 'community', href: '#' },
  { label: 'Download', id: 'download', href: '#download' }
];

export const REVIEWS = [
  {
    id: '1',
    eventId: '6',
    userId: '101',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    rating: 5,
    comment: 'Absolutely magical experience! The sunset view was breathtaking.',
    createdAt: '2023-11-16'
  },
  {
    id: '2',
    eventId: '6',
    userId: '102',
    userName: 'Mike Chen',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    rating: 4,
    comment: 'Great instructor, but it was a bit windy.',
    createdAt: '2023-11-16'
  }
];

export const COMMUNITY_POSTS = [
  {
    id: '1',
    author: {
      name: 'Alex Rivera',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
    },
    content: 'Does anyone have extra tickets for the Summer Music Festival?',
    likes: 12,
    comments: 4,
    timeAgo: '2h ago',
    category: 'Tickets'
  },
  {
    id: '2',
    author: {
      name: 'Jessica Wu',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jess'
    },
    content: 'Just came back from the Tech Conference. The AI panel was mind-blowing! 🤯',
    likes: 45,
    comments: 18,
    timeAgo: '5h ago',
    category: 'Discussion'
  },
  {
    id: '3',
    author: {
      name: 'David Miller',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave'
    },
    content: 'Looking for a group to go to the Gaming Tournament this weekend.',
    likes: 8,
    comments: 12,
    timeAgo: '1d ago',
    category: 'Social'
  }
];
