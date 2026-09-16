# Python Functions and Modularity

## What are Functions?
A function is a reusable block of code that takes inputs, performs specific logic, and optionally returns outputs. Functions promote modularity, eliminate repetitive code (the DRY principle: Don't Repeat Yourself), and simplify testing and maintenance.

---

## 1. Defining and Calling Functions
Use the `def` keyword followed by the function name, parentheses for parameters, and a colon:
```python
def greet(name: str) -> str:
    """Returns a greeting message for the specified name."""
    return f"Hello, {name}!"

message = greet("World")  # Function call
print(message)            # "Hello, World!"
```

---

## 2. Parameters vs. Arguments
- **Parameters**: The variable names listed inside the parentheses in the function **definition**.
- **Arguments**: The real values passed into the function when it is **invoked**.

```python
def add(a, b):  # 'a' and 'b' are parameters
    return a + b

add(3, 5)       # 3 and 5 are arguments
```

---

## 3. Positional vs. Keyword Arguments
- **Positional arguments**: Passed by location/order.
- **Keyword arguments**: Passed with explicit parameter names (`name=value`).

```python
def divide(dividend, divisor):
    return dividend / divisor

# Positional (order matters):
print(divide(10, 2))  # 5.0

# Keyword (order does not matter):
print(divide(divisor=2, dividend=10))  # 5.0
```

---

## 4. Default Parameter Values
Parameters can have default fallback values. Default parameters must always appear **after** parameters without defaults:
```python
def power(base, exponent=2):
    return base ** exponent

print(power(4))     # 16 (uses default exponent=2)
print(power(4, 3))  # 64 (overrides default)
```

> **Warning**: Never use mutable objects (like lists `[]` or dicts `{}`) as default parameter values because they are shared across all calls. Use `None` instead.

---

## 5. The `return` Statement
- Terminates function execution immediately and sends the value back to the caller.
- Functions without an explicit `return` statement return `None` by default.
- Multiple values can be returned separated by commas, which Python bundles as a `tuple`:
```python
def get_min_max(numbers):
    return min(numbers), max(numbers)

low, high = get_min_max([1, 5, 2, 9])
```

---

## 6. Variable Scope: The LEGB Rule
Variable names are resolved in order using the **LEGB rule**:
1. **L - Local**: Variables defined inside the current function.
2. **E - Enclosing**: Variables defined in outer enclosing functions (closures).
3. **G - Global**: Variables defined at the top level of the module/script.
4. **B - Built-in**: Pre-assigned names provided by Python (`len`, `range`, `print`).

```python
total = 100  # Global scope

def compute():
    step = 5  # Local scope to compute()
    return total + step
```

Attempting to modify a global variable inside a function without `global` or accessing a local variable before assignment triggers an `UnboundLocalError`.

---

## 7. Common Function Mistakes Summary
1. Forgetting the `return` statement, causing the caller to receive `None`.
2. Placing default arguments before non-default arguments (`def f(a=1, b):` causes a SyntaxError).
3. Using mutable default arguments like `def append_item(item, target_list=[]):`.
4. Calling functions with missing required positional arguments (`TypeError: missing required positional argument`).
5. Confusing function definition (`def foo():`) with function execution (`foo()`).
