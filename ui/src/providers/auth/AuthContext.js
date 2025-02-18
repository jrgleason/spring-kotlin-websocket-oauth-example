import {createContext, useContext} from 'react';

export const AuthContext = createContext(null);

export function useAuthentication() {
    return useContext(AuthContext);
}