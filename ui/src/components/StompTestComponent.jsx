import { useEffect, useState } from "react"
import { Client } from "@stomp/stompjs"

const Spinner = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
)

const StompTestComponent = () => {
    const [messages, setMessages] = useState([])
    const [client, setClient] = useState(null)
    const [statusMessage, setStatusMessage] = useState("")
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const brokerURL = `${wsProtocol}//${window.location.host}/ws`;

        const stompClient = new Client({
            brokerURL,
            onConnect: () => {
                console.log("STOMP client connected")
                subscribeToStatus(stompClient)
                setIsConnected(true)
            },
            onDisconnect: () => {
                console.log("STOMP client disconnected")
                setIsConnected(false)
            },
            onStompError: frame => {
                console.error("STOMP client error:", frame)
                setError(`Error: ${frame.headers?.message || 'Unknown error'}`)
            },
        })

        setClient(stompClient)
        stompClient.activate()

        return () => {
            if (stompClient && stompClient.active) {
                stompClient.deactivate()
            }
        }
    }, [])

    const subscribeToStatus = (stompClient) => {
        if (!stompClient?.active) return

        try {
            stompClient.subscribe(
                "/topic/status",
                message => {
                    console.log("Received status:", message)
                    // Remove the "Status:" prefix if it exists in the message
                    const messageText = message.body.replace(/^Status:\s*/, '')
                    setMessages(prev => [...prev, messageText])
                }
            )
            setError(null)
        } catch (err) {
            console.error("Subscription error:", err)
            setError(`Failed to subscribe: ${err.message}`)
        }
    }

    const sendStatusMessage = () => {
        if (!client?.active) return

        try {
            client.publish({
                destination: '/app/status',
                body: statusMessage
            })
            setStatusMessage("")
            setError(null)
        } catch (err) {
            setError(`Failed to send message: ${err.message}`)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && statusMessage.trim()) {
            sendStatusMessage()
        }
    }

    if (!isConnected) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="flex items-center space-x-3 text-gray-200">
                    <Spinner />
                    <span className="text-lg">Connecting to server...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                    <h1 className="text-3xl font-bold text-white">STOMP Test Client</h1>
                    <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm text-gray-300">Connected</span>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-900/50 border-l-4 border-red-500 p-4 rounded">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages Section */}
                <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                    <h2 className="text-xl font-semibold text-white mb-4">Messages</h2>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {messages.length === 0 ? (
                            <div className="text-gray-500 text-center py-4">
                                No messages yet
                            </div>
                        ) : (
                            messages.map((message, idx) => (
                                <div
                                    key={idx}
                                    className="bg-gray-700 p-4 rounded-lg border-l-4 border-blue-500"
                                >
                                    {message}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Send Message Section */}
                <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                    <h2 className="text-xl font-semibold text-white mb-4">Send Message</h2>
                    <div className="flex space-x-3">
                        <input
                            type="text"
                            value={statusMessage}
                            onChange={(e) => setStatusMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter status message"
                            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                        />
                        <button
                            onClick={sendStatusMessage}
                            disabled={!statusMessage.trim()}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-800/50 disabled:text-gray-400 transition-colors duration-200"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StompTestComponent