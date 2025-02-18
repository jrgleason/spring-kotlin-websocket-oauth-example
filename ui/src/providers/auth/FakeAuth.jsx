// FakeAuthProvider.jsx
import React, {useState} from 'react';
import {AuthContext} from "./AuthContext.js";

export function FakeAuthProvider({fakeToken, children}) {
    const [token, setToken] = useState(fakeToken);
    const [user, setUser] = useState({name: 'FakeUser'});
    const isAuthenticated = !!token;

    const login = () => {
        // In fake mode, you might just set a token
        console.log('[FAKE] Logging in');
        setToken(fakeToken);
        setUser({name: 'FakeUser'});
    };

    const logout = () => {
        console.log('[FAKE] Logging out');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{token, user, isAuthenticated, login, logout}}
        >
            {children}
        </AuthContext.Provider>
    );
}
