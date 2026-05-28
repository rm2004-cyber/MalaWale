"use client";

import React, { createContext, useContext, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { io, Socket } from 'socket.io-client'

const SocketContext = createContext<Socket | null>(null);
export const useSocket = () => useContext(SocketContext);

function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const socketInstance = io("https://malawale.onrender.com", {
      transports: ["polling", "websocket"],
      autoConnect: true
    });

    setSocket(socketInstance);

    socketInstance.on("liveViewersUpdate", (data: { count: number }) => {
      console.log("Live devotees online:", data.count);
    });

    return () => {
      socketInstance.off("liveViewersUpdate");
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

function SocketAuthWrapper({ children }: { children: React.ReactNode }) {
  return <SocketProvider>{children}</SocketProvider>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <CartProvider>
          <SocketAuthWrapper>
            <App />
          </SocketAuthWrapper>
        </CartProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
)