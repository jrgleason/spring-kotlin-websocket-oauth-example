package explore.websocket.controller

import org.springframework.core.env.Environment
import org.springframework.http.MediaType
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody
import java.security.Principal

@Controller
@RequestMapping("/fe")
class FrontEndController(
    private val environment: Environment
) {

    @GetMapping("/user", produces = [MediaType.APPLICATION_JSON_VALUE])
    @ResponseBody
    fun user(principal: Principal): Map<String, String> {
        return mapOf(
            "name" to principal.name
        )
    }

    @GetMapping("/global", produces = [MediaType.APPLICATION_JSON_VALUE])
    @ResponseBody
    fun general(): Map<String, String> {
        return mapOf(
            "fakeLogin" to (environment.activeProfiles.contains("fake-jwt")).toString()
        )
    }
}