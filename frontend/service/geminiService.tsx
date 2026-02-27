
import { Event } from '../lib/types';

export const sendMessageToAI = async (message: string, allEvents: Event[]): Promise<{ text: string, eventIds: string[] }> => {
  await new Promise(resolve => setTimeout(resolve, 1200));

  const lowerMsg = message.toLowerCase();
  
  // 1. Find relevant events based on keywords
  const matchedEvents = allEvents.filter(e => 
    e.title.toLowerCase().includes(lowerMsg) ||
    e.category.toLowerCase().includes(lowerMsg) ||
    e.location.toLowerCase().includes(lowerMsg)
  );

  const eventIds = matchedEvents.map(e => e.uuid).slice(0, 3); // Limit to 3 suggestions

  // 2. Generate "Rhetorical" / Conversational Response
  let text = "";

  // Simple keyword matching for response tone
  if (matchedEvents.length > 0) {
      const categories = [...new Set(matchedEvents.map(e => e.category))].join(", ");
      text = `I found some ${categories} events that match what you're looking for. Check these out:`;
  } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      text = "Hello! I'm your event assistant. Tell me what kind of vibe you're looking for today, or ask about specific categories like Music or Tech.";
  } else if (lowerMsg.includes('help')) {
      text = "I can help you find events by category, location, or name. Try asking 'Show me music festivals' or 'Tech events in SF'.";
  } else {
      text = "I couldn't find exact matches for that right now, but here are some popular events you might find interesting instead.";
      // Fallback: suggest random events if no match
      if (eventIds.length === 0) {
          const randomEvents = allEvents.slice(0, 2);
          randomEvents.forEach(e => eventIds.push(e.uuid));
      }
  }

  return { text, eventIds };
};
