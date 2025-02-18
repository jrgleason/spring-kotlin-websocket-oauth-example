import {fromPromise} from 'xstate';

/**
 * Loads the global config from /fe/global
 * Returns something like { fakeLogin: "true" } or { fakeLogin: false }, etc.
 */
const fetchGlobalConfig = fromPromise(async () => {
    console.log('[GLOBAL CONFIG ACTOR] Fetching /fe/global');
    const response = await fetch('/fe/global');
    const config = await response.json();
    console.log('[GLOBAL CONFIG ACTOR] Received config:', config);
    return config;
});

export {fetchGlobalConfig};
