import StompClient from './StompClient.jsx';
import PrivateChat from "./PrivateChat.jsx";
import { useAuth } from '../auth/AuthenticationProvider.jsx';

const StompPage = () => {
    const { token, send } = useAuth();

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-8">
            <div className="mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">STOMP Test Client</h1>
                    <button
                        onClick={() => send({ type: 'LOGOUT' })}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>

                <div className="flex gap-8">
                    {/* Public Topic */}
                    <div className="flex-1">
                        <StompClient
                            title="Public Messages"
                            subscribeTopic="/topic/status"
                            publishTopic="/app/status"
                            token={token}
                            onError={(error) => console.error("Public topic error:", error)}
                        />
                    </div>

                    {/* Protected Topic */}
                    <div className="flex-1">
                        <StompClient
                            title="Protected Messages"
                            subscribeTopic="/topic/greetings"
                            publishTopic="/app/hello"
                            token={token}
                            onError={(error) => console.error("Protected topic error:", error)}
                        />
                    </div>

                    <div className="flex-1">
                        <PrivateChat />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StompPage