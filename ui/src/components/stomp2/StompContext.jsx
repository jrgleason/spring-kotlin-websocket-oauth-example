'use client'

import React, {createContext, useContext, useEffect, useRef, useState} from "react"
import {Client, Versions} from "@stomp/stompjs"

const StompContext = createContext({
    client: null,
    subscribe: (destination, callback) => null,
});

const StompProvider = ({children}) => {
    const stompClientRef = useRef(null)
    const subscriptionsRef = useRef(new Map())
    const [isClientReady, setIsClientReady] = useState(false)

    useEffect(() => {
        const client = new Client({
            brokerURL: "ws://localhost:8080/ws",
            connectHeaders: {Authorization: `Bearer test.token`},
            onConnect: () => {
                console.log("STOMP client connected")
                setIsClientReady(true) // Set client as ready once connected
            },
            onDisconnect: () => {
                console.log("STOMP client disconnected")
                setIsClientReady(false) // Set client as not ready when disconnected
            },
        })

        stompClientRef.current = client
        client.activate()

        return () => {
            client.deactivate()
            subscriptionsRef.current.forEach((sub) => sub.unsubscribe())
            subscriptionsRef.current.clear()
        }
    }, [])

    const subscribe = (destination, callback) => {
        if (!isClientReady || !stompClientRef.current) {
            console.info("STOMP client is not ready yet.")
            return null
        }

        if (subscriptionsRef.current.has(destination)) {
            console.log(`Already subscribed to ${destination}`)
            return null
        }

        const subscription = stompClientRef.current.subscribe(destination, callback)
        subscriptionsRef.current.set(destination, subscription)

        return subscription
    }

    const sendMessage = (destination, message) => {
        if (!isClientReady || !stompClientRef.current) {
            console.info("STOMP client is not ready yet.")
            return
        }

        stompClientRef.current.publish({
            destination: destination,
            body: message,
        })
        console.log(`Sent message to ${destination}: ${message}`)
    }

    return (
        <StompContext.Provider value={{client: stompClientRef.current, subscribe, sendMessage}}>
            {children}
        </StompContext.Provider>
    )
}

export default StompProvider
export const useStomp = () => useContext(StompContext)
