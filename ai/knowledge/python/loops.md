# Python Loops and Iteration

## What are Loops?
Loops allow you to execute a block of code repeatedly. Python provides two primary loop constructs:
1. **`for` loop**: Used for definite iteration across a collection or range of items.
2. **`while` loop**: Used for indefinite iteration as long as a Boolean condition remains `True`.

---

## 1. The `for` Loop and `range()`
The `for` loop iterates directly over items in any iterable structure (lists, tuples, strings, dictionaries):
```python
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)
```

### Understanding `range(start, stop, step)`
The `range()` function generates an immutable arithmetic sequence of integers:
- `range(stop)`: starts at 0, increments by 1, stops at `stop - 1`.
- `range(start, stop)`: starts at `start`, increments by 1, stops at `stop - 1`.
- `range(start, stop, step)`: increments by `step`.

```python
for i in range(3):
    print(i)  # Prints 0, 1, 2 (does NOT include 3!)
```

---

## 2. Off-By-One Errors in Loops
The most common mistake when using loops is the **off-by-one error**, often caused by misunderstanding index bounds and `range()`:

### The Problem
```python
numbers = [10, 20, 30]
# len(numbers) is 3. range(len(numbers) + 1) generates 0, 1, 2, 3
for i in range(len(numbers) + 1):
    print(numbers[i])  # Fails on i=3 with IndexError: list index out of range!
```

### The Fix
Use `range(len(numbers))` or iterate over items directly:
```python
# Direct iteration (Pythonic and safe):
for num in numbers:
    print(num)

# Or with enumerate if index is needed:
for i, num in enumerate(numbers):
    print(f"Index {i} has value {num}")
```

---

## 3. The `while` Loop and Infinite Loop Pitfalls
A `while` loop repeats while its test condition remains `True`:
```python
count = 0
while count < 3:
    print(count)
    count += 1  # Crucial: update state to eventually exit
```

### Pitfall: Missing or Incorrect State Update
If the loop condition never becomes `False`, an **infinite loop** occurs:
```python
count = 0
while count < 5:
    print(count)
    # Forgot count += 1! Loop runs forever, freezing execution.
```

---

## 4. Loop Control Statements: `break` and `continue`

### `break`
Immediately terminates the innermost enclosing loop:
```python
for num in [1, 2, 3, 4, 5]:
    if num == 3:
        break  # Halts loop when num is 3
    print(num)  # Prints 1, 2
```

### `continue`
Skips the remainder of the current iteration and jumps to the next cycle:
```python
for num in [1, 2, 3, 4]:
    if num % 2 == 0:
        continue  # Skip even numbers
    print(num)  # Prints 1, 3
```

---

## 5. Loop `else` Clause
Python loops can have an optional `else` block that executes **only if the loop completes normally without hitting a `break`**:
```python
for num in [1, 3, 5]:
    if num % 2 == 0:
        break
else:
    print("No even numbers found!")  # Executes because loop finished without break
```

---

## 6. Nested Loops
A loop inside another loop executes completely for each step of the outer loop:
```python
for i in range(2):
    for j in range(2):
        print(f"({i}, {j})")
```
Be mindful of time complexity: deeply nested loops can drastically slow down programs on large datasets ($O(N^2)$ or higher).

---

## 7. Common Loop Mistakes Summary
1. Using `range(len(items) + 1)` which exceeds list bounds and causes `IndexError`.
2. Forgetting to update loop variables in `while` loops, causing infinite execution.
3. Modifying a list while iterating over it (e.g. `items.remove(x)` inside `for x in items`).
4. Using manual index loops instead of Pythonic `for item in items` or `enumerate()`.
