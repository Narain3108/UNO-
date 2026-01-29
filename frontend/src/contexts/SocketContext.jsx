import { createContext, useContext, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

// Get the backend URL from environment or use localhost
const getBackendUrl = () => {
  // Check for ngrok URL in environment variable or localStorage
  const ngrokUrl = import.meta.env.VITE_BACKEND_URL || localStorage.getItem('ngrok_url');
  
  if (ngrokUrl) {
    console.log('🌐 Using ngrok URL:', ngrokUrl);
    return ngrokUrl;
  }
  
  // Default: same host as the frontend, port 3001 (works for LAN play)
  const host = window.location.hostname || 'localhost';
  return `http://${host}:3001`;
};

export const SocketProvider = ({ children }) => {
  // Initialize socket once using useMemo to avoid recreating on every render
  const socket = useMemo(() => {
    const backendUrl = getBackendUrl();
    console.log('🔌 Connecting to backend:', backendUrl);
    
    const newSocket = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      console.error('Make sure the backend server is running on http://localhost:3001');
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnection attempt', attemptNumber);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error.message);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed. Please check if the server is running.');
    });

    return newSocket;
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      socket.close();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return socket;
};
