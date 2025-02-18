// StompMachine.mjs
import { assign, fromPromise, setup } from "xstate";
import { Client } from "@stomp/stompjs";

export const stompMachine = setup({
    guards: {
        hasTokenChanged: ({ context, event }) => {
            console.log("🔍 Guard checking token change:", {
                currentToken: context.token ? "present" : "absent",
                newToken: event.token ? "present" : "absent",
                hasChanged: context.token !== event.token
            });
            return context.token !== event.token;
        }
    },
    actors: {
        initClient: fromPromise(({input}) => {
            console.log("🔄 initClient actor called with token:", input.token ? "present" : "absent");
            const {token} = input;

            return new Promise((resolve, reject) => {
                const connectionTimeout = setTimeout(() => {
                    reject(new Error("Connection timeout after 10 seconds"));
                }, 10000);

                const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
                const brokerURL = `${wsProtocol}//${window.location.host}/ws`;

                // Prepare connect headers with detailed logging
                const connectHeaders = token ? {
                    Authorization: `Bearer ${token}`,
                    // Add standard STOMP headers
                    'heart-beat': '0,0',
                    'accept-version': '1.1,1.0',
                    'content-type': 'application/json'
                } : {};

                console.log("🔌 Connecting to:", brokerURL);
                console.log("🎫 Connect headers:", JSON.stringify(connectHeaders, null, 2));

                const client = new Client({
                    brokerURL,
                    connectHeaders,
                    debug: function(str) {
                        // Log all STOMP protocol messages
                        console.log("🔍 STOMP Debug:", str);
                    },
                    onWebSocketError: (error) => {
                        console.error("❌ WebSocket error:", {
                            url: error.target?.url,
                            readyState: error.target?.readyState,
                            type: error.type,
                            message: error.message
                        });
                        clearTimeout(connectionTimeout);
                        reject(new Error("WebSocket connection failed"));
                    },
                    onWebSocketClose: (event) => {
                        console.log("🔒 WebSocket closed:", {
                            code: event.code,
                            reason: event.reason,
                            wasClean: event.wasClean
                        });
                    },
                    onStompError: (frame) => {
                        // Enhanced STOMP error logging
                        console.error("❌ STOMP error details:", {
                            command: frame.command,
                            headers: frame.headers,
                            body: frame.body,
                            binaryBody: frame.binaryBody ? "present" : "absent",
                            raw: frame
                        });

                        // Check for specific error conditions
                        if (frame.headers.message?.includes('clientInboundChannel')) {
                            console.error("💡 Server inbound channel error - possible authentication issue");
                        }

                        clearTimeout(connectionTimeout);
                        reject(new Error(`STOMP Error: ${frame.headers.message || "Unknown error"}`));
                    }
                });

                client.onConnect = (frame) => {
                    console.log("✅ STOMP connected with frame:", frame);
                    clearTimeout(connectionTimeout);
                    resolve(client);
                };

                try {
                    console.log("🚀 Activating STOMP client...");
                    client.activate();
                } catch (error) {
                    console.error("💥 Client activation error:", error);
                    clearTimeout(connectionTimeout);
                    reject(error);
                }
            });
        }),
        deactivateClient: fromPromise(({input}) => {
            console.log("🔄 deactivateClient actor called", input);
            const {client} = input;
            if (!client) {
                console.log("⚠️ No client to deactivate");
                return Promise.resolve();
            }

            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    console.warn("⚠️ STOMP client deactivation timed out");
                    resolve();
                }, 5000);

                client.deactivate()
                    .then(() => {
                        clearTimeout(timeout);
                        console.log("✅ STOMP client deactivated successfully");
                        resolve();
                    })
                    .catch((error) => {
                        clearTimeout(timeout);
                        console.error("❌ Error deactivating STOMP client:", error);
                        resolve();
                    });
            });
        }),
    },
}).createMachine({
    id: "stomp",
    initial: "disconnected",
    context: {
        stompClient: null,
        token: null,
        error: null,
        subscriptions: [],
    },
    states: {
        disconnected: {
            entry: [
                () => console.log("📍 Entering disconnected state"),
                assign({
                    stompClient: null
                })
            ],
            on: {
                CONNECT: {
                    target: "connecting",
                    actions: assign({
                        token: ({event}) => event.token
                    })
                },
                UPDATE_TOKEN: {
                    target: "deactivating",
                    actions: assign({
                        token: ({event}) => event.token
                    })
                }
            },
        },
        deactivating: {
            entry: () => console.log("📍 Entering deactivating state"),
            exit: () => console.log("📍 Exiting deactivating state"),
            on: {
                UPDATE_TOKEN: {
                    guard: "hasTokenChanged",  // Added guard here
                    actions: [
                        () => console.log("🎯 UPDATE_TOKEN received while deactivating"),
                        assign({
                            token: ({event}) => {
                                console.log("🔑 Storing new token for after deactivation");
                                return event.token;
                            }
                        })
                    ]
                }
            },
            invoke: {
                src: "deactivateClient",
                input: ({context}) => {
                    console.log("📤 Deactivating client input:", context.stompClient ? "has client" : "no client");
                    return {
                        client: context.stompClient
                    };
                },
                onDone: {
                    target: "connecting",
                    actions: () => console.log("✅ Deactivation completed successfully")
                },
                onError: {
                    target: "error",
                    actions: [
                        () => console.log("❌ Deactivation failed"),
                        assign({
                            error: ({event}) => event.error
                        })
                    ]
                }
            }
        },
        connecting: {
            entry: () => console.log("📍 Entering connecting state"),
            exit: () => console.log("📍 Exiting connecting state"),
            on: {
                UPDATE_TOKEN: {
                    target: "deactivating",
                    guard: "hasTokenChanged",
                    actions: [
                        () => console.log("🎯 UPDATE_TOKEN event received in connecting state"),
                        assign({
                            token: ({event}) => {
                                console.log("🔑 Setting token in connecting state:", event.token ? "present" : "absent");
                                return event.token;
                            }
                        })
                    ]
                }
            },
            invoke: {
                src: "initClient",
                input: ({context}) => {
                    console.log("📤 Connecting with token:", context.token ? "present" : "absent");
                    return {
                        token: context.token
                    };
                },
                onDone: {
                    target: "connected",
                    actions: [
                        () => console.log("✅ Connection completed successfully"),
                        assign({
                            stompClient: ({event}) => event.output,
                            error: null
                        })
                    ]
                },
                onError: {
                    target: "error",
                    actions: [
                        () => console.log("❌ Connection failed"),
                        assign({
                            error: ({event}) => event.error
                        })
                    ]
                }
            }
        },
        connected: {
            entry: () => console.log("📍 Entering connected state"),
            on: {
                DISCONNECT: "deactivating",
                UPDATE_TOKEN: {
                    target: "deactivating",
                    actions: assign({
                        token: ({event}) => event.token
                    })
                },
                ERROR: {
                    target: "error",
                    actions: assign({
                        error: (_, evt) => evt.error
                    })
                }
            }
        },
        error: {
            entry: [
                () => console.log("📍 Entering error state"),
                assign({
                    stompClient: (context) => {
                        console.log("🗑️ Cleaning up client in error state");
                        return null;
                    },
                    subscriptions: []
                })
            ],
            exit: () => console.log("📍 Exiting error state"),
            on: {
                RETRY: {
                    target: "connecting",
                    actions: () => console.log("🎯 RETRY event received in error state")
                },
                UPDATE_TOKEN: {
                    target: "connecting",
                    actions: [
                        () => console.log("🎯 UPDATE_TOKEN event received in error state"),
                        assign({
                            token: ({event}) => {
                                console.log("🔑 Setting token in error state:", event.token ? "present" : "absent");
                                return event.token;
                            },
                            error: null
                        })
                    ]
                }
            },
        },
    },
});