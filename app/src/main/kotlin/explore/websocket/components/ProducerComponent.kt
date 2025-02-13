package explore.websocket.components

//@Component
//@Profile("fake-jwt")
//@EnableScheduling
//class ProducerComponent(private val messagingTemplate: SimpMessagingTemplate) {
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
//}