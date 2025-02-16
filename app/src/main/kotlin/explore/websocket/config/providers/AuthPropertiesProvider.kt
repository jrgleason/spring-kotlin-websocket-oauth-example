package explore.websocket.config.providers

interface AuthPropertiesProvider {
    fun getAuthProperties(): Map<String, String>
}