import { Event, Notification, UserProfile } from './types';

// Helper to get relative dates for demo purposes
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const FEATURED_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Summer Music Festival',
    description: 'The biggest indie music festival of the season featuring top artists.',
    date: formatDate(today),
    time: '18:00 - 22:00',
    location: 'Central Park, New York',
    imageUrl: 'https://images.unsplash.com/photo-1663028055174-6281c778f81b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    organizer: {
      name: 'Vibe Nation',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vibe'
    },
    category: 'Music',
    price: '$45',
    status: 'upcoming',
    attendeesCount: 342
  },
  {
    id: '2',
    title: 'Tech Conference 2024',
    description: 'Annual gathering of tech enthusiasts, founders, and VCs.',
    date: formatDate(today),
    time: '09:00 - 17:00',
    location: 'Convention Center, SF',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    organizer: {
      name: 'TechCrunch',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech'
    },
    category: 'Tech',
    price: '$299',
    status: 'full',
    attendeesCount: 1250
  },
  {
    id: '3',
    title: 'Art Exhibition Opening',
    description: 'Contemporary art showcase "Future Past" by local artists.',
    date: formatDate(tomorrow),
    time: '19:00 - 21:00',
    location: 'Modern Art Museum, LA',
    imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    organizer: {
      name: 'MOMA',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Art'
    },
    category: 'Art',
    price: 'Free',
    status: 'upcoming',
    attendeesCount: 218
  },
  {
    id: '4',
    title: 'Gaming Tournament Finals',
    description: 'Watch the top teams compete for the championship trophy.',
    date: formatDate(tomorrow),
    time: '14:00 - 20:00',
    location: 'Esports Arena',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    organizer: {
      name: 'GameOn',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Game'
    },
    category: 'Gaming',
    price: '$15',
    status: 'upcoming',
    attendeesCount: 890
  },
  {
    id: '5',
    title: 'Pastry Workshop',
    description: 'Learn to make french macarons with Chef Pierre.',
    date: formatDate(nextWeek),
    time: '10:00 - 13:00',
    location: 'Culinary Institute',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    organizer: {
      name: 'Sweet Life',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Food'
    },
    category: 'Workshop',
    price: '$80',
    status: 'upcoming',
    attendeesCount: 12
  },
  {
    id: '6',
    title: 'Sunset Yoga',
    description: 'End your day with a relaxing flow by the beach.',
    date: '2023-11-15', // Past date
    time: '17:30 - 18:30',
    location: 'Santa Monica Beach',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    organizer: {
      name: 'Zen Yoga',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yoga'
    },
    category: 'Wellness',
    price: 'Free',
    status: 'ended',
    attendeesCount: 45
  }
];

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

export const INITIAL_USER: UserProfile = {
  name: 'John Doe',
  username: '@johndoe',
  email: 'john.doe@example.com',
  avatarUrl: 'JD',
  bio: 'Event enthusiast and tech lover.'
};