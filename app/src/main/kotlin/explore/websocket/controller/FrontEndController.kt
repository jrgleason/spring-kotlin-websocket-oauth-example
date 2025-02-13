package explore.websocket.controller

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody
import java.security.Principal

@Controller
@RequestMapping("/fe")
class FrontEndController {

    @GetMapping("/user")
    @ResponseBody
    fun user(principal: Principal): Map<String, String> {
        val response = mutableMapOf<String, String>()
        response["name"] = principal.name
        return response
    }
}