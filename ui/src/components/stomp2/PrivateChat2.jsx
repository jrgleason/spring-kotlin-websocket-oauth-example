import React, {useState, useEffect} from 'react';
import {useStompClient} from "./StompContext.jsx"

const PrivateChat2 = ({username, token}) => {
    const {subscribe, sendMessage, isClientReady} = useStompClient(token)

    const [isReady, setIsReady] = useState(false)
    const [messages, setMessages] = useState([])

    useEffect(() => {
        if (!isClientReady) return;
        console.log("Trying to subscribe");

        const subscription = subscribe(`/user/queue/messages`, message => {
            console.log("Received message", message)
            setMessages((prev) => [...prev, message.body])
        })

        setIsReady(true)

        return () => {
            subscription?.unsubscribe()
        }
    }, [isClientReady])

    const sendTestMessage = () => {
        sendMessage('/app/private-message', "Hello from frontend")
    }

    return (
        <div>
            {isReady && <button onClick={sendTestMessage}>Send message to {username}</button>}

            {messages.map((message, idx) => <div key={idx}>{message}</div>)}
        </div>
    )
};

export default PrivateChat2;