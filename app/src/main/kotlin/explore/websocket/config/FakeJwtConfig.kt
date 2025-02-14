package explore.websocket.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtException
import java.time.Instant

@Configuration
@Profile("fake-jwt")
class FakeJwtConfig {
    @Bean
    fun jwtDecoder(): JwtDecoder {
        return JwtDecoder { token ->
            if (token != "test.token") {
                throw JwtException("Invalid token")
            }

            Jwt.withTokenValue(token)
                .header("alg", "none")
                .claim("sub", "fakeUser")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build()
        }
    }
}