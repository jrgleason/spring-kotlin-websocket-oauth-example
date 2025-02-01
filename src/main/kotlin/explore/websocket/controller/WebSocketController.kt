package explore.websocket.controller

import explore.websocket.model.Greeting
import explore.websocket.model.TestMessage
import org.slf4j.LoggerFactory
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.SendTo
import org.springframework.stereotype.Controller

@Controller
class WebSocketController {
    private val logger = LoggerFactory.getLogger(WebSocketController::class.java)

    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    fun greeting(message: TestMessage): Greeting {
        logger.info(message.toString())
        return Greeting("Hello, " + message.name + "!")
    }
}