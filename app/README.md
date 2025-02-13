# WebSocket OAuth Backend

Spring Boot backend demonstrating secure WebSocket communication with OAuth/JWT authentication.

## Running the Application

```bash
./gradlew bootRun --args='--spring.profiles.active=fake-jwt'  # For development
./gradlew bootRun  # For production
```

## Key Components

### WebSocket Configuration (`WebSocketConfig.kt`)

Configures STOMP message broker and WebSocket endpoints:

```kotlin
@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig : WebSocketMessageBrokerConfigurer {
    override fun configureMessageBroker(registry: MessageBrokerRegistry) {
        registry.enableSimpleBroker("/topic", "/queue")
        registry.setApplicationDestinationPrefixes("/app")
        registry.setUserDestinationPrefix("/user")
    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS()
    }
}
```

### Security Configuration

#### Development Mode (`FakeJwtConfig.kt`)
Provides a test JWT decoder using a hardcoded token:

```kotlin
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
                .claim("sub", "user")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build()
        }
    }
}
```

#### Production Mode (`SecurityConfig.kt`)
Configures OAuth2 resource server and endpoint security:

```kotlin
@Configuration
@EnableWebSecurity
class SecurityConfig {
    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .oauth2ResourceServer { oauth2 -> oauth2.jwt { } }
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers("/protected/**").authenticated()
                    .requestMatchers("/fe/**").authenticated()
                    .anyRequest().permitAll()
            }
        return http.build()
    }
}
```

## Available Endpoints

### WebSocket
- `/ws` - Main WebSocket endpoint (SockJS enabled)

### Message Destinations
- `/app/private-message` - Send private messages
- `/user/{username}/chat/messages` - Receive private messages
- `/app/status` - Send status updates
- `/topic/status` - Receive status updates

### HTTP
- `/fe/**` - Protected frontend endpoints
- `/protected/**` - Protected API endpoints

## Configuration

### Development (application.yml)
```yaml
spring:
  profiles:
    active: fake-jwt

server:
  port: 7443
  ssl:
    enabled: true
```

### Production (application.yml)
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: your-oauth-server-url

server:
  port: 7443
  ssl:
    enabled: true
    key-store: your-keystore.p12
    key-store-password: your-password
    key-store-type: PKCS12
```

## Security Notes

- All WebSocket messages require JWT authentication
- JWT tokens must be included in message headers
- Custom channel interceptor handles principal propagation
- Development mode uses a fake JWT token ("test.token")
- Production should configure a proper OAuth2 provider