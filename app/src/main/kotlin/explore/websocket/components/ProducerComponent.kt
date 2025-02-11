package explore.websocket.components

import explore.websocket.model.TestMessage
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Profile
import org.springframework.context.event.ContextRefreshedEvent
import org.springframework.context.event.EventListener
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.messaging.simp.stomp.StompHeaders
import org.springframework.messaging.simp.stomp.StompSession
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.web.socket.client.standard.StandardWebSocketClient
import org.springframework.web.socket.messaging.WebSocketStompClient
import java.lang.reflect.Type
import java.net.URI
import java.util.concurrent.atomic.AtomicBoolean

@Component
@Profile("fake-jwt")
@EnableScheduling
class ProducerComponent(private val messagingTemplate: SimpMessagingTemplate) {
//    private val logger = LoggerFactory.getLogger(ProducerComponent::class.java)
//    private val initialized = AtomicBoolean(false)

//    @EventListener(ContextRefreshedEvent::class)
//    fun onContextRefreshed() {
//        initialized.set(true)
//    }

//    @Scheduled(fixedRate = 50000)
//    fun publishTestMessage() {
//        if (initialized.get()) {
//            val message = TestMessage("Automated Test")
//            val wsProtocol = if (URI("http://localhost").scheme == "https") "wss" else "ws"
//            val brokerURL = "$wsProtocol://localhost:8080/ws"
//
//            val stompClient = WebSocketStompClient(StandardWebSocketClient())
//            val sessionHandler = object : StompSessionHandlerAdapter() {
//                override fun getPayloadType(headers: StompHeaders): Type {
//                    return String::class.java
//                }
//
//                override fun handleFrame(headers: StompHeaders, payload: Any?) {
//                    logger.info("Received: $payload")
//                }
//            }
//
//            val session: StompSession = stompClient.connectAsync(brokerURL, sessionHandler).get()
//            session.send("/app/hello", message)
//            logger.info("Published test message: $message")
//        }
//    }
}