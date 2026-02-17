#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, log, symbol_short, Address, Env, Symbol};

// Clave para almacenar el contador en el storage
const COUNTER: Symbol = symbol_short!("COUNTER");

#[contracttype]
#[derive(Clone)]
pub struct CounterState {
    pub value: u32,
    pub owner: Address,
}

#[contract]
pub struct CounterContract;

#[contractimpl]
impl CounterContract {
    /// Inicializa el contador con un valor inicial
    pub fn initialize(env: Env, owner: Address, initial_value: u32) {
        // Verificar que no esté ya inicializado
        if env.storage().instance().has(&COUNTER) {
            panic!("Contract already initialized");
        }

        let state = CounterState {
            value: initial_value,
            owner: owner.clone(),
        };

        env.storage().instance().set(&COUNTER, &state);
        
        log!(
            &env,
            "Counter initialized with value: {} by owner: {:?}",
            initial_value,
            owner
        );
    }

    /// Incrementa el contador en 1
    pub fn increment(env: Env) -> u32 {
        let mut state: CounterState = env
            .storage()
            .instance()
            .get(&COUNTER)
            .expect("Counter not initialized");

        state.value += 1;
        env.storage().instance().set(&COUNTER, &state);

        log!(&env, "Counter incremented to: {}", state.value);
        state.value
    }

    /// Incrementa el contador por un valor específico
    pub fn increment_by(env: Env, amount: u32) -> u32 {
        let mut state: CounterState = env
            .storage()
            .instance()
            .get(&COUNTER)
            .expect("Counter not initialized");

        state.value += amount;
        env.storage().instance().set(&COUNTER, &state);

        log!(&env, "Counter incremented by {} to: {}", amount, state.value);
        state.value
    }

    /// Obtiene el valor actual del contador
    pub fn get_count(env: Env) -> u32 {
        let state: CounterState = env
            .storage()
            .instance()
            .get(&COUNTER)
            .expect("Counter not initialized");

        state.value
    }

    /// Reinicia el contador a cero (solo el owner puede hacerlo)
    pub fn reset(env: Env, caller: Address) {
        caller.require_auth();

        let mut state: CounterState = env
            .storage()
            .instance()
            .get(&COUNTER)
            .expect("Counter not initialized");

        // Verificar que el caller sea el owner
        if caller != state.owner {
            panic!("Only owner can reset the counter");
        }

        state.value = 0;
        env.storage().instance().set(&COUNTER, &state);

        log!(&env, "Counter reset to 0");
    }

    /// Obtiene el estado completo del contador
    pub fn get_state(env: Env) -> CounterState {
        env.storage()
            .instance()
            .get(&COUNTER)
            .expect("Counter not initialized")
    }
}

#[cfg(test)]
mod tests;
