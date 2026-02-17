# Vault Example (Soroban)

Contrato inteligente educativo en `soroban_sdk` que implementa un vault simple con:

- `deposit(user, amount)`
- `withdraw(user, amount)`
- `balance_of(user)`

## Características

- **Storage persistente:** `Address -> i128`
- **Eventos:**
  - `deposited` (topic)
  - `withdrawn` (topic)
- **Errores tipados:**
  - `InsufficientBalance`
  - `InvalidAmount`
- **Buenas prácticas aplicadas:**
  - Validación de monto en función reusable
  - Autenticación con `require_auth()`
  - Helpers privados para lectura/escritura en storage
  - Tests unitarios para casos felices y de error

## Estructura

- `src/lib.rs`: contrato, errores, storage, eventos y pruebas.
- `Cargo.toml`: configuración del crate y dependencias de Soroban.

## Ejecutar pruebas

```bash
cargo test
```

## Notas didácticas

1. `deposit` y `withdraw` piden autorización del `user`.
2. `balance_of` devuelve `0` si la cuenta no tiene registro en storage.
3. Los eventos se publican con:
   - topics: `(symbol, user)`
   - data: `(amount, new_balance)`
