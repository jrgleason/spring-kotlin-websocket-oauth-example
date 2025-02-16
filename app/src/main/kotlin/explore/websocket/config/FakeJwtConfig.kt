package explore.websocket.config

import explore.websocket.config.providers.AuthPropertiesProvider
import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtException
import java.time.Instant

@Configuration
@Profile("fake-jwt")
@ConfigurationProperties(prefix = "app.fake")
class FakeJwtConfig {
    private val logger = LoggerFactory.getLogger(FakeJwtConfig::class.java)

    @Value("\${token:test.token}")
    private var fakeToken: String = ""
    @Value("\${sub:fakeUser}")
    private var sub: String = ""
    @Value("\${alg:fakeAlg}")
    private var alg: String? = ""
    @Value("\${expiry-seconds:3600}")
    private var expirySeconds: Long = 0

    @PostConstruct
    fun logConfig() {
        logger.info("Fake JWT Configuration:")
        logger.info("Token: {}", fakeToken)
        logger.info("Subject: {}", sub)
        logger.info("Algorithm: {}", alg)
        logger.info("Expiry Seconds: {}", expirySeconds)
    }

    @Bean
    fun authPropertiesProvider(): AuthPropertiesProvider = object : AuthPropertiesProvider {
        override fun getAuthProperties(): Map<String, String> = mapOf(
            "fakeLogin" to "true",
            "fakeToken" to fakeToken
        )
    }

    @Bean
    fun jwtDecoder(): JwtDecoder {
        return JwtDecoder { token ->
            if (token != fakeToken) {
                throw JwtException("Invalid token")
            }

            Jwt.withTokenValue(token)
                .header("alg", alg)
                .claim("sub", sub)
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(expirySeconds))
                .build()
        }
    }
}