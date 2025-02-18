import {assign, setup} from "xstate";
import {deactivateClient, initClient} from "./actors/stomp/index.mjs";

export const stompMachine = setup({
    guards: {
        hasTokenChanged: ({context, event}) => context.token !== event.token
    },
    actors: {
        initClient,
        deactivateClient
    }
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
            entry: assign({stompClient: null}),
            on: {
                CONNECT: {
                    target: "connecting",
                    actions: assign({token: ({event}) => event.token})
                },
                UPDATE_TOKEN: {
                    target: "deactivating",
                    actions: assign({token: ({event}) => event.token})
                }
            },
        },
        deactivating: {
            on: {
                UPDATE_TOKEN: {
                    guard: "hasTokenChanged",
                    actions: assign({token: ({event}) => event.token})
                }
            },
            invoke: {
                src: "deactivateClient",
                input: ({context}) => ({client: context.stompClient}),
                onDone: "connecting",
                onError: {
                    target: "error",
                    actions: assign({error: ({event}) => event.error})
                }
            }
        },
        connecting: {
            on: {
                UPDATE_TOKEN: {
                    target: "deactivating",
                    guard: "hasTokenChanged",
                    actions: assign({token: ({event}) => event.token})
                }
            },
            invoke: {
                src: "initClient",
                input: ({context}) => ({token: context.token}),
                onDone: {
                    target: "connected",
                    actions: assign({
                        stompClient: ({event}) => event.output,
                        error: null
                    })
                },
                onError: {
                    target: "error",
                    actions: assign({error: ({event}) => event.error})
                }
            }
        },
        connected: {
            on: {
                DISCONNECT: "deactivating",
                UPDATE_TOKEN: {
                    target: "deactivating",
                    actions: assign({token: ({event}) => event.token})
                },
                ERROR: {
                    target: "error",
                    actions: assign({error: (_, evt) => evt.error})
                }
            }
        },
        error: {
            entry: assign({
                stompClient: null,
                subscriptions: []
            }),
            on: {
                RETRY: "connecting",
                UPDATE_TOKEN: {
                    target: "connecting",
                    actions: assign({
                        token: ({event}) => event.token,
                        error: null
                    })
                }
            },
        },
    },
});