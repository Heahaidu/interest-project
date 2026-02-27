import { useEffect, useRef, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import { API_BASE_URL } from '@/lib/api/clients';

export interface ChatMessageWS {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  relatedEventIds?: string[];
  timestamp: Date;
}

export const useStompChat = () => {

  const url = `${API_BASE_URL}/ws-chat/websocket`;
  const topic = '/topic/answer';
  const appDestination = '/app/query';

  const [messages, setMessages] = useState<ChatMessageWS[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const client = new Client({
      brokerURL: url.startsWith('ws') ? url : url.replace(/^http/, 'ws'),
      reconnectDelay: 5000,
      debug: (str) => console.log('STOMP:', str),
    });

    client.onConnect = () => {
      console.log('Connected to STOMP WebSocket!');
      setIsConnected(true);

      client.subscribe(topic, (msg: IMessage) => {
        const body = JSON.parse(msg.body);
        setMessages((prev) => [...prev, {id: Date.now().toString(), sender: 'ai', text: body['answer'], relatedEventIds: body['sourceEventUuids'], timestamp: new Date() }]);
        setIsTyping(false);
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP Error:', frame);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate().catch((err) => console.error('Error deactivating STOMP:', err));
    };
  }, [url, topic]);

  const sendMessage = (text: string, topK = 10) => {
    if (!clientRef.current || !isConnected) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'user', text, timestamp: new Date() },
    ]);
    setIsTyping(true);

    clientRef.current.publish({
      destination: appDestination,
      body: JSON.stringify({ question: text, topK }),
    });
  };

  return { messages, sendMessage, isTyping };
};
