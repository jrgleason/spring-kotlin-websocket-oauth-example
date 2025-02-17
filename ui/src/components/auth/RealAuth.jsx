// RealAuth.jsx

import React, { useEffect } from "react";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useMachine } from "@xstate/react"; // from "@xstate/react"
import { AuthContext } from "./AuthContext";
import {authMachine} from "../../machines/AuthMachine.mjs";

export function RealAuthProvider({ children }) {
    const {
        isAuthenticated,
        user,
        loginWithRedirect,
        logout,
        getAccessTokenSilently
    } = useAuth0();

    const [state, send] = useMachine(authMachine, {
        devTools: true,
        // "input" is recognized in v5 for external data
        input: {
            getAccessTokenSilently
        }
    });

    // 2) Example: when isAuthenticated changes, ask the machine to get token.
    useEffect(() => {
        console.log("isAuthenticated changed:", isAuthenticated);
        console.log("send:", send);
        if (isAuthenticated) {
            send({
                type:"START_GET_TOKEN",
                user
            });
        }
    }, [isAuthenticated, send]);
    // 3) Provide the machine’s token in your existing AuthContext.
    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                token: state.context.token,
                login: loginWithRedirect,
                logout: () => {
                    // Let the machine clean up if needed
                    send("LOGOUT");
                    // Also call the underlying Auth0 logout
                    logout({ logoutParams: { returnTo: window.location.origin } });
                },
                // If you wanted to manually refresh:
                error: state.context.error
                // etc.
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function RealAuthWrapper({ domain, clientId, audience, scope, children }) {
    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            cacheLocation="localstorage"
            useRefreshTokensFallback={true}
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience: audience,
                defaultScope: scope
            }}
        >
            <RealAuthProvider>
                {children}
            </RealAuthProvider>
        </Auth0Provider>
    );
}