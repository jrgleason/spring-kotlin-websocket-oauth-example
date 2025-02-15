import React, {useState, useEffect} from 'react';
import {useStomp} from "./StompContext.jsx"

const PrivateChat2 = () => {
    const {subscribe, sendMessage, isClientReady} = useStomp()

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
            {isReady && <button onClick={sendTestMessage}>Send</button>}

            {messages.map((message, idx) => <div key={idx}>{message}</div>)}
        </div>
    )
};

export default PrivateChat2;