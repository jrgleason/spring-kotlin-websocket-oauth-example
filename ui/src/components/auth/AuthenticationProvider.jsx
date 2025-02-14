import React, { createContext, useContext, useEffect } from 'react';
import { useMachine } from '@xstate/react';
import {authMachine} from "../../machines/AuthMachine.mjs";
import {authService} from "../../services/AuthService.mjs";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [state, send] = useMachine(authMachine, {
        services: {
            checkAuthStatus: authService.checkAuthStatus
        }
    });

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

// Custom hook for accessing the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};