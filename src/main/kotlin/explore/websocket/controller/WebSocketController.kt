package explore.websocket.controller

import explore.websocket.model.Greeting
import explore.websocket.model.TestMessage
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.SendTo
import org.springframework.stereotype.Controller

@Controller
class WebSocketController {
    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    fun greeting(message: TestMessage): Greeting {
        println(message)
        return Greeting("Hello, " + message.name + "!")
    }
}