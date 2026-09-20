# Python Exception Handling

## What are Exceptions?
An **exception** is an event detected during program execution that disrupts the normal flow of instructions. Unlike syntax errors (which prevent code from parsing), exceptions occur at runtime when valid syntax encounters an illegal operation.

---

## 1. Exception Handling Blocks: `try`, `except`, `else`, `finally`

Python provides a structured mechanism to catch and handle runtime errors gracefully:

```python
try:
    # Code that might cause an error
    number = int("123")
    result = 10 / number
except ZeroDivisionError:
    # Handled if division by zero occurs
    print("Cannot divide by zero!")
except ValueError:
    # Handled if text cannot be converted to integer
    print("Invalid integer conversion!")
else:
    # Runs ONLY if NO exception was raised in the try block
    print(f"Success! Result is {result}")
finally:
    # Runs UNCONDITIONALLY (cleanup code, closing files/connections)
    print("Execution completed.")
```

---

## 2. The `raise` Statement
You can trigger exceptions manually using `raise`:
```python
def check_age(age: int):
    if age < 0:
        raise ValueError("Age cannot be negative!")
    return age
```

---

## 3. Common Standard Exceptions in Python

### `IndexError`
Raised when a sequence subscript is out of range:
```python
items = [1, 2]
print(items[5])  # IndexError: list index out of range
```

### `KeyError`
Raised when a dictionary key is not found:
```python
user = {"name": "Alice"}
print(user["age"])  # KeyError: 'age'
# Fix: user.get("age", default_value) or check "age" in user
```

### `TypeError`
Raised when an operation or function is applied to an inappropriate object type:
```python
total = "10" + 5  # TypeError: can only concatenate str (not "int") to str
# Fix: int("10") + 5 or "10" + str(5)
```

### `ValueError`
Raised when an operation receives an argument that has the right type but inappropriate value:
```python
val = int("hello")  # ValueError: invalid literal for int() with base 10: 'hello'
```

### `NameError`
Raised when attempting to access a variable or function that has not been defined:
```python
x = 10
print(y)  # NameError: name 'y' is not defined
```

### `ZeroDivisionError`
Raised when the second argument of a division or modulo operation is zero:
```python
result = 10 / 0  # ZeroDivisionError: division by zero
```

### `AttributeError`
Raised when an attribute reference or method call fails for an object type:
```python
text = "hello"
text.append("!")  # AttributeError: 'str' object has no attribute 'append'
# Strings are immutable; use concatenation instead: text + "!"
```

---

## 4. Best Practices in Exception Handling
1. **Be Specific**: Always catch exact exceptions (`except ValueError:`) instead of bare `except:`, which catches system exit and keyboard interrupts.
2. **Do Not Silence Errors Silently**: Avoid `except Exception: pass` without logging or explaining why.
3. **Use `finally` for Resource Cleanup**: Close files, release locks, and close network sockets in a `finally` block or use context managers (`with open(...) as f:`).
