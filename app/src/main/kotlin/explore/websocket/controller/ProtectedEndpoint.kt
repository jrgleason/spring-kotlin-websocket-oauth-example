package explore.websocket.controller

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody

@Controller
@RequestMapping("/protected")
class ProtectedEndpoint {
    @GetMapping
    @ResponseBody
    fun actuator(): String {
        return "Working"
    }
}