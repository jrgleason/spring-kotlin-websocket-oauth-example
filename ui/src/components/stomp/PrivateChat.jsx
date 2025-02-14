import React, { useState, useEffect } from 'react';
import StompClient from './StompClient';

const PrivateChat = () => {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const response = await fetch('/fe/user', {
                    headers: {
                        'Authorization': 'Bearer test.token'
                    }
                });
                const data = await response.json();
                setUsername(data.name);
            } catch (err) {
                console.error('Failed to fetch username:', err);
            }
        };
        fetchUsername().catch((err) => console.error('Failed to fetch username:', err));
    }, []);

    if (!username) {
        return <div>Loading...</div>;
    }

    return (
        <StompClient
            title={`Private Chat - ${username}`}
            subscribeTopic={`/user/${username}/queue/messages`}
            publishTopic="/app/private-message"
            onError={(error) => console.error('Private chat error:', error)}
        />
    );
};

export default PrivateChat;