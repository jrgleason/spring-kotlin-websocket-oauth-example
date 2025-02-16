import './App.css';
import React from 'react';
import {useGlobalConfig} from "./components/auth/GlobalConfigProvider.jsx";
import {FakeAuthProvider} from "./components/auth/FakeAuth.jsx";
import MainPage from "./pages/MainPage.jsx";
import {RealAuthWrapper} from "./components/auth/RealAuth.jsx";

export function App() {
    const config = useGlobalConfig(); // e.g. { fakeLogin: "true", fakeToken: "...", domain: "...", ... }

    if (!config) {
        // Shouldn't happen if we've already handled loading, but just in case
        return <div>Config not loaded</div>;
    }

    // If the global config says we're using fake login:
    if (config.fakeLogin === 'true') {
        return (
            <FakeAuthProvider fakeToken={config.fakeToken}>
                <MainPage/>
            </FakeAuthProvider>
        );
    }

    // Otherwise, real Auth0
    // We use domain/clientId from config
    return (
        <RealAuthWrapper
            domain={config.domain}
            clientId={config.clientId}
            audience={config.audience}
            scope={config.scope}
        >
            <MainPage/>
        </RealAuthWrapper>
    );
}

export default App;
