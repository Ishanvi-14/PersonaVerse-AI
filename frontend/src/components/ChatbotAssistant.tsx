/**
 * AI Chatbot Assistant
 * Helps users navigate and use PersonaVerse AI platform
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const quickActions = [
  { label: '🎯 How to generate content?', query: 'generate' },
  { label: '📅 Schedule a post', query: 'schedule' },
  { label: '🎤 Use voice input', query: 'voice' },
  { label: '🌐 Translate content', query: 'translate' },
  { label: '📊 View my history', query: 'history' },
];

const botResponses: Record<string, string> = {
  generate: "To generate content:\n1. Go to 'Content Editor' tab\n2. Enter your prompt or use voice input\n3. Select your persona (Founder, Educator, Friend)\n4. Choose target platform (LinkedIn, Twitter, etc.)\n5. Click 'Generate Content'\n\nYour content will be culturally adapted with Hinglish and Indian context! 🇮🇳",
  
  schedule: "To schedule content:\n1. Go to 'Content Calendar' tab\n2. Click 'Schedule Content' button\n3. Fill in title, description, and content\n4. Choose platform and date/time\n5. Enter your email for notifications\n6. Click 'Schedule'\n\nYou'll get a confirmation email immediately and a reminder at the scheduled time! 📧",
  
  voice: "To use voice input:\n1. Click the microphone icon 🎤\n2. Allow microphone access\n3. Speak in Hindi, English, or Hinglish\n4. AWS Transcribe will convert it to text\n5. Use the text for content generation\n\nSupports 10+ Indian languages! 🗣️",
  
  translate: "To translate content:\n1. Generate or write your content\n2. Look for the 'Translate' option\n3. Select target language (Hindi, Tamil, etc.)\n4. Get culturally adapted translation\n\nNot just translation - cultural transcreation with Indian metaphors! 🌏",
  
  history: "To view your history:\n1. Go to 'History' tab\n2. See all your generated content\n3. Filter by date, platform, or persona\n4. Export your history\n5. Track your Digital Soul evolution\n\nYour content journey, preserved! 📚",
  
  default: "Namaste! 🙏 I'm your PersonaVerse AI assistant. I can help you with:\n\n• Generating persona-consistent content\n• Scheduling posts\n• Using voice input\n• Translating content\n• Navigating the platform\n\nClick any quick action below or ask me anything!",
};

export const ChatbotAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: botResponses.default,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickAction = (query: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: quickActions.find(a => a.query === query)?.label || query,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponses[query] || botResponses.default,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      // Simple keyword matching for responses
      let response = botResponses.default;
      const lowerInput = inputText.toLowerCase();

      if (lowerInput.includes('generate') || lowerInput.includes('create') || lowerInput.includes('content')) {
        response = botResponses.generate;
      } else if (lowerInput.includes('schedule') || lowerInput.includes('calendar') || lowerInput.includes('post')) {
        response = botResponses.schedule;
      } else if (lowerInput.includes('voice') || lowerInput.includes('speak') || lowerInput.includes('audio')) {
        response = botResponses.voice;
      } else if (lowerInput.includes('translate') || lowerInput.includes('language') || lowerInput.includes('hindi')) {
        response = botResponses.translate;
      } else if (lowerInput.includes('history') || lowerInput.includes('past') || lowerInput.includes('previous')) {
        response = botResponses.history;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            onHoverStart={() => setShowTooltip(true)}
            onHoverEnd={() => setShowTooltip(false)}
          >
            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-20 right-0 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap"
                >
                  <div className="text-sm font-medium">How can I help you? 🤖</div>
                  <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-orange-500/50 transition-all relative"
            >
              <Bot className="w-8 h-8" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-green-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">AI Assistant</h3>
                  <p className="text-white/80 text-xs">How can I help you? 🤖</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="p-3 bg-white border-t border-gray-200">
              <div className="flex flex-wrap gap-2 mb-3">
                {quickActions.map((action) => (
                  <button
                    key={action.query}
                    onClick={() => handleQuickAction(action.query)}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
