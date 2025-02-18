import {fromPromise} from "xstate";
import {Client} from "@stomp/stompjs";

const initClient = fromPromise(({input}) => {
    const {token} = input;

    return new Promise((resolve, reject) => {
        const connectionTimeout = setTimeout(() => {
            reject(new Error("Connection timeout after 10 seconds"));
        }, 10000);

        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const brokerURL = `${wsProtocol}//${window.location.host}/ws`;
        const connectHeaders = token ? {
            Authorization: `Bearer ${token}`
        } : {};

        const client = new Client({
            brokerURL,
            connectHeaders,
            debug: (str) => console.log("STOMP Debug:", str),
            onWebSocketError: (error) => {
                clearTimeout(connectionTimeout);
                reject(new Error("WebSocket connection failed"));
            },
            onWebSocketClose: () => {
            },
            onStompError: (frame) => {
                clearTimeout(connectionTimeout);
                reject(new Error(`STOMP Error: ${frame.headers.message || "Unknown error"}`));
            }
        });

        client.onConnect = (frame) => {
            clearTimeout(connectionTimeout);
            resolve(client);
        };

        try {
            client.activate();
        } catch (error) {
            clearTimeout(connectionTimeout);
            reject(error);
        }
    });
});

const deactivateClient = fromPromise(({input}) => {
    const {client} = input;
    if (!client) return Promise.resolve();

    return new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(), 5000);

        client.deactivate()
            .then(() => {
                clearTimeout(timeout);
                resolve();
            })
            .catch(() => {
                clearTimeout(timeout);
                resolve();
            });
    });
});

export {initClient, deactivateClient};