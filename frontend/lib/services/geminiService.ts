import { Event } from '../types';
import { fetchEvents } from './dataService';

export const generateAIRecommendedEvents = async (topic: string): Promise<Event[]> => {
  // Simulate AI processing delay
  console.log(`[Mock AI] Searching for: ${topic}`);
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Fetch fresh data
  const events = await fetchEvents();

  // Return mock data filtered by topic to simulate "AI" relevance
  // If no match, return a subset of events as "recommendations"
  if (!topic) return events;

  const lowerTopic = topic.toLowerCase();
  const relevantEvents = events.filter(e => 
    e.title.toLowerCase().includes(lowerTopic) ||
    e.category.toLowerCase().includes(lowerTopic) ||
    e.description?.toLowerCase().includes(lowerTopic)
  );

  return relevantEvents.length > 0 ? relevantEvents : events.slice(0, 3);
};

