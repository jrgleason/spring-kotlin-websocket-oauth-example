import { setup } from 'xstate';
import { checkRealAuth } from "./auth/actors/realAuth/index.mjs";
import {doFakeUserCheck} from "./auth/actors/fakeLogin/index.mjs";

export const authMachine = setup({
    // Register our 3 actors in `actors: { ... }`
    actors: {
        doFakeUserCheck,
        checkRealAuth
    },

    // Define any guards needed
    guards: {
        isFakeLogin: ({ event }) => {
            // event.output => { fakeLogin: true/false/"true" }
            console.log('[GUARD] Checking isFakeLogin:', event.output);
            return event.output.fakeLogin === true || event.output.fakeLogin === 'true';
        },
        hasToken: ({ context }) => {
            console.log('[GUARD] Checking if we have a token in context:', context.token);
            return Boolean(context.token);
        }
    }
}).createMachine({
    id: 'idle',
    initial: 'idle',
    states: {
        idle: {

        }
    }
});
