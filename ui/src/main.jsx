import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {GlobalConfigProvider} from "./components/auth/GlobalConfigProvider.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <GlobalConfigProvider>
            <App/>
        </GlobalConfigProvider>
    </StrictMode>,
)
