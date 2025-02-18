import StompClient from './StompClient.jsx';
import PrivateChat from "./PrivateChat.jsx";
import {useAuthentication} from "../../providers/auth/AuthContext.js";

const StompPage = () => {
    const {token, send} = useAuthentication();

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-8">
            <div className="mx-auto">
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
                        <PrivateChat/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StompPage