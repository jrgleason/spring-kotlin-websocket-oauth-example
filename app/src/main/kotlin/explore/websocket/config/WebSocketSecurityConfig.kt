package explore.websocket.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.MessageDeliveryException
import org.springframework.messaging.simp.SimpMessageType
import org.springframework.messaging.support.ChannelInterceptor
import org.springframework.security.authorization.AuthorizationManager
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity
import org.springframework.security.core.context.SecurityContextHolder
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
            .simpDestMatchers("/topic/greetings", "/app/hello").authenticated()
//            .simpDestMatchers("/topic/greetings", "/app/hello").permitAll()
            .simpDestMatchers("/topic/status", "/app/status").permitAll()
            .anyMessage().authenticated()
        return messages.build()
    }

    //    @Bean
//    fun channelInterceptor() = object : ChannelInterceptor {
//        override fun preSend(message: Message<*>, channel: MessageChannel): Message<*>? {
//            if (message.headers["simpMessageType"] == SimpMessageType.SUBSCRIBE
//                && message.headers["simpDestination"]?.toString() == "/topic/greetings") {
//
//                val authentication = SecurityContextHolder.getContext().authentication
//                if (authentication == null || !authentication.isAuthenticated) {
//                    throw MessageDeliveryException("Authentication required for greetings subscription")
//                }
//            }
//            return message
//        }
//    }
    @Bean
    fun channelInterceptor(authManager: AuthorizationManager<Message<*>>) = object : ChannelInterceptor {
        override fun preSend(message: Message<*>, channel: MessageChannel): Message<*> {
            if (message.headers["simpMessageType"] == SimpMessageType.SUBSCRIBE) {
                val authentication = SecurityContextHolder.getContext().authentication
                val authResult = authManager.authorize({ authentication }, message)
                if (authResult?.isGranted != true) {
                    throw MessageDeliveryException("Authentication required for this subscription")
                }
            }
            return message
        }
    }
}