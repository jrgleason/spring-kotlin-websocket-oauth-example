// GlobalConfigProvider.js
import React, { createContext, useContext } from 'react';
import { useMachine } from '@xstate/react';
import {globalConfigMachine} from "../machines/GlobalPropertiesMachine.mjs"; // v5 or v4 is similar

const GlobalConfigContext = createContext(null);

export function GlobalConfigProvider({ children }) {
    const [state] = useMachine(globalConfigMachine);
    if (state.matches('loadingConfig')) {
        return <div>Loading global config…</div>;
    }
    if (state.matches('error')) {
        return <div>Error loading config: {JSON.stringify(state.context.error)}</div>;
    }
    // If we reach 'done', we have config at state.context.config
    const config = state.context.config;
    return (
        <GlobalConfigContext.Provider value={config}>
            {children}
        </GlobalConfigContext.Provider>
    );
}

// Hook to easily grab the global config
export function useGlobalConfig() {
    return useContext(GlobalConfigContext);
}
