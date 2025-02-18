package explore.websocket.config

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.messaging.Message
import org.springframework.messaging.simp.SimpMessageType
import org.springframework.security.authentication.AnonymousAuthenticationToken
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authorization.AuthorizationDecision
import org.springframework.security.authorization.AuthorizationManager
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.messaging.access.intercept.MessageAuthorizationContext
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken

@Profile("secure")
@Configuration
@EnableWebSocketSecurity
class WebSocketSecurityConfig(
    private val authenticationProvider: AuthenticationProvider
) {
    private val logger: Logger = LoggerFactory.getLogger(WebSocketSecurityConfig::class.java)

    @Bean
    fun messageAuthorizationManager(
        messages: MessageMatcherDelegatingAuthorizationManager.Builder
    ): AuthorizationManager<Message<*>> {
        val tokenAuthorizationManager = AuthorizationManager<MessageAuthorizationContext<*>> { auth, context ->
            authenticateAndAuthorize(auth.get(), context.message)
        }

        messages
            .simpTypeMatchers(SimpMessageType.CONNECT, SimpMessageType.DISCONNECT).permitAll()
            .simpDestMatchers("/app/status", "/topic/status").permitAll()
            .anyMessage().access(tokenAuthorizationManager)
        return messages.build()
    }

    private fun authenticateAndAuthorize(auth: Authentication?, message: Message<*>): AuthorizationDecision {
        val nativeHeaders = message.headers["nativeHeaders"] as? Map<String, List<String>>
        val authHeader = nativeHeaders?.get("Authorization")?.firstOrNull()

        return try {
            if (auth != null && auth.isAuthenticated && auth !is AnonymousAuthenticationToken) {
                logger.debug("User already authenticated: ${auth.name}")
                AuthorizationDecision(true)
            } else if (authHeader != null && authHeader.startsWith("Bearer ")) {
                val token = authHeader.substring(7)
                val authenticatedUser = authenticationProvider.authenticate(BearerTokenAuthenticationToken(token))
                SecurityContextHolder.getContext().authentication = authenticatedUser
                logger.debug("Successfully authenticated token for user: ${authenticatedUser.name}")
                AuthorizationDecision(true)
            } else {
                logger.debug("No valid authentication found")
                AuthorizationDecision(false)
            }
        } catch (e: Exception) {
            logger.error("Authentication failed: ${e.message}", e)
            AuthorizationDecision(false)
        }
    }
}