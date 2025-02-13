# Spring Kotlin WebSocket OAuth Example

This project demonstrates how to implement secure WebSocket communication using Spring Boot, Kotlin, and OAuth/JWT authentication. It includes both a working example with fake JWT tokens for development and a proper secure configuration for production use.

## Building and Running

Backend:
```bash
./gradlew bootRun --args='--spring.profiles.active=fake-jwt'  # For development
./gradlew bootRun  # For production
```

Frontend:
```bash
npm run build:watch  # Watches for changes and rebuilds the UI
```

## Features

- WebSocket communication using STOMP protocol
- OAuth/JWT authentication integration
- Support for private messaging channels
- Development mode with fake JWT tokens
- Production-ready secure configuration

## Project Structure

### Security Configuration

The project includes two security configurations:

1. Development Mode (`FakeJwtConfig.kt`):
  - Provides a fake JWT decoder for development and testing
  - Uses a hardcoded token ("test.token") for easy testing
  - Automatically adds basic claims (sub, iat, exp)

2. Production Mode (`SecurityConfig.kt`):
  - Configures OAuth2 resource server
  - Handles JWT validation
  - Secures specific endpoints while leaving WebSocket endpoints accessible

### WebSocket Configuration

The WebSocket setup includes:

- STOMP message broker configuration
- User destination prefixes for private messaging
- SockJS fallback support
- Security interceptors for message authentication

## Setup and Configuration

### Development Mode

To run the application in development mode with fake JWT tokens:

1. Enable the `fake-jwt` profile:
   ```yaml
   spring:
     profiles:
       active: fake-jwt
   ```

2. Use the test token in your client:
   ```javascript
   const stompClient = new Client({
     connectHeaders: {
       Authorization: 'Bearer test.token'
     }
   });
   ```

### Production Mode

For production deployment:

1. Configure your OAuth provider details in `application.yml`:
   ```yaml
   spring:
     security:
       oauth2:
         resourceserver:
           jwt:
             issuer-uri: your-oauth-server-url
   ```

2. Remove the `fake-jwt` profile from active profiles

## Usage Examples

### Connecting to WebSocket

```javascript
const socket = new SockJS('/ws');
const stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {Authorization: `Bearer your-token`}
});
```

### Subscribing to Private Messages

```javascript
stompClient.subscribe(
    `/user/${username}/chat/messages`,
    (message) => {
        console.log(message.body);
    },
    {
        "Authorization": `Bearer your-token`
    }
);
```

### Sending Messages

```javascript
stompClient.publish({
    destination: '/app/private-message',
    body: message,
    headers: {
        "Authorization": `Bearer your-token`
    }
});
```

## Security Considerations

- The `SecurityConfig` class configures the application as an OAuth2 resource server
- WebSocket messages are authenticated using JWT tokens
- Channel interceptors ensure proper user principal propagation
- Endpoints under `/protected/**` and `/fe/**` require authentication
- Public endpoints remain accessible for WebSocket connections

## Development Notes

- The fake JWT configuration should only be used for development and testing
- The `SecurityConfig` provides a basic security setup that should be enhanced based on your specific requirements
- WebSocket connections are configured to use SockJS for better browser compatibility

## Dependencies

- Spring Boot
- Spring Security
- Spring WebSocket
- Kotlin
- SockJS
- STOMP