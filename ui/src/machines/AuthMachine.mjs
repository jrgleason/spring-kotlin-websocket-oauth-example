import {createActor, createMachine} from 'xstate';
import { authService } from '../services/AuthService.mjs';

export const authMachine = createMachine({
    id: 'auth',
    initial: 'checkingAuth',
    context: {
        user: null,
        token: null,
        error: null,
        fakeLogin: false,
        auth0Client: null
    },
    states: {
        checkingAuth: {
            invoke: {
                src: 'checkAuthStatus',
                onDone: {
                    target: 'routeAuthStatus',
                    actions: ({ context, event }) => {
                        context.user = event.data.user;
                        context.token = event.data.token;
                        context.fakeLogin = event.data.fakeLogin;
                        context.auth0Client = event.data.auth0Client;
                    }
                },
                onError: {
                    target: 'error',
                    actions: ({ context, event }) => {
                        context.error = event.data;
                    }
                }
            }
        },
        routeAuthStatus: {
            always: [
                {
                    target: 'authenticated',
                    guard: ({ context }) => Boolean(context.token)
                },
                {
                    target: 'notAuthenticated'
                }
            ]
        },
        notAuthenticated: {
            entry: ({ context }) => {
                // If not using fake login, redirect to Auth0
                if (!context.fakeLogin && context.auth0Client) {
                    context.auth0Client.loginWithRedirect();
                }
            }
        },
        authenticated: {
            on: {
                LOGOUT: 'loggingOut',
                TOKEN_EXPIRED: 'checkingAuth'
            }
        },
        loggingOut: {
            entry: ({ _ }) => {
                // Clear storage
                localStorage.clear();
                document.cookie.split(";").forEach((c) => {
                    document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
                });
            },
            invoke: {
                src: async ({ context }) => {
                    if (!context.fakeLogin && context.auth0Client) {
                        await context.auth0Client.logout({
                            returnTo: window.location.origin
                        });
                    }
                },
                onDone: {
                    target: 'notAuthenticated',
                    actions: ({ context }) => {
                        context.user = null;
                        context.token = null;
                        context.error = null;
                    }
                },
                onError: {
                    target: 'error',
                    actions: ({ context, event }) => {
                        context.error = event.data;
                    }
                }
            }
        },
        error: {
            on: {
                RETRY: 'checkingAuth'
            }
        }
    }
});

// Usage:
export const createAuthActor = () => {
    return createActor(authMachine, {
        services: {
            checkAuthStatus: authService.checkAuthStatus
        }
    });
};
