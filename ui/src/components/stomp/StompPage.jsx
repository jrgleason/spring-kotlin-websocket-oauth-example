import StompClient from './StompClient'
import PrivateChat from "./PrivateChat.jsx";

const StompPage = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-8">
            <div className="mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">STOMP Test Client</h1>

                <div className="flex gap-8">
                    {/* Public Topic */}
                    <div className="flex-1">
                        <StompClient
                            title="Public Messages"
                            subscribeTopic="/topic/status"
                            publishTopic="/app/status"
                            onError={(error) => console.error("Public topic error:", error)}
                        />
                    </div>

                    {/* Protected Topic */}
                    <div className="flex-1">
                        <StompClient
                            title="Protected Messages"
                            subscribeTopic="/topic/greetings"
                            publishTopic="/app/hello"
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