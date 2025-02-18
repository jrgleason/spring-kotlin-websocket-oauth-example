const Header = ({isAuthenticated, onLogin, onLogout, username}) => {
    return (
        <header className="bg-gray-900 text-white py-4 px-6 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <div className="font-bold text-xl">WebSocket Demo</div>
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <span className="text-gray-300">Welcome, {username}</span>
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onLogin}
                            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;