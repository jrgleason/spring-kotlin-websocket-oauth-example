import {setup} from "xstate";
import {fetchGlobalConfig} from "./actors/auth/preLogin.mjs";

export const globalConfigMachine = setup({
    actors: {
        fetchGlobalConfig
    }
}).createMachine({
    id: 'globalConfigMachine',
    initial: 'loadingConfig',
    context: {
        config: null,
        error: null
    },
    states: {
        loadingConfig: {
            invoke: {
                src: 'fetchGlobalConfig',
                onDone: {
                    target: 'done',
                    actions: ({context, event}) => {
                        console.log('[MACHINE] Storing global config in context');
                        context.config = event.output; // store entire config object
                    }
                },
                onError: {
                    target: 'error',
                    actions: ({context, event}) => {
                        console.error('[MACHINE] Failed to fetch global config:', event.output);
                        context.error = event.output;
                    }
                }
            }
        },
        done: {
            type: 'final'
        },
        error: {
            // show something in UI or allow retry
        }
    }
});
