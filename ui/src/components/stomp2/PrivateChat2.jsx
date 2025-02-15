import React, {useState, useEffect} from 'react';
import {useStomp} from "./StompContext.jsx"

const PrivateChat2 = () => {
    const [username, setUsername] = useState('');
    const {subscribe, sendMessage} = useStomp()

    const [isReady, setIsReady] = useState(false)
    const [messages, setMessages] = useState([])

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const response = await fetch('/fe/user', {
                    headers: {'Authorization': 'Bearer test.token'}
                });
                const data = await response.json();
                console.log(data)

                setUsername(data.name);
                return data.name
            } catch (err) {
                console.error('Failed to fetch username:', err);
            }
        };
        fetchUsername()
            .then(username => console.log('Fetched user:', username))
            .catch((err) => console.error('Failed to fetch username:', err));
    }, []);

    useEffect(() => {
        if (!username) return

        console.log("Trying to subscribe");

        const subscription = subscribe("/user/queue/messages", message => {
            console.log("Received message", message)
            setMessages((prev) => [...prev, message.body])
        })

        setIsReady(true)

        return () => {
            subscription?.unsubscribe()
        }
    }, [username])

    const sendTestMessage = () => {
        sendMessage('/app/private-message', "Hello from frontend")
    }

    if (!username) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {isReady && <button onClick={sendTestMessage}>Send</button>}

            {messages.map((message, idx) => <div key={idx}>{message}</div>)}
        </div>
    )
};

export default PrivateChat2;