import './App.css';
import React from 'react';
import { Auth0Provider } from "@auth0/auth0-react";
import {AuthenticationProvider, useAuth} from './components/auth/AuthenticationProvider.jsx';
import Header from './components/Header';
import MarketingSplash from './components/marketing/MarketingSplash.jsx';
import StompPage from './components/stomp/StompPage';

const domain = "jackiergleason.auth0.com";
const clientId = "4HTFO1nZO320Xsj0r2gZHEngW1F7G3fJ";

function AppContent() {
    const { state, send, isAuthenticated, user, token, error } = useAuth();

    const handleLogin = () => {
        console.log("Login button clicked");
        send({ type: 'LOGIN' });
    };

    const handleLogout = () => send({ type: 'LOGOUT' });

    if (state.matches('checkingAuth')) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Header isAuthenticated={false} onLogin={handleLogin} onLogout={handleLogout} />
                <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                    <div className="text-lg">Checking authentication...</div>
                </div>
            </div>
        );
    }

    if (state.matches('error')) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Header isAuthenticated={false} onLogin={handleLogin} onLogout={handleLogout} />
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
                    <div className="text-red-500 mb-4">
                        Error: {error?.message || 'Authentication failed'}
                    </div>
                    <button
                        onClick={() => send({ type: 'RETRY' })}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Header
                isAuthenticated={isAuthenticated}
                onLogin={handleLogin}
                onLogout={handleLogout}
                username={user?.name || 'User'}
            />
            <main>
                {isAuthenticated ? <StompPage token={token} /> : <MarketingSplash />}
            </main>
        </div>
    );
}

function App() {
    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            useRefreshTokensFallback={true}
            cacheLocation="localstorage"
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience: "https://billing.secondave.net",
                defaultScope: "openid profile read:transactions",
            }}
        >
            <AuthenticationProvider>
                <AppContent />
            </AuthenticationProvider>
        </Auth0Provider>
    );
}

export default App;
