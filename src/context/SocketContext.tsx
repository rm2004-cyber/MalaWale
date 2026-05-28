import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // 🔥 Apne backend ka live URL yahan bitha de
    const socketInstance = io("http://localhost:5000", {
      transports: ["websocket"],
      autoConnect: true,
    });

    setSocket(socketInstance);

    // Cleanup: Jab user tab ya app close karega, toh auto disconnect ho jaye
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);