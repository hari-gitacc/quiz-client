// websocket.ts
import { getUserFromToken } from "../utils/auth";

class WebSocketService {
    private ws: WebSocket | null = null;
    private messageHandlers: { [key: string]: ((data: any) => void)[] } = {};
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private connectionPromise: Promise<void> | null = null;
    private currentQuizCode: string | null = null;

    async connect(quizCode: string): Promise<void> {
        this.currentQuizCode = quizCode;
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                const wsUrl = `ws://localhost:8080/ws/${quizCode}`;
                console.log('Connecting to WebSocket:', wsUrl);

                this.ws = new WebSocket(wsUrl);

                this.ws.onopen = () => {
                    console.log('WebSocket Connected Successfully');
                    this.reconnectAttempts = 0;

                    // Setup message handler and register defaults
                    this.setupMessageHandler();
                    this.registerDefaultHandlers();

                    // Send join message after connection
                    setTimeout(() => {
                        const currentUser = getUserFromToken();
                        console.log(currentUser);
                        
                        if (currentUser) {
                            // Determine the host flag.
                            // If your token (or app state) already provides an isHost property, use it.
                            // Otherwise, you could compare currentUser.user_id with a stored quizCreatorId.

                            this.send('join_quiz', {
                                quizCode,
                                user: {
                                    userId: currentUser.user_id,
                                    username: currentUser.username,
                                    email: currentUser.email, // if available
                                }
                            });
                           
                        } else {
                            console.error('No user token found');
                        }
                    }, 100);

                    resolve();
                };

                this.ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    switch (message.type) {
                      case "participant_update":
                        // Handle participant count update
                        break;
                      case "participant_list":
                        // Handle participant list update
                      
                        break;
                      // Add additional cases for other message types as needed
                      default:
                        console.warn(`No handlers found for message type: ${message.type}`);
                    }
                  };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };

                this.ws.onclose = (event) => {
                    console.log('WebSocket closed:', event.code, event.reason);
                    this.connectionPromise = null;
                    this.attemptReconnect();
                };

            } catch (error) {
                console.error('WebSocket connection error:', error);
                this.connectionPromise = null;
                reject(error);
                this.attemptReconnect();
            }
        });

        return this.connectionPromise;
    }

    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.currentQuizCode) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect(this.currentQuizCode!);
            }, 2000 * Math.pow(2, this.reconnectAttempts - 1)); // Exponential backoff
        } else {
            console.log('Max reconnection attempts reached or no quiz code available');
        }
    }

    private setupMessageHandler() {
        if (!this.ws) return;

        this.ws.onmessage = (event) => {
            try {
                console.log('Raw WebSocket message received:', event.data);
                const message = JSON.parse(event.data);
                console.log('Parsed WebSocket message:', message);

                if (message.type && this.messageHandlers[message.type]) {
                    console.log(`Calling handlers for message type: ${message.type}`);
                    this.messageHandlers[message.type].forEach(handler => {
                        try {
                            handler(message.data);
                        } catch (e) {
                            console.error('Error in message handler:', e);
                        }
                    });
                } else {
                    console.warn('No handlers found for message type:', message.type);
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        };
    }

    private registerDefaultHandlers() {
        // Clear existing handlers first
        this.messageHandlers = {};
        
        console.log('Registering default handlers...');
        
        this.on('question', (data) => {
            console.log('Received question data in default handler:', data);
        });

        this.on('participant_update', (data) => {
            console.log('Received participant update in default handler:', data);
        });

        this.on('quiz_start', (data) => {
            console.log('Received quiz start in default handler:', data);
        });

        this.on('error', (error) => {
            console.error('Received error message in default handler:', error);
        });
    }

    on(type: string, handler: (data: any) => void) {
        if (!this.messageHandlers[type]) {
            this.messageHandlers[type] = [];
        }
        this.messageHandlers[type].push(handler);
        console.log(`Registered handler for message type: ${type}`);
        console.log('Current message handlers:', Object.keys(this.messageHandlers));
    }

    off(type: string, handler: (data: any) => void) {
        if (this.messageHandlers[type]) {
            this.messageHandlers[type] = this.messageHandlers[type].filter(h => h !== handler);
            console.log(`Removed handler for message type: ${type}`);
        }
    }

    send(type: string, data: any) {
        if (!this.ws) {
            console.error('No WebSocket instance available');
            return;
        }

        if (this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket is not in OPEN state. Current state:', this.ws.readyState);
            // Attempt to reconnect if not open
            this.attemptReconnect();
            return;
        }

        const message = JSON.stringify({
            type,
            data
        });

        try {
            console.log('Sending WebSocket message:', JSON.parse(message));
            this.ws.send(message);
            console.log('Message sent successfully');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    disconnect() {
        console.log('Disconnecting WebSocket...');
        
        // Clear handlers
        this.messageHandlers = {};
        
        // Close connection if it exists
        if (this.ws) {
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.close(1000, 'Client disconnecting');
            }
            this.ws = null;
        }

        // Reset state
        this.connectionPromise = null;
        this.reconnectAttempts = 0;
        this.currentQuizCode = null;

        console.log('WebSocket disconnected and cleaned up');
    }

    clearAllHandlers() {
        this.messageHandlers = {};
        console.log('Cleared all WebSocket handlers');
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

export default new WebSocketService();
