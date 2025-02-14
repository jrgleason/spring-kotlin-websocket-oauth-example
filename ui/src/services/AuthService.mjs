import { createAuth0Client } from '@auth0/auth0-spa-js';
import { fromPromise } from 'xstate';

const TEST_TOKEN = 'test.token';
const domain = "jackiergleason.auth0.com";
const clientId = "4HTFO1nZO320Xsj0r2gZHEngW1F7G3fJ";

const fetchToken = fromPromise(async ({ input }) => {
    const audience = 'https://billing.secondave.net';
    const scope = 'openid profile read:transactions';

    try {
        const token = await input.auth0Client.getAccessTokenSilently({
            authorizationParams: {
                audience,
                scope
            }
        });
        return { token };
    } catch (error) {
        console.error('Failed to fetch token:', error);
        throw error;
    }
});

export const authService = {
    checkAuthStatus: async () => {
        try {
            // Check if using fake login
            const globalResponse = await fetch('/fe/global');
            const global = await globalResponse.json();

            if (global.fakeLogin === 'true') {
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
                const { token } = await fetchToken({ auth0Client });
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
                return {
                    isAuthenticated: false,
                    user: null,
                    token: null,
                    fakeLogin: false,
                    auth0Client
                };
            }
        } catch (error) {
            console.error('Auth status check failed:', error);
            throw error;
        }
    }
};