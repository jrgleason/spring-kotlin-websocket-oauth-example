package explore.websocket.components

import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.annotation.SubscribeMapping
import org.springframework.stereotype.Component

@Component
class ListenerComponent {
    private val logger = LoggerFactory.getLogger(ListenerComponent::class.java)

    @SubscribeMapping("/topic/greetings")
    fun handleGreeting(message: String) {
        logger.info("Subscriber received greeting message: $message")
    }

    @SubscribeMapping("/topic/chat")
    fun handleChat(message: String) {
        logger.info("Subscriber received chat message: $message")
    }
}