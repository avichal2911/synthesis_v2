'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatProps {
  projectId: string;
}

export function Chat({ projectId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages on mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [projectId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setSending(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // Add user message to database
      const { data: userMsgData, error: userMsgError } = await supabase
        .from('chat_messages')
        .insert([
          {
            project_id: projectId,
            user_id: session.user.id,
            role: 'user',
            content: userMessage,
          },
        ])
        .select();

      if (userMsgError) throw userMsgError;

      if (userMsgData) {
        setMessages((prev) => [...prev, userMsgData[0]]);
      }

      // TODO: Call AI API to generate response
      // For now, just add a placeholder assistant message
      const { data: assistantData, error: assistantError } = await supabase
        .from('chat_messages')
        .insert([
          {
            project_id: projectId,
            user_id: session.user.id,
            role: 'assistant',
            content:
              'This is a placeholder response. AI integration will be added soon. Your message was: ' +
              userMessage,
          },
        ])
        .select();

      if (assistantError) throw assistantError;

      if (assistantData) {
        setMessages((prev) => [...prev, assistantData[0]]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground mb-2">Start a conversation</p>
              <p className="text-muted-foreground text-sm">
                Ask questions about your uploaded documents
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4 bg-card">
        <div className="flex gap-2">
          <Input
            placeholder="Ask a question about your research..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={sending}
          />
          <Button onClick={handleSendMessage} disabled={sending || !inputValue.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
