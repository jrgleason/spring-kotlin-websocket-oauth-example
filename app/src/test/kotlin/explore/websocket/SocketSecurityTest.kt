package explore.websocket

import com.fasterxml.jackson.databind.ObjectMapper
import explore.websocket.model.TestMessage
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.http.HttpHeaders
import org.springframework.messaging.converter.MappingJackson2MessageConverter
import org.springframework.messaging.converter.StringMessageConverter
import org.springframework.messaging.simp.stomp.StompFrameHandler
import org.springframework.messaging.simp.stomp.StompHeaders
import org.springframework.messaging.simp.stomp.StompSession
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter
import org.springframework.test.context.ActiveProfiles
import org.springframework.web.socket.WebSocketHttpHeaders
import org.springframework.web.socket.client.WebSocketClient
import org.springframework.web.socket.client.standard.StandardWebSocketClient
import org.springframework.web.socket.messaging.WebSocketStompClient
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("fake-jwt", "secure")
class WebSocketControllerTest {
    val client: WebSocketClient = StandardWebSocketClient()

    @LocalServerPort
    private var port: Int = 0

    @Test
    fun testGreeting() {
        val stompClient = WebSocketStompClient(client)
        stompClient.messageConverter = MappingJackson2MessageConverter()

        val receivedMessages = mutableListOf<String>()
        val latch = CountDownLatch(1)

        val sessionHandler = object : StompSessionHandlerAdapter() {
            override fun afterConnected(session: StompSession, connectedHeaders: StompHeaders) {
                session.subscribe("/topic/greetings", object : StompFrameHandler {
                    override fun getPayloadType(headers: StompHeaders): Class<*> {
                        return ByteArray::class.java
                    }

                    override fun handleFrame(headers: StompHeaders, payload: Any?) {
                        if (payload is ByteArray) {
                            val message = String(payload)
                            receivedMessages.add(message)
                            latch.countDown()
                        } else {
                            println("Unexpected payload: $payload")
                        }
                    }
                })

                session.send("/app/hello", TestMessage("Alice"))
            }
        }

        val headers = WebSocketHttpHeaders().apply {
            add(HttpHeaders.AUTHORIZATION, "Bearer test.token")
        }

        stompClient.connectAsync(
            "ws://localhost:$port/ws",
            headers,
            sessionHandler
        )

        latch.await(5, TimeUnit.SECONDS)

        assertFalse(receivedMessages.isEmpty())
        assertEquals("{\"value\":\"Hello, Alice!\"}", receivedMessages.first())
    }

    @Test
    fun testStatusWithoutToken() {
        val stompClient = WebSocketStompClient(StandardWebSocketClient())
        stompClient.messageConverter = StringMessageConverter()

        val receivedMessages = mutableListOf<String>()
        val latch = CountDownLatch(1)

        // Authenticated client to listen to /topic/chat
        val authSessionHandler = object : StompSessionHandlerAdapter() {
            override fun afterConnected(session: StompSession, connectedHeaders: StompHeaders) {
                session.subscribe("/topic/chat", object : StompFrameHandler {
                    override fun getPayloadType(headers: StompHeaders): Class<*> {
                        return String::class.java
                    }

                    override fun handleFrame(headers: StompHeaders, payload: Any?) {
                        if (payload is String) {
                            println("Received message: $payload")
                            receivedMessages.add(payload)
                            latch.countDown()
                        } else {
                            println("Unexpected payload: $payload")
                        }
                    }
                })
            }
        }

        val authHeaders = WebSocketHttpHeaders().apply {
            add(HttpHeaders.AUTHORIZATION, "Bearer test.token")
        }

        stompClient.connectAsync(
            "ws://localhost:$port/ws",
            authHeaders,
            authSessionHandler
        )

        // Unauthenticated client to send /app/status message
        val unauthSessionHandler = object : StompSessionHandlerAdapter() {
            override fun afterConnected(session: StompSession, connectedHeaders: StompHeaders) {
                println("Sending status message")
                session.send("/app/status", "Test status")
            }
        }

        stompClient.connectAsync(
            "ws://localhost:$port/ws",
            unauthSessionHandler
        )

        latch.await(5, TimeUnit.SECONDS)

        assertFalse(receivedMessages.isEmpty())
        assertEquals("Status: Test status", receivedMessages.first())
    }

    @Test
    fun testStatusWithoutTokenBoth() {
        val stompClient = WebSocketStompClient(StandardWebSocketClient())
        stompClient.messageConverter = StringMessageConverter()

        val receivedMessages = mutableListOf<String>()
        val latch = CountDownLatch(1)

        val sessionHandler = object : StompSessionHandlerAdapter() {
            override fun afterConnected(session: StompSession, connectedHeaders: StompHeaders) {
                session.subscribe("/topic/chat", object : StompFrameHandler {
                    override fun getPayloadType(headers: StompHeaders): Class<*> {
                        return String::class.java
                    }

                    override fun handleFrame(headers: StompHeaders, payload: Any?) {
                        if (payload is String) {
                            println("Received message: $payload")
                            receivedMessages.add(payload)
                            latch.countDown()
                        } else {
                            println("Unexpected payload: $payload")
                        }
                    }
                })

                println("Sending status message")
                session.send("/app/status", "Test status")
            }
        }

        stompClient.connectAsync(
            "ws://localhost:$port/ws",
            sessionHandler
        )

        latch.await(5, TimeUnit.SECONDS)

        assertTrue(receivedMessages.isEmpty())
    }

    @Test
    fun testGreetingWithoutToken() {
        val stompClient = WebSocketStompClient(client)
        stompClient.messageConverter = MappingJackson2MessageConverter()

        val receivedMessages = mutableListOf<String>()
        val latch = CountDownLatch(1)

        val sessionHandler = object : StompSessionHandlerAdapter() {
            override fun afterConnected(session: StompSession, connectedHeaders: StompHeaders) {
                session.subscribe("/topic/greetings", object : StompFrameHandler {
                    override fun getPayloadType(headers: StompHeaders): Class<*> {
                        return ByteArray::class.java
                    }

                    override fun handleFrame(headers: StompHeaders, payload: Any?) {
                        if (payload is ByteArray) {
                            val message = String(payload)
                            receivedMessages.add(message)
                            latch.countDown()
                        } else {
                            println("Unexpected payload: $payload")
                        }
                    }
                })

                session.send("/app/hello", TestMessage("Alice"))
            }
        }

        stompClient.connectAsync(
            "ws://localhost:$port/ws",
            sessionHandler
        )

        latch.await(5, TimeUnit.SECONDS)

        assertTrue(receivedMessages.isEmpty())
    }
}