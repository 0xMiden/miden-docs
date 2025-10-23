---
title: "Field Operations"
sidebar_position: 5
---

## Field operations

Miden assembly provides a set of instructions which can perform operations with raw field elements. These instructions are described in the tables below.

While most operations place no restrictions on inputs, some operations expect inputs to be binary values, and fail if executed with non-binary inputs.

For instructions where one or more operands can be provided as immediate parameters (e.g., `add` and `add.b`), we provide stack transition diagrams only for the non-immediate version. For the immediate version, it can be assumed that the operand with the specified name is not present on the stack.

### Assertions and tests

| Instruction                        | Stack_input | Stack_output | Notes                                                              |
| ---------------------------------- | ----------- | ------------ | ------------------------------------------------------------------ |
| assert <br /> - _(1 cycle)_        | [a, ...]    | [...]        | If $a = 1$, removes it from the stack. <br /> Fails if $a \ne 1$   |
| assertz <br /> - _(2 cycles)_      | [a, ...]    | [...]        | If $a = 0$, removes it from the stack, <br /> Fails if $a \ne 0$   |
| assert*eq <br /> - *(2 cycles)\_   | [b, a, ...] | [...]        | If $a = b$, removes them from the stack. <br /> Fails if $a \ne b$ |
| assert*eqw <br /> - *(11 cycles)\_ | [B, A, ...] | [...]        | If $A = B$, removes them from the stack. <br /> Fails if $A \ne B$ |

The above instructions can also be parametrized with an error message which can be specified either directly or via a [named constant](./code_organization.md#constants). For example:

```
u32assert.err="Division by zero"
u32assert.err=MY_CONSTANT
```

The message is hashed and turned into a field element. If the error code is omitted, the default value of $0$ is assumed.

### Arithmetic and Boolean operations

The arithmetic operations below are performed in a 64-bit [prime field](https://en.wikipedia.org/wiki/Finite_field) defined by modulus $p = 2^{64} - 2^{32} + 1$. This means that overflow happens after a value exceeds $p$. Also, the result of divisions may appear counter-intuitive because divisions are defined via inversions.

| Instruction                                                                         | Stack_input | Stack_output | Notes                                                                                                            |
| ----------------------------------------------------------------------------------- | ----------- | ------------ | ---------------------------------------------------------------------------------------------------------------- |
| add <br /> - _(1 cycle)_ <br /> add._b_ <br /> - _(1-2 cycle)_                      | [b, a, ...] | [c, ...]     | $c \leftarrow (a + b) \mod p$                                                                                    |
| sub <br /> - _(2 cycles)_ <br /> sub._b_ <br /> - _(2 cycles)_                      | [b, a, ...] | [c, ...]     | $c \leftarrow (a - b) \mod p$                                                                                    |
| mul <br /> - _(1 cycle)_ <br /> mul._b_ <br /> - _(2 cycles)_                       | [b, a, ...] | [c, ...]     | $c \leftarrow (a \cdot b) \mod p$                                                                                |
| div <br /> - _(2 cycles)_ <br /> div._b_ <br /> - _(2 cycles)_                      | [b, a, ...] | [c, ...]     | $c \leftarrow (a \cdot b^{-1}) \mod p$ <br /> Fails if $b = 0$                                                   |
| neg <br /> - _(1 cycle)_                                                            | [a, ...]    | [b, ...]     | $b \leftarrow -a \mod p$                                                                                         |
| inv <br /> - _(1 cycle)_                                                            | [a, ...]    | [b, ...]     | $b \leftarrow a^{-1} \mod p$ <br /> Fails if $a = 0$                                                             |
| pow2 <br /> - _(16 cycles)_                                                         | [a, ...]    | [b, ...]     | $b \leftarrow 2^a$ <br /> Fails if $a > 63$                                                                      |
| exp._uxx_ <br /> - _(9 + xx cycles)_ <br /> exp._b_ <br /> - _(9 + log2(b) cycles)_ | [b, a, ...] | [c, ...]     | $c \leftarrow a^b$ <br /> Fails if xx is outside [0, 63) <br /> exp is equivalent to exp.u64 and needs 73 cycles |
| ilog2 <br /> - _(44 cycles)_                                                        | [a, ...]    | [b, ...]     | $b \leftarrow \lfloor{log_2{a}}\rfloor$ <br /> Fails if $a = 0 $                                                 |
| not <br /> - _(1 cycle)_                                                            | [a, ...]    | [b, ...]     | $b \leftarrow 1 - a$ <br /> Fails if $a > 1$                                                                     |
| and <br /> - _(1 cycle)_                                                            | [b, a, ...] | [c, ...]     | $c \leftarrow a \cdot b$ <br /> Fails if $max(a, b) > 1$                                                         |
| or <br /> - _(1 cycle)_                                                             | [b, a, ...] | [c, ...]     | $c \leftarrow a + b - a \cdot b$ <br /> Fails if $max(a, b) > 1$                                                 |
| xor <br /> - _(7 cycles)_                                                           | [b, a, ...] | [c, ...]     | $c \leftarrow a + b - 2 \cdot a \cdot b$ <br /> Fails if $max(a, b) > 1$                                         |

### Comparison operations

| Instruction                                                      | Stack_input | Stack_output   | Notes                                                                                                                      |
| ---------------------------------------------------------------- | ----------- | -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| eq <br /> - _(1 cycle)_ <br /> eq._b_ <br /> - _(1-2 cycles)_    | [b, a, ...] | [c, ...]       | $c \leftarrow \begin{cases} 1, & \text{if}\ a=b  0, & \text{otherwise}\ \end{cases}$                                       |
| neq <br /> - _(2 cycle)_ <br /> neq._b_ <br /> - _(2-3 cycles)_  | [b, a, ...] | [c, ...]       | $c \leftarrow \begin{cases} 1, & \text{if}\ a \ne b  0, & \text{otherwise}\ \end{cases}$                                   |
| lt <br /> - _(14 cycles)_ <br /> lt._b_ <br /> - _(15 cycles)_   | [b, a, ...] | [c, ...]       | $c \leftarrow \begin{cases} 1, & \text{if}\ a < b  0, & \text{otherwise}\ \end{cases}$                                     |
| lte <br /> - _(15 cycles)_ <br /> lte._b_ <br /> - _(16 cycles)_ | [b, a, ...] | [c, ...]       | $c \leftarrow \begin{cases} 1, & \text{if}\ a \le b  0, & \text{otherwise}\ \end{cases}$                                   |
| gt <br /> - _(15 cycles)_ <br /> gt._b_ <br /> - _(16 cycles)_   | [b, a, ...] | [c, ...]       | $c \leftarrow \begin{cases} 1, & \text{if}\ a > b  0, & \text{otherwise}\ \end{cases}$                                     |
| gte <br /> - _(16 cycles)_ <br /> gte._b_ <br /> - _(17 cycles)_ | [b, a, ...] | [c, ...]       | $c \leftarrow \begin{cases} 1, & \text{if}\ a \ge b  0, & \text{otherwise}\ \end{cases}$                                   |
| is*odd <br /> - *(5 cycles)\_                                    | [a, ...]    | [b, ...]       | $b \leftarrow \begin{cases} 1, & \text{if}\ a \text{ is odd}  0, & \text{otherwise}\ \end{cases}$                          |
| eqw <br /> - _(15 cycles)_                                       | [A, B, ...] | [c, A, B, ...] | $c \leftarrow \begin{cases} 1, & \text{if}\ a_i = b_i \; \forall i \in \{0, 1, 2, 3\}  0, & \text{otherwise}\ \end{cases}$ |

### Extension Field Operations

| Instruction                           | Stack_input           | Stack_output    | Notes                                                                                                               |
| ------------------------------------- | --------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------- |
| ext2add <br /> - _(5 cycles)_ <br />  | [b1, b0, a1, a0, ...] | [c1, c0, ...]   | $c1 \leftarrow (a1 + b1) \mod p$ and <br /> $c0 \leftarrow (a0 + b0) \mod p$                                        |
| ext2sub <br /> - _(7 cycles)_ <br />  | [b1, b0, a1, a0, ...] | [c1, c0, ...]   | $c1 \leftarrow (a1 - b1) \mod p$ and <br /> $c0 \leftarrow (a0 - b0) \mod p$                                        |
| ext2mul <br /> - _(3 cycles)_ <br />  | [b1, b0, a1, a0, ...] | [c1, c0, ...]   | $c1 \leftarrow (a0 + a1) * (b0 + b1) \mod p$ and <br /> $c0 \leftarrow (a0 * b0) - 2 * (a1 * b1) \mod p$            |
| ext2neg <br /> - _(4 cycles)_ <br />  | [a1, a0, ...]         | [a1', a0', ...] | $a1' \leftarrow -a1$ and $a0' \leftarrow -a0$                                                                       |
| ext2inv <br /> - _(8 cycles)_ <br />  | [a1, a0, ...]         | [a1', a0', ...] | $a' \leftarrow a^{-1} \mod q$ <br /> Fails if $a = 0$                                                               |
| ext2div <br /> - _(11 cycles)_ <br /> | [b1, b0, a1, a0, ...] | [c1, c0,]       | $c \leftarrow a * b^{-1}$ fails if $b=0$, where multiplication and inversion are as defined by the operations above |
