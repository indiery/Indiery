import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getIdToken } from '../services/firebase';
import { useAuth } from './useAuth';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export const useSocket = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        setSocket(null);
      }
      return;
    }

    const connectSocket = async () => {
      try {
        const token = await getIdToken();
        
        if (socketRef.current) {
          socketRef.current.disconnect();
        }

        const newSocket = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
          console.log('Socket connected');
        });

        newSocket.on('disconnect', () => {
          console.log('Socket disconnected');
        });

        newSocket.on('connect_error', (error) => {
          console.log('Socket connection error:', error.message);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);
      } catch (error) {
        console.log('Socket connection error:', error);
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  return socket;
};