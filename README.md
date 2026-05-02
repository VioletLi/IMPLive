# LazyBiEval

```
elm repl
import Test exposing (..)

testId <id>
testAll

elm make src/Ui/Main.elm --output=ui/elm.js
```

To use the preclude examples,
```
elm reactor
```
Sometimes, it will say "elm: Network.Socket.bind: resource busy (Address already in use)"
- Solution 1: kill the process
- Solution 2: run ```elm reactor --port=<NewPort>```
