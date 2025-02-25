import {fromPromise} from 'xstate';

const fetchToken = fromPromise(async ({input}) => {
    const {getAccessTokenSilently, user} = input;
    if (!getAccessTokenSilently) {
        throw new Error("getAccessTokenSilently not provided in machine context!");
    }
    const token = await getAccessTokenSilently();
    console.log('[REAL AUTH ACTOR] Got token:', token);
    return {
        token,
        user
    };
})

/**
 * Tries to get a real token silently (i.e. if the user is already logged in).
 * If it fails, that means user is not logged in yet (token = null).
 */
const checkRealAuth = fromPromise(async (context) => {
    console.log('[REAL AUTH ACTOR] Checking if user is already logged in...');
    // const { getAccessTokenSilently } = context;
    // try {
    //     const token = await getAccessTokenSilently({
    //         authorizationParams: {
    //             audience: 'https://billing.secondave.net',
    //             scope: 'openid profile read:transactions'
    //         }
    //     });
    //     console.log('[REAL AUTH ACTOR] Got token silently:', token);
    //     return {
    //         isAuthenticated: true,
    //         token,
    //         fakeLogin: false
    //     };
    // } catch (err) {
    //     console.log('[REAL AUTH ACTOR] Not logged in yet or silent token failed:', err);
    //     return {
    //         isAuthenticated: false,
    //         token: null,
    //         fakeLogin: false
    //     };
    // }
});

export {fetchToken};
