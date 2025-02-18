// StompProvider.jsx
import React, {createContext, useContext, useCallback, useEffect, useRef} from "react";
import { useMachine } from "@xstate/react";
import {stompMachine} from "../../machines/StompMachine.mjs";

const StompContext = createContext(null);

export function StompProvider({ token, autoConnect = true, children }) {
    const [state, send] = useMachine(stompMachine);
    const previousToken = useRef(token);

    useEffect(() => {
        // Only trigger on actual token changes
        if (token !== previousToken.current) {
            previousToken.current = token;

            if (state.matches("disconnected") && autoConnect) {
                send({ type: "CONNECT", token });
            } else if (!state.matches("disconnected") && !state.matches("deactivating")) {
                send({ type: "UPDATE_TOKEN", token });
            }
        }
    }, [token, autoConnect, send, state]);

    const connect = useCallback(() => send({ type: "CONNECT", token }), [send, token]);
    const disconnect = useCallback(() => send({ type: "DISCONNECT" }), [send]);
    const retry = useCallback(() => send({ type: "RETRY" }), [send]);


    // Get the current client - components will use this directly for subscriptions
    const getClient = useCallback(() => state.context.stompClient, [state.context.stompClient]);

    // Helper to subscribe with auth token if available
    const subscribe = useCallback((destination, callback) => {
        const client = getClient();
        if (!client) {
            console.warn("Cannot subscribe - no active STOMP client");
            return null;
        }

        const headers = state.context.token ? {
            Authorization: `Bearer ${state.context.token}`
        } : {};

        return client.subscribe(destination, callback, headers);
    }, [getClient, state.context.token]);

    const publish = useCallback((destination, body) => {
        const client = getClient();
        if (!client) {
            console.warn("Cannot publish - no active STOMP client");
            return;
        }

        const headers = state.context.token ? {
            Authorization: `Bearer ${state.context.token}`
        } : {};

        client.publish({
            destination,
            body,
            headers
        });
    }, [getClient, state.context.token]);

    return (
        <StompContext.Provider
            value={{
                state,
                connect,
                disconnect,
                retry,
                getClient,
                subscribe,
                publish,
                error: state.context.error,
            }}
        >
            {children}
        </StompContext.Provider>
    );
}

export function useStomp() {
    return useContext(StompContext);
}