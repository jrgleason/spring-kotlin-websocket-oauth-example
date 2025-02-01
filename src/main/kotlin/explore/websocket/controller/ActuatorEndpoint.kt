package explore.websocket.controller

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody

@Controller
@RequestMapping("/actuator")
class ActuatorEndpoint {
    @GetMapping
    @ResponseBody
    fun actuator(): String {
        return "Working"
    }
}