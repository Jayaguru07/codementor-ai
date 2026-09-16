# Python Sequence Indexing and Slicing

## What is Indexing?
Indexing allows you to access individual elements within ordered sequence collections in Python, such as **lists**, **tuples**, and **strings**. Each element in a sequence is assigned a numerical index that specifies its exact position.

---

## 1. Zero-Based Indexing and Positive Indexes
Python uses **zero-based indexing**, meaning the first item in any sequence is at index `0`.
- The first element is at index `0`.
- The second element is at index `1`.
- The last element in a sequence of length `N` is at index `N - 1`.

For example, given a list:
```python
numbers = [10, 20, 30]
# Index 0 -> 10
# Index 1 -> 20
# Index 2 -> 30
```
Because `len(numbers)` is 3, the only valid positive indexes are 0, 1, and 2.

---

## 2. Negative Indexing
Python supports **negative indexing** to access elements from the end of the sequence without needing to calculate the length manually:
- `-1` refers to the **last** element.
- `-2` refers to the **second to last** element.
- `-N` refers to the **first** element of a sequence of length `N`.

Example:
```python
letters = ["a", "b", "c"]
print(letters[-1])  # 'c'
print(letters[-3])  # 'a'
```

---

## 3. Indexing Across Different Types

### Lists (Mutable)
Lists allow reading and modifying elements by index:
```python
items = [1, 2, 3]
items[0] = 99  # Valid: items is now [99, 2, 3]
```

### Tuples (Immutable)
Tuples support indexed retrieval, but attempting to reassign raises a `TypeError`:
```python
coordinates = (10.0, 20.0)
print(coordinates[0])  # 10.0
# coordinates[0] = 5.0 -> TypeError: 'tuple' object does not support item assignment
```

### Strings (Immutable)
Strings are sequences of individual characters:
```python
word = "Python"
print(word[0])  # 'P'
print(word[-1]) # 'n'
```

---

## 4. IndexError: list index out of range
An `IndexError` occurs whenever code attempts to access an index that does not exist in the collection.

### Common Cause: Off-By-One with List Length
Because indexing starts at `0`, an index equal to `len(collection)` is already out of bounds:
```python
numbers = [10, 20, 30]  # length is 3
print(numbers[3])       # Raises IndexError! Valid indexes are 0, 1, 2
```

### Common Cause: Accessing Empty Collections
Accessing index `0` of an empty collection immediately triggers an `IndexError`:
```python
empty_list = []
first_item = empty_list[0]  # Raises IndexError: list index out of range
```

---

## 5. Sequence Slicing vs. Direct Indexing
Slicing uses the syntax `sequence[start:stop:step]`:
- `start`: inclusive beginning index (defaults to 0).
- `stop`: exclusive ending index (element at `stop` is not included).
- `step`: step size and direction (default is 1).

Unlike direct indexing, **slicing never raises an IndexError** if bounds are exceeded; Python gracefully clamps slice boundaries:
```python
numbers = [10, 20, 30]
print(numbers[0:100])  # [10, 20, 30] (No error!)
```

---

## 6. Summary of Common Mistakes
1. Forgetting that the last valid index is `length - 1`, not `length`.
2. Using `collection[len(collection)]` instead of `collection[-1]` to get the last element.
3. Accessing elements before verifying the list is non-empty.
4. Confusing slicing (`items[0:1]` returns a list) with indexing (`items[0]` returns an element).
