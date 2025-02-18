package explore.websocket.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationProvider

@Configuration
class AuthProviderConfig(
    private val jwtDecoder: JwtDecoder
) {
    @Bean
    fun jwtAuthenticationProvider(): AuthenticationProvider {
        return JwtAuthenticationProvider(jwtDecoder)
    }
}