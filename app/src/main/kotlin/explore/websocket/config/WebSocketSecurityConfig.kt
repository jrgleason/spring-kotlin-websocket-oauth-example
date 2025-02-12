package explore.websocket.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.messaging.Message
import org.springframework.messaging.simp.SimpMessageType
import org.springframework.security.authorization.AuthorizationManager
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager

@Profile("secure")
@Configuration
@EnableWebSocketSecurity
class WebSocketSecurityConfig {
    @Bean
    fun messageAuthorizationManager(
        messages: MessageMatcherDelegatingAuthorizationManager.Builder
    ): AuthorizationManager<Message<*>> {
        messages
            // Next 2 lines are required for requests without auth.
            // Remove these if all paths require auth
            .simpTypeMatchers(SimpMessageType.CONNECT).permitAll()
            .simpTypeMatchers(SimpMessageType.DISCONNECT).permitAll()
            .simpDestMatchers("/app/status", "/topic/status").permitAll()
            .simpDestMatchers("/app/hello", "/topic/greetings").authenticated()
            .anyMessage().authenticated()
        return messages.build()
    }
}