package explore.websocket

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Configuration
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.SendTo
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.stereotype.Controller
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer

@SpringBootApplication
class WebsocketApplication

fun main(args: Array<String>) {
	runApplication<WebsocketApplication>(*args)
}

@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig : WebSocketMessageBrokerConfigurer {
	override fun configureMessageBroker(registry: MessageBrokerRegistry) {
		registry.enableSimpleBroker("/topic")
		registry.setApplicationDestinationPrefixes("/app")
	}

	override fun registerStompEndpoints(registry: StompEndpointRegistry) {
		registry
			.addEndpoint("/ws")
			.setAllowedOriginPatterns("*")
	}
}

@Controller
class WebSocketController {
	@MessageMapping("/hello")
	@SendTo("/topic/greetings")
	fun greeting(message: TestMessage): Greeting {
		println(message)
		return Greeting("Hello, " + message.name + "!")
	}
}

data class TestMessage(
	val name: String
)

data class Greeting(
	val value: String
)
