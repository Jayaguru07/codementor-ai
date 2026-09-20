# Python Variables, Data Types, and Memory Concepts

## What is a Variable?
In Python, a variable is not a fixed memory container with a predefined type; instead, it is a **symbolic name (or label) that points to an object stored in memory**.

---

## 1. Assignment and Reference Binding
Variables are created at the moment you first assign a value to them using the `=` operator:
```python
x = 10
```
Here, the integer object `10` is allocated in memory, and the identifier `x` references that object. If you reassign `x = "hello"`, `x` now points to a new string object.

---

## 2. Core Built-In Data Types
Python provides several fundamental data types:
- **Integers (`int`)**: Whole numbers (`42`, `-7`).
- **Floating-point (`float`)**: Real numbers with decimal points (`3.14`, `-0.01`).
- **Strings (`str`)**: Sequences of characters enclosed in quotes (`"hello"`).
- **Booleans (`bool`)**: Logical truth values (`True`, `False`).
- **Lists (`list`)**: Ordered, mutable collections (`[1, 2, 3]`).
- **Tuples (`tuple`)**: Ordered, immutable collections (`(1, 2, 3)`).
- **Dictionaries (`dict`)**: Key-value mappings (`{"name": "Alice", "age": 20}`).
- **Sets (`set`)**: Unordered collections of unique elements (`{1, 2, 3}`).

---

## 3. Mutable vs. Immutable Objects
Understanding the difference between mutable and immutable types is critical in Python:

### Immutable Types (`int`, `float`, `str`, `tuple`, `bool`)
Their values **cannot be altered in place**. Any operation that seems to modify them creates a brand-new object in memory:
```python
s = "cat"
# s[0] = "b" -> Raises TypeError: 'str' object does not support item assignment
s = "b" + s[1:]  # Creates a new string "bat"
```

### Mutable Types (`list`, `dict`, `set`)
Their contents **can be modified in place** without changing the object's identity in memory:
```python
numbers = [1, 2, 3]
numbers.append(4)  # Modifies numbers directly: [1, 2, 3, 4]
```

### Pitfall: Aliasing and Shared References
When two variables point to the same mutable object, mutating one affects both:
```python
a = [1, 2, 3]
b = a          # b references the exact same list
b.append(99)
print(a)       # [1, 2, 3, 99]! (a was also modified)

# Solution: Create an independent copy
b = a.copy()
```

---

## 4. The `None` Value
`None` is a special constant in Python used to signify the absence of a value or an empty state. It is of type `NoneType`.
```python
result = None
if result is None:
    print("No result available yet.")
```
> **Best Practice**: Always check for `None` using identity comparison (`if x is None:`) rather than equality (`if x == None:`).

---

## 5. Variable Naming Rules and Conventions (PEP 8)
- **Rules**:
  - Must start with a letter (`a-z`, `A-Z`) or an underscore (`_`).
  - Cannot start with a digit.
  - Can only contain alphanumeric characters and underscores (`a-z, A-Z, 0-9, _`).
  - Cannot use Python reserved keywords (`if`, `for`, `def`, `class`, `import`, etc.).
  - Variable names are **case-sensitive** (`Score` and `score` are different).
- **PEP 8 Conventions**:
  - Use `snake_case` for variable and function names (`student_count`, `max_score`).
  - Use `UPPER_SNAKE_CASE` for global constants (`MAX_CONNECTIONS = 100`).
  - Use meaningful, descriptive names rather than single letters (e.g. `user_age` instead of `a`).

---

## 6. Common Variable Mistakes Summary
1. **`NameError: name 'x' is not defined`**: Using a variable before assigning a value to it or misspelling the variable name.
2. **Accidental Aliasing**: Assigning one list to another (`b = a`) and expecting changes to `b` not to affect `a`.
3. **Shadowing Built-in Functions**: Naming a variable `list`, `str`, `min`, or `id`, which overwrites the built-in function for the rest of the scope.
4. **Case Mismatches**: Assigning `count = 10` but attempting to access `Count`.
