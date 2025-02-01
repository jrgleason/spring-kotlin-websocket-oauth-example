package explore.websocket.components

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
@Profile("debug")
class RequestLoggingFilter : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        println("========= Request Debug Info =========")
        println("URI: ${request.requestURI}")
        println("Method: ${request.method}")
        println("Headers:")
        request.headerNames.asSequence().forEach { headerName ->
            println("$headerName: ${request.getHeader(headerName)}")
        }
        println("====================================")

        filterChain.doFilter(request, response)
    }
}