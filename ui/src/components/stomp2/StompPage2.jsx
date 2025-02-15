import PrivateChat2 from "./PrivateChat2.jsx"

const StompPage = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-8">
            <div className="mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">STOMP Test Client</h1>

                <div className="flex gap-8">
                    <div className="flex-1">
                        <PrivateChat2 username="user1" token="test.token"/>
                    </div>
                    <div className="flex-1">
                        <PrivateChat2 username="user2" token="test.token2"/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StompPage