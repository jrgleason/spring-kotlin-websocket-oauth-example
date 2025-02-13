import React, {useCallback, useEffect, useState} from 'react';
import {Client} from '@stomp/stompjs';

const WebSocketClient = () => {
    const [messages, setMessages] = useState([]);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState('');
    const [client, setClient] = useState(null);
    const [canRetryGreetings, setCanRetryGreetings] = useState(true);

    const token = "test.token";

    const subscribeToGreetings = useCallback(() => {
        if (!client || !client.active) return;

        setCanRetryGreetings(false);
        console.log('Attempting to subscribe to greetings...');
        client.subscribe('/topic/greetings',
            (message) => {
                console.log('Received greeting:', message);
                setMessages(prev => [...prev, `Greeting: ${message.body}`]);
            },
            {
                onError: (err) => {
                    console.error('Subscription error frame:', err.command, err.headers, err.body);
                    setMessages(prev => [...prev, `Permission denied: Cannot subscribe to greetings (${err.headers?.message || 'Unknown error'})`]);
                    setCanRetryGreetings(true);
                }
            }
        );
    }, [client]);

    useEffect(() => {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const brokerURL = `${wsProtocol}//${window.location.host}/ws`;

        const stompClient = new Client({
            brokerURL,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            onConnect: () => {
                setConnected(true);
                setError('');
                setCanRetryGreetings(true);

                // Subscribe to public status topic
                stompClient.subscribe('/topic/status', (message) => {
                    setMessages(prev => [...prev, `Status: ${message.body}`]);
                });

                // Announce presence
                stompClient.publish({
                    destination: '/app/status',
                    body: 'Client connected'
                });
            },
            onDisconnect: () => {
                setConnected(false);
                setCanRetryGreetings(true);
            },
            onError: (err) => {
                setError(`Connection error: ${err.message}`);
            }
        });

        try {
            stompClient.activate();
            setClient(stompClient);
        } catch (err) {
            setError(`Activation error: ${err.message}`);
        }

        return () => {
            if (stompClient.active) {
                stompClient.deactivate();
            }
        };
    }, []);

    return (
        <div className="p-4">
            <div className="mb-4 flex items-center gap-4">
        <span className={`inline-block px-2 py-1 rounded ${connected ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
                {canRetryGreetings && connected && (
                    <button
                        onClick={subscribeToGreetings}
                        className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Subscribe to Greetings
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="border rounded p-4 max-h-64 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-2">Messages:</h2>
                {messages.map((msg, idx) => (
                    <div key={idx} className="mb-2 p-2 bg-gray-100 rounded">
                        {msg}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WebSocketClient;