#![no_std]
use soroban_sdk::{contract, contractimpl, contractclient, log, Address, Env};

#[contract]
pub struct CallerContract;

// Interface del contrato Counter que vamos a llamar
// El macro contractclient genera automáticamente el client
#[contractclient(name = "CounterClient")]
pub trait CounterInterface {
    fn initialize(env: Env, owner: Address, initial_value: u32);
    fn increment(env: Env) -> u32;
    fn increment_by(env: Env, amount: u32) -> u32;
    fn get_count(env: Env) -> u32;
}

#[contractimpl]
impl CallerContract {
    /// Llama al contrato Counter para incrementar su valor
    /// Este es un ejemplo básico de contract call
    pub fn call_increment(env: Env, counter_contract: Address) -> u32 {
        log!(&env, "Calling counter contract to increment...");

        // Creamos un client del contrato Counter usando su dirección
        let counter_client = CounterClient::new(&env, &counter_contract);

        // Llamamos a la función increment del contrato Counter
        let new_value = counter_client.increment();

        log!(&env, "Counter incremented to: {}", new_value);
        new_value
    }

    /// Llama al contrato Counter para incrementar por un valor específico
    pub fn call_increment_by(env: Env, counter_contract: Address, amount: u32) -> u32 {
        log!(
            &env,
            "Calling counter contract to increment by: {}",
            amount
        );

        let counter_client = CounterClient::new(&env, &counter_contract);
        let new_value = counter_client.increment_by(&amount);

        log!(&env, "Counter incremented to: {}", new_value);
        new_value
    }

    /// Obtiene el valor actual del contador llamando al otro contrato
    pub fn get_counter_value(env: Env, counter_contract: Address) -> u32 {
        log!(&env, "Getting counter value from counter contract...");

        let counter_client = CounterClient::new(&env, &counter_contract);
        let value = counter_client.get_count();

        log!(&env, "Current counter value: {}", value);
        value
    }

    /// Ejemplo de múltiples llamadas a otro contrato
    /// Incrementa el contador varias veces y devuelve el valor final
    pub fn increment_multiple_times(
        env: Env,
        counter_contract: Address,
        times: u32,
    ) -> u32 {
        log!(
            &env,
            "Incrementing counter {} times via contract calls...",
            times
        );

        let counter_client = CounterClient::new(&env, &counter_contract);

        let mut final_value = 0;
        for i in 0..times {
            final_value = counter_client.increment();
            log!(&env, "Increment #{}: value is now {}", i + 1, final_value);
        }

        log!(&env, "All increments completed. Final value: {}", final_value);
        final_value
    }

    /// Ejemplo de operación compuesta:
    /// 1. Lee el valor actual
    /// 2. Lo incrementa
    /// 3. Lee el nuevo valor
    /// 4. Devuelve ambos valores
    pub fn read_increment_read(env: Env, counter_contract: Address) -> (u32, u32) {
        let counter_client = CounterClient::new(&env, &counter_contract);

        // Primera lectura
        let old_value = counter_client.get_count();
        log!(&env, "Old value: {}", old_value);

        // Incremento
        counter_client.increment();

        // Segunda lectura
        let new_value = counter_client.get_count();
        log!(&env, "New value: {}", new_value);

        (old_value, new_value)
    }
}

#[cfg(test)]
mod tests;
