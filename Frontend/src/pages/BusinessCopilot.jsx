import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Brain,
  Lightbulb,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Avatar, AvatarFallback } from '../components/Avatar';

const COPILOT_API_URL = 'http://localhost:3000/api/v1/ai/copilot';
const ACCESS_TOKEN_STORAGE_KEY = 'marketpulse-access-token';

const starterPrompts = [
  { label: 'How can I increase my sales this quarter?', icon: TrendingUp },
  { label: 'Analyze my top-performing products', icon: BarChart3 },
  { label: 'Customer retention strategies', icon: Users },
  { label: 'How to reduce dead stock?', icon: Target },
  { label: 'Marketing ideas for small retail', icon: Lightbulb },
  { label: 'Pricing strategy recommendations', icon: Sparkles },
];

const createMessage = (role, content, id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`) => ({
  id,
  role,
  content,
  timestamp: new Date(),
});

const createWelcomeMessage = () =>
  createMessage(
    'assistant',
    "Hi! I'm your Business Copilot. Ask about sales, pricing, inventory, or growth decisions, and I'll reply using your live business data.",
    'welcome'
  );

const getRequestConfig = () => {
  const accessToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  return {
    withCredentials: true,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  };
};

// Updated to match your exact backend response
const getCopilotReply = (response) => response?.data?.data?.responseMessage?.trim() || '';

const getErrorReply = (error) => {
  if (error?.response?.status === 401) {
    return 'Your session has expired. Please log in again and retry your question.';
  }
  return error?.response?.data?.message || 'I could not reach the business copilot right now. Please try again.';
};

const renderAssistantContent = (content) => (
  <div className="whitespace-pre-wrap">
    {content.split('\n').map((line, index) => {
      if (!line) return <div key={index} className="h-2" />;
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={index} className="mb-1 mt-2 font-semibold">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }
      if (line.startsWith('|')) {
        return (
          <p key={index} className="font-mono text-xs text-muted-foreground">
            {line}
          </p>
        );
      }
      if (/^\d+\./.test(line)) {
        return <p key={index} className="my-0.5 ml-2">{line}</p>;
      }
      if (line.startsWith('- ')) {
        return <p key={index} className="my-0.5 ml-4">{line}</p>;
      }
      return <p key={index}>{line}</p>;
    })}
  </div>
);

export function BusinessCopilot() {
  const [messages, setMessages] = useState([createWelcomeMessage()]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatSessionRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (rawText) => {
    const trimmedPrompt = rawText.trim();
    if (!trimmedPrompt || isTyping) return;

    const sessionId = chatSessionRef.current;
    const userMessage = createMessage('user', trimmedPrompt);

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post(
        COPILOT_API_URL,
        { prompt: trimmedPrompt },
        getRequestConfig()
      );

      if (chatSessionRef.current !== sessionId) return;

      const reply = getCopilotReply(response) || 'I received your request, but there was no reply from the copilot.';

      setMessages((prev) => [...prev, createMessage('assistant', reply)]);
    } catch (error) {
      if (chatSessionRef.current !== sessionId) return;
      setMessages((prev) => [...prev, createMessage('assistant', getErrorReply(error))]);
    } finally {
      if (chatSessionRef.current === sessionId) setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (label) => sendMessage(label);

  const handleNewChat = () => {
    chatSessionRef.current += 1;
    setMessages([createWelcomeMessage()]);
    setInput('');
    setIsTyping(false);
    inputRef.current?.focus();
  };

  const showSuggestions = messages.length === 1 && !isTyping;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-4 flex shrink-0 items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Business Copilot</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask questions about inventory, pricing, sales, and business decisions.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleNewChat} className="gap-2 rounded-xl border-border">
          <RefreshCw className="h-4 w-4" />
          New Chat
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-300"
      >
        <div className="scrollbar-hide flex-1 space-y-6 overflow-y-auto p-6">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {message.role === 'assistant' ? (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                    <Brain className="h-4 w-4 text-emerald-500" />
                  </div>
                ) : (
                  <Avatar size="sm">
                    <AvatarFallback className="rounded-xl bg-blue-500/15 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      You
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'rounded-tr-md bg-emerald-500 text-white'
                      : 'rounded-tl-md bg-secondary text-foreground'
                  }`}
                >
                  {message.role === 'assistant' ? renderAssistantContent(message.content) : <p>{message.content}</p>}
                  <p
                    className={`mt-2 text-[10px] ${message.role === 'user' ? 'text-white/60' : 'text-muted-foreground'}`}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                <Brain className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="rounded-2xl rounded-tl-md bg-secondary px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="flex-shrink-0 border-t border-border p-4">
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-3 flex flex-wrap gap-2"
              >
                {starterPrompts.map((suggestion, index) => (
                  <motion.button
                    key={suggestion.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => handleSuggestion(suggestion.label)}
                    disabled={isTyping}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-emerald-500/30 hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <suggestion.icon className="h-3.5 w-3.5 text-emerald-500" />
                    {suggestion.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about sales strategies, market trends, growth ideas..."
                className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                disabled={isTyping}
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="h-[46px] rounded-xl bg-emerald-500 px-4 text-white hover:bg-emerald-600 disabled:opacity-40"
            >
              {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}