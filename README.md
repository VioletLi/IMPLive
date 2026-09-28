# IMPLive
This is a bidirectional programming system for incomplete imperative programs.

## Tool Instructions
### Initial Incomplete Programs
1. In the editor on the left, write a program based on the syntax mentioned in the paper

   - Hole: `_` (underscore)
   - Lambda Expression: `\x=>x+1`
   - Function Call: `(\x=>x) 3`
   - List Construction: `1::2::[]` (or, `[1,2]`)
   - Tuple: `(1,2)`
   - Let-Binding: `let a = 1 in a`
   - Letrec-Binding: `letrec f = ... in ...`
   - If Conditional: `If x==y then ... else ...`
   - Case Expression: `case x==y of true=>...|false=>...|...`
2. Click "Eval" Button to see the output

### Direct Manipulate on Output/Context
1. Modify the text in the **Output** window
2. Modify the values in the **Context** window

    - Click hole values to jump to its closure
3. Click **Uneval and Preview** Button
    - To see the preview of the code changes
    - Click **Revert Code** to revert to the original code
4. Click **Uneval and Update** Button
    - Make sure the updated code and cannot retract

### Others
**Clear Hole-Bindings** Button: To clear the bindings of holes in the programs

## Usage
- git clone
- click index.html

## Develop
```bash
elm make src/Main.elm --output=elm.js
```

## Evaluation
The examples are in the folder `examples`. To evaluate the running time, use the command
```bash
elm make src/Main.elm --output=elm.js
node patch_timing.js
```