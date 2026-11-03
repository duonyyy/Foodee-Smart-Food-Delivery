'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { socketManager } from '@/shared/socket/socket-manager';
import {
  ChatMessageSentPayload,
  ChatMessagesReadPayload,
  ChatTypingPayload,
} from '@/shared/socket/types';

export interface UseChatSocketOptions {
  conversationId?: string;
  autoJoin?: boolean;
  onMessageSent?: (payload: ChatMessageSentPayload) => void;
  onMessagesRead?: (payload: ChatMessagesReadPayload) => void;
  onTyping?: (payload: ChatTypingPayload) => void;
}

export function useChatSocket(options: UseChatSocketOptions = {}) {
  const {
    conversationId,
    autoJoin = true,
    onMessageSent,
    onMessagesRead,
    onTyping,
  } = options;

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestMessage, setLatestMessage] = useState<ChatMessageSentPayload | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  const callbacksRef = useRef({ onMessageSent, onMessagesRead, onTyping });
  useEffect(() => {
    callbacksRef.current = { onMessageSent, onMessagesRead, onTyping };
  }, [onMessageSent, onMessagesRead, onTyping]);

  const joinConversation = useCallback((id: string) => {
    const socket = socketManager.getSocket('/chat');
    if (socket && id) {
      socket.emit('joinConversation', { conversationId: id });
    }
  }, []);

  const leaveConversation = useCallback((id: string) => {
    const socket = socketManager.getSocket('/chat');
    if (socket && id) {
      socket.emit('leaveConversation', { conversationId: id });
    }
  }, []);

  const sendTyping = useCallback(
    (isTyping: boolean, targetConversationId?: string) => {
      const socket = socketManager.getSocket('/chat');
      const cId = targetConversationId || conversationId;
      if (socket && cId) {
        socket.emit('typing', { conversationId: cId, isTyping });
      }
    },
    [conversationId],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const socket = socketManager.getSocket('/chat');
    if (!socket) return;

    setIsConnected(socket.connected);

    const syncRoom = () => {
      setIsConnected(true);
      if (autoJoin && conversationId) {
        socket.emit('joinConversation', { conversationId });
      }
    };

    const handleConnect = () => syncRoom();
    const handleDisconnect = () => setIsConnected(false);

    const handleMessageSent = (payload: ChatMessageSentPayload) => {
      if (conversationId && payload.conversationId !== conversationId) return;
      setLatestMessage(payload);
      if (callbacksRef.current.onMessageSent) {
        callbacksRef.current.onMessageSent(payload);
      }
    };

    const handleMessagesRead = (payload: ChatMessagesReadPayload) => {
      if (conversationId && payload.conversationId !== conversationId) return;
      if (callbacksRef.current.onMessagesRead) {
        callbacksRef.current.onMessagesRead(payload);
      }
    };

    const handleTypingEvent = (payload: ChatTypingPayload) => {
      if (conversationId && payload.conversationId !== conversationId) return;
      if (payload.userId) {
        setTypingUsers((prev) => ({
          ...prev,
          [payload.userId!]: payload.isTyping,
        }));
      }
      if (callbacksRef.current.onTyping) {
        callbacksRef.current.onTyping(payload);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('chat:message_sent', handleMessageSent);
    socket.on('chat:messages_read', handleMessagesRead);
    socket.on('chat:typing', handleTypingEvent);

    if (socket.connected) {
      syncRoom();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('chat:message_sent', handleMessageSent);
      socket.off('chat:messages_read', handleMessagesRead);
      socket.off('chat:typing', handleTypingEvent);

      if (autoJoin && conversationId) {
        socket.emit('leaveConversation', { conversationId });
      }
    };
  }, [conversationId, autoJoin]);

  return {
    isConnected,
    latestMessage,
    typingUsers,
    joinConversation,
    leaveConversation,
    sendTyping,
  };
}

