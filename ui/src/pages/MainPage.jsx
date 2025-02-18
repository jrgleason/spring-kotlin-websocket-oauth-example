// MainPage.jsx
import React from "react";
import {useAuthentication} from "../providers/auth/AuthContext.js";
import StompPage from "../components/stomp/StompPage.jsx";
import MarketingSplash from "../components/marketing/MarketingSplash.jsx";
import Header from "../components/Header.jsx";
import {StompProvider} from "../providers/stomp/StompProvider.jsx";

export default function MainPage() {
    const {isAuthenticated, user, token, login, logout} = useAuthentication();

    const handleLogin = () => {
        console.log("Login button clicked");
        login();
    };

    const handleLogout = () => {
        console.log("Logout button clicked");
        logout();
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header
                isAuthenticated={isAuthenticated}
                onLogin={handleLogin}
                onLogout={handleLogout}
                username={user?.name || "User"}
            />
            <main>
                {isAuthenticated ? (
                    // Wrap the StompPage with the StompProvider
                    <StompProvider token={token}>
                        <StompPage/>
                    </StompProvider>
                ) : (
                    <MarketingSplash/>
                )}
            </main>
        </div>
    );
}
