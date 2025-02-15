'use client'

import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'

export const useStompClient = (token) => {
    const stompClientRef = useRef(null)
    const subscriptionsRef = useRef(new Map())
    const [isClientReady, setIsClientReady] = useState(false)

    useEffect(() => {
        const client = new Client({
            brokerURL: 'ws://localhost:8080/ws',
            connectHeaders: { Authorization: `Bearer ${token}` },
            onConnect: () => {
                console.log('STOMP client connected')
                setIsClientReady(true)
            },
            onDisconnect: () => {
                console.log('STOMP client disconnected')
                setIsClientReady(false)
            },
        })

        stompClientRef.current = client
        client.activate()

        return () => {
            client.deactivate().then(() => console.log('STOMP client deactivated'))
            subscriptionsRef.current.forEach((sub) => sub.unsubscribe())
            subscriptionsRef.current.clear()
        }
    }, [token])

    const subscribe = (destination, callback) => {
        if (!isClientReady || !stompClientRef.current) {
            console.info('STOMP client is not ready yet.')
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
            console.info('STOMP client is not ready yet.')
            return
        }

        stompClientRef.current.publish({
            destination: destination,
            body: message,
        })
        console.log(`Sent message to ${destination}: ${message}`)
    }

    return { client: stompClientRef.current, subscribe, sendMessage, isClientReady }
}
