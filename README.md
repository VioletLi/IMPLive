# IMPLive
This is a bidirectional programming system for incomplete imperative programs.

## Tool Instructions

### Forward Evaluation

1. Write a program in the editor. Functions are declared at the top with `func` and expanded into statements before evaluation. Expression holes are written as `_`. For example, the partitioning step of quicksort can leave the swap incomplete:

```
func partition(lo, hi)
    pivot := a[hi];
    i := lo;
    j := lo;
    while j < hi do
        if a[j] <= pivot then
            tmp := _;
            a[i] := _;
            a[j] := _;
            i := i + 1
        else
            skip
        end;
        j := j + 1
    end;
    a[hi] := a[i];
    a[i] := pivot;
    print a
end;
a := [4, 2, 6, 5, 7, 1, 3];
partition(0, a.length - 1)
```

2. Click **Input** to set the input array consumed by `read`, then **Save**. Programs that do not use `read` can skip this step.
3. Click **Eval**. The **Output** panel shows the values produced by `print`, including partially determined arrays. The **Residual** panel lists statements suspended because of holes. Select one to inspect the value environment at that point.

### Backward Evaluation

1. Edit the text in **Output**, or select a residual computation and edit a value in its **Context**. Either edit states the result the program should have produced.
2. Click **Uneval and Update**. IMPLive propagates the edit backward and fills the **Hole Bindings** table. Each row gives a hole, the environment in which it was evaluated, and the value it should produce in that environment. **Uneval and Preview** to inspect the updated program without committing it. **Revert Code** restores the program from before the preview.

### Fill-and-Resume

1. From the hole bindings and the surrounding code, decide which expression should replace a hole.
2. Click **Clear Hole-Bindings**, then **Eval** again. This restores the residual computations of the original incomplete program. Bindings produced by backward evaluation are not reused as the values of the filled expressions.
3. Click **Fill-and-Resume**, enter an expression for one or more holes, check the corresponding checkbox, and click **Save**. IMPLive substitutes those expressions into the affected residual computations and resumes them, without re-evaluating the program from the original input.
4. Repeat until the residual computations are completed and **Output** shows the full result.

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
and open the `index.html`. After the clicking the "Eval"/"Uneval and Update"/"Fill-and-Resume" button, the running time will be recorded and printed in the console.
The effeciency evaluation results are in `raw_data.xlsx`.

The fill-and-resume evaluation uses three benchmark programs, each containing three holes. For two programs, we added holes to bring the total to three and saved the modified versions in files with the suffix `-fill`. The `quick_sort` benchmark already contains three holes, so we use the original file without a separate `-fill` version.