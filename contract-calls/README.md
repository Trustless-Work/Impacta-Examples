# Guía Práctica de Contract Calls en Soroban

## Contract Calls en Soroban

Este proyecto demuestra cómo dos contratos inteligentes en Soroban pueden comunicarse entre sí mediante **contract calls**.

## Estructura del Proyecto

```
contract-calls/
├── contracts/
│   ├── counter/       # Contrato que mantiene un contador
│   │   ├── src/
│   │   │   └── lib.rs
│   │   └── Cargo.toml
│   └── caller/        # Contrato que llama al Counter
│       ├── src/
│       │   └── lib.rs
│       └── Cargo.toml
├── Cargo.toml         # Workspace configuration
└── README.md
```

## ¿Qué son los Contract Calls?

Los **contract calls** permiten que un contrato inteligente invoque funciones de otro contrato. Esto es fundamental para:
- Crear arquitecturas modulares
- Reutilizar lógica existente
- Implementar patrones como proxy, factory, etc.

## Estructura de los Contratos

### Counter Contract (contracts/counter/)
Este es el contrato "servidor" que será llamado por otro contrato.

**Funciones principales:**
- `initialize()` - Inicializa el estado
- `increment()` - Incrementa el contador
- `get_count()` - Lee el valor actual

### Caller Contract (contracts/caller/)
Este es el contrato "cliente" que realiza llamadas al Counter Contract.

**Funciones principales:**
- `call_increment()` - Llama a increment del Counter
- `get_counter_value()` - Lee el valor del Counter
- `increment_multiple_times()` - Múltiples llamadas

## Conceptos Clave

### 1. Definir una Interface

Para llamar a otro contrato, primero defines su interface usando el macro `contractclient`:

```rust
#[contractclient(name = "CounterClient")]
pub trait CounterInterface {
    fn increment(env: Env) -> u32;
    fn get_count(env: Env) -> u32;
}
```

**¿Qué hace esto?**
- El macro `contractclient` genera automáticamente un client (`CounterClient`)
- Este client te permite llamar a las funciones del contrato remoto

### 2. Crear un Client del Contrato Remoto

```rust
let counter_client = CounterClient::new(&env, &counter_contract_address);
```

**Parámetros:**
- `env` - El environment del contrato actual
- `counter_contract_address` - La dirección del contrato que quieres llamar

### 3. Invocar Funciones del Contrato Remoto

```rust
let new_value = counter_client.increment();
```

**¡Eso es todo!** Es tan simple como llamar a una función normal.

## Ejemplos Prácticos

### Ejemplo 1: Llamada Simple

```rust
pub fn call_increment(env: Env, counter_contract: Address) -> u32 {
    // 1. Crear el client del contrato remoto
    let counter_client = CounterClient::new(&env, &counter_contract);
    
    // 2. Llamar a la función increment del contrato remoto
    let new_value = counter_client.increment();
    
    // 3. Devolver el resultado
    new_value
}
```

**Flujo:**
1. El contrato Caller crea un client para Counter
2. Llama a `increment()` del Counter
3. Counter ejecuta la función y devuelve el nuevo valor
4. Caller recibe el resultado

### Ejemplo 2: Llamada con Parámetros

```rust
pub fn call_increment_by(env: Env, counter_contract: Address, amount: u32) -> u32 {
    let counter_client = CounterClient::new(&env, &counter_contract);
    
    // Llamar con un parámetro
    let new_value = counter_client.increment_by(&amount);
    
    new_value
}
```

**Nota:** Los parámetros se pasan como referencias (`&amount`)

### Ejemplo 3: Múltiples Llamadas

```rust
pub fn increment_multiple_times(
    env: Env,
    counter_contract: Address,
    times: u32,
) -> u32 {
    let counter_client = CounterClient::new(&env, &counter_contract);
    
    let mut final_value = 0;
    for _ in 0..times {
        // Cada iteración hace una nueva llamada al contrato remoto
        final_value = counter_client.increment();
    }
    
    final_value
}
```

**Importante:** Cada llamada a `increment()` es una invocación separada al contrato remoto.

### Ejemplo 4: Leer y Escribir

```rust
pub fn read_increment_read(env: Env, counter_contract: Address) -> (u32, u32) {
    let counter_client = CounterClient::new(&env, &counter_contract);
    
    // Primera lectura
    let old_value = counter_client.get_count();
    
    // Modificación
    counter_client.increment();
    
    // Segunda lectura
    let new_value = counter_client.get_count();
    
    (old_value, new_value)
}
```

## Cómo Probar

### Ejecutar Tests

```bash
# Todos los tests
cargo test

# Solo Counter
cargo test -p counter

# Solo Caller
cargo test -p caller

# Un test específico
cargo test test_contract_call_increment
```

### Ver Logs

Para ver los logs de los contratos durante los tests:

```bash
cargo test -- --nocapture
```

## Análisis de un Test Completo

```rust
#[test]
fn test_contract_call_increment() {
    let env = Env::default();

    // 1. Registrar ambos contratos en el entorno de prueba
    let counter_id = env.register(CounterContract, ());
    let caller_id = env.register(CallerContract, ());

    // 2. Crear clients para ambos contratos
    let counter_client = counter::CounterContractClient::new(&env, &counter_id);
    let caller_client = CallerContractClient::new(&env, &caller_id);

    let owner = Address::generate(&env);

    // 3. Inicializar el contador
    counter_client.initialize(&owner, &0);

    // 4. Llamar al contador a través del contrato Caller
    let result = caller_client.call_increment(&counter_id);
    assert_eq!(result, 1);

    // 5. Verificar que el contador efectivamente se incrementó
    assert_eq!(counter_client.get_count(), 1);
}
```

**¿Qué está pasando?**
1. Creamos un entorno de prueba simulado
2. Registramos ambos contratos
3. Inicializamos el Counter
4. Usamos Caller para llamar a Counter
5. Verificamos que la llamada funcionó

## Consideraciones Importantes

### Costos
- Cada contract call consume recursos (gas)
- Múltiples llamadas = más costo
- Considera agrupar operaciones si es posible

### Errores
Si el contrato llamado falla (panic), tu contrato también fallará:

```rust
// Si counter.increment() falla, call_increment también falla
pub fn call_increment(env: Env, counter_contract: Address) -> u32 {
    let counter_client = CounterClient::new(&env, &counter_contract);
    counter_client.increment() // Si esto falla, propagamos el error
}
```

### Direcciones
Siempre verifica que la dirección del contrato sea válida:

```rust
// En producción, podrías querer validar la dirección
pub fn call_increment(env: Env, counter_contract: Address) -> u32 {
    // Validación (opcional)
    // ...
    
    let counter_client = CounterClient::new(&env, &counter_contract);
    counter_client.increment()
}
```
