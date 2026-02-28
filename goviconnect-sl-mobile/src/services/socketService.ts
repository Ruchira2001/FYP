/**
 * GoviConnect SL - Socket.io Client Service
 * Real-time communication for chat, notifications, and online status
 */

import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOCKET_URL } from './api';

const TOKEN_KEY = '@goviconnect_token';

let socket: Socket | null = null;

// ─── Connection ──────────────────────────────────────────────

export const connectSocket = async (): Promise<Socket | null> => {
  if (socket?.connected) return socket;

  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (!token) {
    console.warn('Socket: No auth token found');
    return null;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('🔌 Socket connection error:', error.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;

// ─── Chat Events ─────────────────────────────────────────────

export const joinChats = (chatIds: string[]) => {
  socket?.emit('join_chats', chatIds);
};

export const sendSocketMessage = (data: {
  chatId: string;
  content: string;
  type?: string;
}) => {
  socket?.emit('send_message', data);
};

export const emitTyping = (chatId: string) => {
  socket?.emit('typing', { chatId });
};

export const emitStopTyping = (chatId: string) => {
  socket?.emit('stop_typing', { chatId });
};

export const emitMarkRead = (chatId: string) => {
  socket?.emit('mark_read', { chatId });
};

// ─── Event Listeners ─────────────────────────────────────────

export const onNewMessage = (callback: (message: any) => void) => {
  socket?.on('new_message', callback);
  return () => socket?.off('new_message', callback);
};

export const onUserTyping = (callback: (data: { chatId: string; userId: string; name: string }) => void) => {
  socket?.on('user_typing', callback);
  return () => socket?.off('user_typing', callback);
};

export const onUserStopTyping = (callback: (data: { chatId: string; userId: string }) => void) => {
  socket?.on('user_stop_typing', callback);
  return () => socket?.off('user_stop_typing', callback);
};

export const onMessageRead = (callback: (data: { chatId: string; userId: string }) => void) => {
  socket?.on('messages_read', callback);
  return () => socket?.off('messages_read', callback);
};

export const onUserOnline = (callback: (data: { userId: string }) => void) => {
  socket?.on('user_online', callback);
  return () => socket?.off('user_online', callback);
};

export const onUserOffline = (callback: (data: { userId: string }) => void) => {
  socket?.on('user_offline', callback);
  return () => socket?.off('user_offline', callback);
};

export const onNotification = (callback: (notification: any) => void) => {
  socket?.on('notification', callback);
  return () => socket?.off('notification', callback);
};

// ─── Utility ─────────────────────────────────────────────────

export const isConnected = (): boolean => {
  return socket?.connected ?? false;
};
