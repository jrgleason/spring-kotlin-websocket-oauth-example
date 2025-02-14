import React, { createContext, useContext } from 'react';
import { useMachine } from '@xstate/react';
import {authMachine} from "../../machines/AuthMachine.mjs";

const AuthContext = createContext();

export const AuthenticationProvider = ({ children }) => {
    const [state, send] = useMachine(authMachine);

    const value = {
        state,
        send,
        token: state.context.token,
        user: state.context.user,
        isAuthenticated: state.matches('authenticated'),
        error: state.context.error
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};