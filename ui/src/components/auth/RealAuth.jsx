import {Auth0Provider, useAuth0} from "@auth0/auth0-react";
import {AuthContext} from "./AuthContext.js";

export function RealAuthProvider({ children }) {
    const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                token: null, // or fetch if you want
                login: loginWithRedirect,
                logout: () => logout({ returnTo: window.location.origin })
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function RealAuthWrapper({domain, clientId, audience, scope, children}) {
    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            cacheLocation="localstorage"
            useRefreshTokensFallback={true}
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience: audience || 'https://billing.secondave.net',
                defaultScope: scope || 'openid profile read:transactions'
            }}
        >
            {/* If you're using an XState machine for real auth, wrap that here */}
            <RealAuthProvider>
                {children}
            </RealAuthProvider>
        </Auth0Provider>
    );
}