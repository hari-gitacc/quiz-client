// frontend/src/hooks/useWebSocket.ts
import { useEffect, useState } from 'react';
import WebSocketService from '../services/websocket';

export const useWebSocket = () => {
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const ws = WebSocketService;
            setConnected(true);

            return () => {
                ws.disconnect();
                setConnected(false);
            };
        }
    }, []);

    return {
        socket: connected ? WebSocketService : null,
        connected,
    };
};