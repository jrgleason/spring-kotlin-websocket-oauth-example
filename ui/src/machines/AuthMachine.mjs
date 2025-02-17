import {assign, setup} from "xstate";
import {fetchToken} from "./auth/actors/realAuth/index.mjs";

export const authMachine = setup({
    actions: {
        assignToken: assign(({context, event}) => {
            context.token = event.output?.token || null;
            context.user = event.output?.user || null;
            context.error = null;
        }),
        clearTokens: assign(({context}) => {
            context.token = null;
            context.user = null;
            context.error = null;
        }),
        assignError: assign(({context, event}) => {
            context.error = event.error;
        })
    }, actors:{
        fetchToken
    }
}).createMachine({
    id: 'authMachine',
    context: ({input})=>({
        // Insert a reference to getAccessTokenSilently from useAuth0 here,
        // plus any other values you want (like useRefresh).
        getAccessTokenSilently: input.getAccessTokenSilently,
        token: null,
        user: null,
        error: null
    }),
    initial: 'idle',
    states: {
        idle: {
            on: {
                START_GET_TOKEN: { target: 'gettingToken' }
            }
        },
        gettingToken: {
            entry: ({context})=>{
              console.log("Trying to get the token");
              console.log("Context is: ", JSON.stringify(context));
            },
            invoke: {
                src: "fetchToken",
                input: ({
                            context,
                            event,
                        }) =>
                    ({
                        getAccessTokenSilently: context.getAccessTokenSilently,
                        user: event.user
                    }),
                onDone: {
                    target: 'loggedIn',
                    actions: ({ context, event }) => {
                        context.token = event.output.token;
                        context.user = event.output.user;
                        console.log("Context after is: ", JSON.stringify(context));
                    },
                },
                onError: {
                    target: 'error',
                    actions: 'assignError'
                }
            }
        },
        loggedIn: {
            on: {
                LOGOUT: {
                    target: 'idle',
                    actions: 'clearTokens'
                }
            }
        },
        /**
         * 5) error: handle failures
         */
        error: {
            on: {
                RETRY: { target: 'gettingToken' },
                CLEAR_ERROR: {
                    actions: 'assignError'
                }
            }
        }
    }
});