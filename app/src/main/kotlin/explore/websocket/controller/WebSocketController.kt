package explore.websocket.controller

import explore.websocket.model.Greeting
import explore.websocket.model.TestMessage
import org.slf4j.LoggerFactory
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.messaging.handler.annotation.SendTo
import org.springframework.messaging.simp.annotation.SendToUser
import org.springframework.stereotype.Controller
import java.security.Principal

@Controller
class WebSocketController {
    private val logger = LoggerFactory.getLogger(WebSocketController::class.java)

    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    fun greeting(message: TestMessage): Greeting {
        logger.info(message.toString())
        return Greeting("Hello, " + message.name + "!")
    }

    @MessageMapping("/status")
    @SendTo("/topic/status")
    fun status(message: TestMessage): String {
        return "Status: ${message.message}"
    }

    @MessageMapping("/private-message")
    @SendToUser("/queue/messages")
    fun addUser(
        @Payload chatMessage: String,
        principal: Principal
    ): String {
        logger.info("Received message: $chatMessage from user: ${principal.name}")
        return "Hello, ${principal.name}! You sent: $chatMessage"
    }
}