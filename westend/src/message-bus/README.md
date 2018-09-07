# MessageBus

The message bus allows you to subscribe to a topic by name to broadcast and
receive messages on that topic. A message sent on a topic will be received by
all subscribes on the same topic.

For now it should be assumed that messages might be serialized to string so
only JSON.stringify()-able messages should be sent.

## Usage

See demo.
