# WebSocket OAuth Frontend

React frontend demonstrating secure WebSocket communication with OAuth/JWT authentication.

## Running the Application

```bash
npm install          # Install dependencies
npm run build:watch  # Watch and rebuild on changes
```

## Key Components

### StompClient (`StompClient.jsx`)

Reusable WebSocket client component handling connection and message management:

```javascript
const StompClient = ({title, subscribeTopic, publishTopic, onError}) => {
    // ... connection management and message handling
}
```

Features:
- Automatic reconnection
- Error handling
- Connection status display
- Message sending/receiving

### PrivateChat (`PrivateChat.jsx`)

Private messaging component built on top of STOMP client:

```javascript
const PrivateChat = () => {
    // ... private chat implementation
}
```

Features:
- User-to-user messaging
- Real-time message updates
- Connection status display
- Error handling and retry logic

## WebSocket Communication

### Connecting

```javascript
const socket = new SockJS('/ws');
const stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
        Authorization: `Bearer test.token`  // Development token
    }
});
```

### Subscribing

```javascript
stompClient.subscribe(
    `/user/${username}/chat/messages`,
    (message) => {
        // Handle incoming messages
    },
    {
        "Authorization": `Bearer test.token`
    }
);
```

### Publishing

```javascript
client.publish({
    destination: publishTopic,
    body: JSON.stringify({
        message: statusMessage,
        name: "Test Message"
    }),
    headers: {
        "Authorization": `Bearer test.token`
    }
});
```

## Component Features

### Error Handling
- Maximum retry attempts (3)
- Retry delay (2 seconds)
- Error display with retry option
- Connection status indicators

### UI Elements
- Message input with enter-to-send
- Message history display
- Connection status indicator
- Error messages with visual feedback
- Loading spinners during connection

### Styling
- Tailwind CSS for styling
- Responsive design
- Dark mode theme
- Clean, modern interface

## Development Notes

### Authentication
- Development uses fake JWT token ("test.token")
- Production should use proper OAuth tokens
- All WebSocket messages require authentication headers

### WebSocket Connection
- Uses SockJS for better browser compatibility
- Automatic reconnection on disconnection
- Connection status monitoring
- Error state management

### Message Handling
- Real-time message updates
- Message persistence in component state
- Proper message formatting
- Error handling for failed sends

## Dependencies

- React
- @stomp/stompjs
- sockjs-client
- Tailwind CSS

## Building for Production

```bash
npm run build  # Creates production build
```