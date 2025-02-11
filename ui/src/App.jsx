import {useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import WebSocketClient from "./components/WebSocketClient.jsx";

function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            <WebSocketClient />
        </>
    )
}

export default App
