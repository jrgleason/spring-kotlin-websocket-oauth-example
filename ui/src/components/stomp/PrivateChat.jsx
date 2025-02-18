import React from 'react';
import StompClient from './StompClient';
import {useAuthentication} from "../../providers/auth/AuthContext.js";

const PrivateChat = () => {
    const {user, token} = useAuthentication();

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <StompClient
            title={`Private Chat - ${user.name}`}
            subscribeTopic={`/user/queue/messages`}
            publishTopic="/app/private-message"
            token={token}
            onError={(error) => console.error('Private chat error:', error)}
        />
    );
};

export default PrivateChat;