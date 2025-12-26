import { useStompChat } from '../../hooks/useStompChat';
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User as UserIcon, Loader2, ChevronDown } from 'lucide-react';
import { Event } from '../../lib/types';
import EventCard from './EventCard';

interface AiChatWidgetProps {
  allEvents: Event[];
  onEventClick: (event: Event) => void;
}

const AiChatWidget: React.FC<AiChatWidgetProps> = ({ allEvents, onEventClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<typeof wsMessages>([]);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // STOMP chat hook
  const { messages: wsMessages, sendMessage, isTyping: wsTyping } = useStompChat(
    (process.env.API_BASE_URL || 'localhost:8080') + '/ws-chat/websocket',
    '/topic/answer',
    '/app/query'
  );

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [wsMessages, wsTyping, isOpen]);

  useEffect(() => {
    setMessages(prev => {
      const newMsgs = wsMessages.slice(prev.length);
      return [...prev, ...newMsgs];
    });
    console.log('Updated messages from WS:', wsMessages);
    console.log('Updated messages from WS:', messages.length);
  }, [wsMessages]);


  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.innerHeight + window.pageYOffset;
      setIsNearBottom(scrollHeight - scrollPosition < 150);
    };
    window.addEventListener('scroll', handleScroll);
    setIsNearBottom(document.documentElement.scrollHeight === window.innerHeight);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getEventById = (uuid: string) => allEvents.find((e) => e.uuid === uuid);

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer fixed z-50 w-14 h-14 right-24 lg:right-6 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 rounded-full" ${
          isOpen
            ? 'bg-gray-900 text-white dark:bg-white dark:text-black'
            : 'bg-gradient-to-tr from-brand-purple to-blue-500 text-white'
        }  ${
            isNearBottom 
            ? 'bottom-6 lg:bottom-24 ' 
            : 'bottom-6 lg:bottom-6 '
        }`}
      >
        {isOpen ? <ChevronDown size={28} /> : <Sparkles size={24} />}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed z-40 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden transition-all duration-300 ease-out flex flex-col ${
          isOpen
            ? 'right-4 md:right-6 w-[90vw] md:w-[380px] h-[600px] rounded-xl opacity-100 scale-100 translate-y-0'
            : 'bottom-10 right-6 w-0 h-0 opacity-0 scale-90 translate-y-10 rounded-xl'
        } ${
          isNearBottom 
          ? 'bottom-24 lg:bottom-42' 
          : 'bottom-24 lg:bottom-24'
      }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-purple to-blue-500 flex items-center justify-center shadow-lg">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Event Assistant</h3>
              <p className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* {wsMessages.map((msg) => ( */}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                msg.sender === 'user' ? 'bg-gray-200 dark:bg-white/10' : 'bg-brand-purple/10 text-brand-purple'
              }`}>
                {msg.sender === 'user' ? <UserIcon size={14} /> : <Bot size={16} />}
              </div>

              <div className="flex flex-col gap-2 max-w-[85%]">
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' ? 'bg-brand-purple text-white rounded-tr-sm' : 'bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>

                {msg.sender === 'ai' && (msg.relatedEventIds?.length ?? 0) > 0 && (
                  <div className="flex flex-col gap-2 mt-1">
                    {(msg.relatedEventIds ?? []).map(id => {
                      const event = getEventById(id);
                      if (!event) return null;
                      return <EventCard key={id} event={event} variant="chat" onClick={() => onEventClick(event)} />;
                    })}
                  </div>
                )}

                <span className="text-[10px] text-gray-400 px-1 opacity-50">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {wsTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-gray-100 dark:bg-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-[#121212] border-t border-gray-100 dark:border-white/5">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about events..."
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-brand-purple/50 outline-none dark:text-white"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="absolute right-1.5 p-2 bg-brand-purple text-white rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:hover:bg-brand-purple transition-colors"
            >
              {wsTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AiChatWidget;
