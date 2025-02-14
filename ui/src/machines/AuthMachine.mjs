import {createMachine, fromPromise} from 'xstate';
import {createAuth0Client} from '@auth0/auth0-spa-js';

const TEST_TOKEN = 'test.token';
const domain = "jackiergleason.auth0.com";
const clientId = "4HTFO1nZO320Xsj0r2gZHEngW1F7G3fJ";

const getTokenSilently = async (auth0Client) => {
    const audience = 'https://billing.secondave.net';
    const scope = 'openid profile read:transactions';

    try {
        return await auth0Client.getAccessTokenSilently({
            authorizationParams: {
                audience,
                scope
            }
        });
    } catch (error) {
        console.error('Failed to fetch token:', error);
        throw error;
    }
};

const checkAuthStatus = fromPromise(async () => {
    console.log("Starting the status check");
    try {
        // Check if using fake login
        const globalResponse = await fetch('/fe/global');
        const responseObj = await globalResponse.json();
        console.log('Response:', JSON.stringify(responseObj));
        if (responseObj.fakeLogin === 'true') {
            const response = await fetch('/fe/user', {
                headers: {
                    'Authorization': `Bearer ${TEST_TOKEN}`
                }
            });
            const data = await response.json();
            return {
                isAuthenticated: true,
                user: { name: data.name },
                token: TEST_TOKEN,
                fakeLogin: true
            };
        }

        // Not using fake login, try to get Auth0 token
        const auth0Client = await createAuth0Client({
            domain,
            clientId,
            authorizationParams: {
                redirect_uri: window.location.origin,
            }
        });

        try {
            const token = await getTokenSilently(auth0Client);
            const user = await auth0Client.getUser();

            return {
                isAuthenticated: true,
                user,
                token,
                fakeLogin: false,
                auth0Client
            };
        } catch (error) {
            // If token fetch fails, user needs to login
            console.log('Token fetch failed:', error);
            return {
                isAuthenticated: false,
                user: null,
                token: null,
                fakeLogin: false,
                auth0Client
            };
        }
    } catch (error) {
        console.log('Auth status check failed:', error);
        throw error;
    }
});

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
                src: checkAuthStatus,
                onDone: {
                    target: 'routeAuthStatus',
                    actions: ({ context, event }) => {
                        context.user = event.output.user;
                        context.token = event.output.token;
                        context.fakeLogin = event.output.fakeLogin;
                        context.auth0Client = event.output.auth0Client;
                    }
                },
                onError: {
                    target: 'error',
                    actions: ({ context, event }) => {
                        context.error = event.output;
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
            // NO automatic loginWithRedirect() here
            on: {
                LOGIN: {
                    actions: ({ context }) => {
                        console.log("User clicked login");
                        if (context.auth0Client) {
                            context.auth0Client.loginWithRedirect().catch((error) => {
                                console.error('Failed to login:', error);
                            });
                        } else {
                            console.error("Auth0 client is not initialized");
                        }
                    }
                }
            }
        },
        authenticated: {
            on: {
                LOGOUT: {
                    target: 'loggingOut',
                },
                TOKEN_EXPIRED: {
                    target: 'checkingAuth'
                }
            }
        },
        loggingOut: {
            entry: () => {
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
                        context.error = event.output;
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
