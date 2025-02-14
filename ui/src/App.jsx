import React from 'react';
import StompPage from './components/stomp/StompPage';
import Header from './components/Header';
import {AuthProvider, useAuth} from "./components/auth/AuthenticationProvider.jsx";
import MarketingSplash from "./components/marketing/MarketingSplash.jsx";

function App() {
    return (
        <AuthProvider>
            <AppRouting />
        </AuthProvider>
    );
}

// This could also just be inside the App component, but separating it
// ensures the useAuth hook is used within the provider
function AppRouting() {
    const { state, send, isAuthenticated, user, token, error } = useAuth();

    const handleLogin = () => send({ type: 'LOGIN' });
    const handleLogout = () => send({ type: 'LOGOUT' });

    // Show loading state while checking auth
    if (state.matches('checkingAuth')) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Header
                    isAuthenticated={false}
                    onLogin={handleLogin}
                    onLogout={handleLogout}
                />
                <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                    <div className="text-lg">Loading...</div>
                </div>
            </div>
        );
    }

    // Show error state if authentication fails
    if (state.matches('error')) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Header
                    isAuthenticated={false}
                    onLogin={handleLogin}
                    onLogout={handleLogout}
                />
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
                {isAuthenticated ? (
                    <StompPage token={token} />
                ) : (
                    <MarketingSplash />
                )}
            </main>
        </div>
    );
}

export default App;