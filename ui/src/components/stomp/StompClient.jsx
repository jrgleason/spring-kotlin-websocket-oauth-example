// StompClient.jsx
import React, {useEffect, useState} from "react";
import {useStomp} from "../../providers/stomp/StompProvider.jsx";

const StompClient = ({title, subscribeTopic, publishTopic}) => {
    const {state, connect, subscribe, publish, error} = useStomp();
    const [messages, setMessages] = useState([]);
    const [statusMessage, setStatusMessage] = useState("");

    // Clear messages when disconnecting or on error
    useEffect(() => {
        if (state.matches("disconnected") || state.matches("error") || state.matches("deactivating")) {
            console.log("💫 Clearing messages due to state:", state.value);
            setMessages([]);
        }
    }, [state.value]);

    // Connect if disconnected or error
    useEffect(() => {
        if (state.matches("disconnected") || state.matches("error")) {
            console.log("🔌 Attempting to connect from state:", state.value);
            connect();
        }
    }, [state.value, connect]);

    // Handle subscription
    useEffect(() => {
        let unsubscribe;

        if (state.matches("connected")) {
            console.log("📩 Setting up subscription for topic:", subscribeTopic);

            // Include token in subscription headers if available
            const subscriptionHeaders = state.context.token ? {
                Authorization: `Bearer ${state.context.token}`
            } : {};

            console.log("🔑 Subscription headers:",
                state.context.token ? "including auth token" : "anonymous");

            unsubscribe = subscribe(
                subscribeTopic,
                (frame) => {
                    try {
                        const messageText = frame.body.replace(/^Status:\s*/, "");
                        setMessages((prev) => [...prev, messageText]);
                    } catch (error) {
                        console.error("❌ Error processing message:", error);
                    }
                }, subscriptionHeaders);
        }

        // Cleanup subscription when disconnecting or component unmounts
        return () => {
            if (unsubscribe) {
                console.log("🧹 Cleaning up subscription");
                unsubscribe();
            }
        };
    }, [state.value, subscribeTopic, subscribe]);

    const sendMessage = () => {
        publish(
            publishTopic,
            JSON.stringify({
                message: statusMessage,
                name: "Test Message",
            })
        );
        setStatusMessage("");
    };

    // Different states UI
    if (state.matches("connecting")) {
        return (
            <div className="p-4 bg-gray-800 rounded-lg">
                <h2 className="text-xl text-white mb-2">{title}</h2>
                <p className="text-gray-300">Connecting to server...</p>
            </div>
        );
    }

    if (state.matches("error")) {
        return (
            <div className="p-4 bg-gray-800 rounded-lg">
                <h2 className="text-xl text-white mb-2">{title}</h2>
                <p className="text-red-400">Failed to connect: {error}</p>
                <p className="text-sm text-gray-400">
                    Click Refresh/Retry or re-mount to try again.
                </p>
            </div>
        );
    }

    if (state.matches("disconnected")) {
        return (
            <div className="p-4 bg-gray-800 rounded-lg">
                <h2 className="text-xl text-white mb-2">{title}</h2>
                <p className="text-gray-300">Not connected</p>
                <button className="bg-blue-600 px-4 py-2" onClick={connect}>
                    Connect
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl h-full flex flex-col">
            {/* Header with state indicator */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                <div className="flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-full">
                    <div className={`w-3 h-3 rounded-full ${
                        state.matches("connected") ? "bg-green-500" :
                            state.matches("connecting") ? "bg-yellow-500" :
                                state.matches("error") ? "bg-red-500" :
                                    "bg-gray-500"
                    }`}/>
                    <span className="text-sm text-gray-300">{state.value}</span>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="px-6 py-4 border-b border-gray-700">
                    <div className="bg-red-900/50 border-l-4 border-red-500 p-4 rounded">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 px-6 py-4 border-b border-gray-700">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {messages.length === 0 ? (
                        <div className="text-gray-500 text-center py-4">No messages yet</div>
                    ) : (
                        messages.map((message, idx) => (
                            <div
                                key={idx}
                                className="bg-gray-700 p-4 rounded-lg border-l-4 border-blue-500"
                            >
                                <p className="text-gray-200">{message}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Input */}
            <div className="p-6">
                <div className="flex space-x-3">
                    <input
                        type="text"
                        value={statusMessage}
                        onChange={(e) => setStatusMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && statusMessage.trim()) {
                                sendMessage();
                            }
                        }}
                        placeholder="Enter message"
                        className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border
                       border-gray-600 focus:outline-none focus:ring-2
                       focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-500"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!statusMessage.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg
                       hover:bg-blue-700 disabled:bg-blue-800/50
                       disabled:text-gray-400 transition-colors duration-200"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StompClient;