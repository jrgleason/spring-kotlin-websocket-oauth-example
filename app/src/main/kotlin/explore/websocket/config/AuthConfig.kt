package explore.websocket.config

import explore.websocket.config.providers.AuthPropertiesProvider
import org.springframework.boot.autoconfigure.security.oauth2.resource.OAuth2ResourceServerProperties
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.context.properties.bind.ConstructorBinding
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile

@ConfigurationProperties(prefix = "app.auth")
data class AuthProperties @ConstructorBinding constructor(
    val clientId: String,
    val scope: String
)

@Configuration
@Profile("!fake-jwt")
@EnableConfigurationProperties(AuthProperties::class)
class AuthConfig(
    private val oauth2Props: OAuth2ResourceServerProperties,
    private val authProperties: AuthProperties
) {
    private fun extractDomain(): String {
        val issuerUri = oauth2Props.jwt.issuerUri
            ?: throw IllegalStateException("issuer-uri not configured")

        return Regex("^(?:[^:]+://)?([^/?]+)")
            .find(issuerUri)
            ?.groupValues
            ?.get(1)
            ?: throw IllegalStateException("Invalid issuer-uri format")
    }

    @Bean
    fun authPropertiesProvider(): AuthPropertiesProvider = object : AuthPropertiesProvider {
        override fun getAuthProperties(): Map<String, String> = mapOf(
            "domain" to extractDomain(),
            "clientId" to authProperties.clientId,
            "audience" to oauth2Props.jwt.audiences.joinToString(","),
            "scope" to authProperties.scope,
            "fakeLogin" to "false"
        )
    }
}