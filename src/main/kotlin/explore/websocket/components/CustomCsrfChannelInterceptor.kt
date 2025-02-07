package explore.websocket.components

import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.support.ChannelInterceptor
import org.springframework.stereotype.Component

@Component("csrfChannelInterceptor")
class CustomCsrfChannelInterceptor : ChannelInterceptor {
    override fun preSend(
        message: Message<*>,
        channel: MessageChannel
    ): Message<*> {
        return message
    }
}