import React from 'react';
import StompClient from './StompClient';
import { useAuth } from '../auth/AuthenticationProvider.jsx';

const PrivateChat = () => {
    const { user, token } = useAuth();

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <StompClient
            title={`Private Chat - ${user.name}`}
            subscribeTopic={`/user/${user.name}/queue/messages`}
            publishTopic="/app/private-message"
            token={token}
            onError={(error) => console.error('Private chat error:', error)}
        />
    );
};

export default PrivateChat;