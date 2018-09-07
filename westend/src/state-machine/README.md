# State Machine

This module implements a finite state machine (FSM) that can run code on
transitions and thus act as a state manager for apps.

The state machine is modelled after [UML2 state
diagrams](https://www.sparxsystems.com.au/resources/uml2_tutorial/uml2_statediagram.html).
It’s a finite state machine where transitions have guards and effects.

Each node has a set of transitions to other node. A transition is called
_available_ if it originates from the current node and all guards evaluate to
`true`.

When a trigger is emitted using `emitTrigger(trigger, payload)`, the engine
looks for an available transition that can be triggered by the given trigger.
If there’s exactly one such transition, the state machine assumes that
transition’s target node. If there’s more than one such transition an error is
thrown.

If, after the state machine has transitioned to a new node, there is an
available transition that has `NoTrigger`, that transition will be taken
immediately. This process will continue until the state machine _settles_.

UML2 also defines concurrent executions as well as nested state machines. This
implementation does not have support for those yet.

## Usage

See demo.
