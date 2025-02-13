import {useEffect, useRef, useState} from "react";
import {Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";

const Spinner = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
);

const MAX_ERRORS = 3;
const RETRY_DELAY = 2000;

const PrivateChat = () => {
    const [messages, setMessages] = useState([]);
    const [client, setClient] = useState(null);
    const [message, setMessage] = useState("");
    const [username, setUsername] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [hasFailed, setHasFailed] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const errorCount = useRef(0);
    const stompClientRef = useRef(null);
    const retryTimeoutRef = useRef(null);

    const cleanup = () => {
        if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
        if (stompClientRef.current?.active) stompClientRef.current.deactivate();
        stompClientRef.current = null;
        setClient(null);
    };

    const fetchUsername = async () => {
        try {
            const response = await fetch('/fe/user', {
                headers: {
                    'Authorization': 'Bearer test.token'
                }
            });
            const data = await response.json();
            setUsername(data.name);
            return data.name;
        } catch (err) {
            handleError(`Failed to fetch user info: ${err.message}`);
            return null;
        }
    };

    const handleError = (errorMsg) => {
        errorCount.current += 1;
        cleanup();
        setError(errorMsg);
        setIsConnected(false);

        if (errorCount.current >= MAX_ERRORS) {
            setHasFailed(true);
        } else {
            setIsRetrying(true);
            retryTimeoutRef.current = setTimeout(initializeStompClient, RETRY_DELAY);
        }
    };

    const handleRetry = () => {
        errorCount.current = 0;
        setHasFailed(false);
        setError(null);
        setIsConnected(false);
        setIsRetrying(true);
        cleanup();
        initializeStompClient();
    };

    const initializeStompClient = async () => {
        if (hasFailed) return;

        const user = await fetchUsername();
        if (!user) return;

        cleanup();

        // Create SockJS instance
        const socket = new SockJS('/ws');

        const stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {Authorization: `Bearer test.token`},
            onConnect: () => {
                setIsRetrying(false);
                subscribeToPrivateMessages(stompClient);
                setIsConnected(true);
            },
            onDisconnect: () => {
                setIsConnected(false);
                if (!hasFailed && !retryTimeoutRef.current) handleError("Disconnected from server");
            },
            onStompError: (frame) => handleError(`Error: ${frame.headers?.message || "Unknown error"}`),
            reconnectDelay: 0,
        });

        stompClientRef.current = stompClient;
        setClient(stompClient);
        stompClient.activate();
    };

    useEffect(() => {
        initializeStompClient();
        return cleanup;
    }, []);

    const subscribeToPrivateMessages = (stompClient) => {
        if (!stompClient?.active) return;
        try {
            stompClient.subscribe(
                `/user/${username}/chat/messages`,
                (message) => {
                    setMessages(
                        (prev) =>
                            [...prev, message.body]
                    )
                },
                {
                    "Authorization": `Bearer test.token`
                }
            );
        } catch (err) {
            handleError(`Failed to subscribe: ${err.message}`);
        }
    };

    const sendMessage = () => {
        if (!client?.active || hasFailed) return;
        try {
            client.publish({
                destination: '/app/private-message',
                body: message,
                headers: {
                    "Authorization": `Bearer test.token`
                }
            });
            setMessage("");
            setError(null);
        } catch (err) {
            handleError(`Failed to send message: ${err.message}`);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && message.trim()) sendMessage();
    };

    if (hasFailed) {
        return (
            <div className="bg-gray-800 rounded-lg shadow-xl p-6">
                <div className="text-center">
                    <div className="text-red-400 mb-4">
                        <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Private Chat - Connection Failed</h3>
                    <p className="text-gray-400 mb-4">Failed after {MAX_ERRORS} attempts</p>
                    <div className="bg-red-900/50 border-l-4 border-red-500 p-4 rounded text-left mb-4">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                    <button onClick={handleRetry}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="flex justify-center items-center min-h-[200px] bg-gray-800 rounded-lg">
                <div className="flex flex-col items-center space-y-3 text-gray-200">
                    <div className="flex items-center space-x-3">
                        <Spinner/>
                        <span className="text-lg">
                            {isRetrying ? `Retrying connection (Attempt ${errorCount.current + 1}/${MAX_ERRORS})...` : "Connecting to server..."}
                        </span>
                    </div>
                    {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl h-full flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">Private Chat - {username}</h2>
                <div className="flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-full">
                    <div className="w-3 h-3 rounded-full bg-green-500"/>
                    <span className="text-sm text-gray-300">Connected</span>
                </div>
            </div>

            {error && (
                <div className="px-6 py-4 border-b border-gray-700">
                    <div className="bg-red-900/50 border-l-4 border-red-500 p-4 rounded">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                          clipRule="evenodd"/>
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 px-6 py-4 border-b border-gray-700">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {messages.length === 0 ? (
                        <div className="text-gray-500 text-center py-4">No messages yet</div>
                    ) : (
                        messages.map((message, idx) => (
                            <div key={idx} className="bg-gray-700 p-4 rounded-lg border-l-4 border-blue-500">
                                <p className="text-gray-200">{message}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="p-6">
                <div className="flex space-x-3">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter private message"
                        className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!message.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-800/50 disabled:text-gray-400 transition-colors duration-200"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivateChat;