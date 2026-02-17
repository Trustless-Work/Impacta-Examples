use super::*;
use counter::CounterContract;
use soroban_sdk::testutils::Address as _;

#[test]
fn test_contract_call_increment() {
    let env = Env::default();

    // Registrar ambos contratos
    let counter_id = env.register(CounterContract, ());
    let caller_id = env.register(CallerContract, ());

    // Crear clients
    let counter_client = counter::CounterContractClient::new(&env, &counter_id);
    let caller_client = CallerContractClient::new(&env, &caller_id);

    let owner = Address::generate(&env);

    // Inicializar el contador
    counter_client.initialize(&owner, &0);

    // Llamar al contador a través del contrato Caller
    let result = caller_client.call_increment(&counter_id);
    assert_eq!(result, 1);

    // Verificar que el contador efectivamente se incrementó
    assert_eq!(counter_client.get_count(), 1);
}

#[test]
fn test_contract_call_increment_by() {
    let env = Env::default();

    let counter_id = env.register(CounterContract, ());
    let caller_id = env.register(CallerContract, ());

    let counter_client = counter::CounterContractClient::new(&env, &counter_id);
    let caller_client = CallerContractClient::new(&env, &caller_id);

    let owner = Address::generate(&env);
    counter_client.initialize(&owner, &10);

    // Incrementar por 5 a través del Caller
    let result = caller_client.call_increment_by(&counter_id, &5);
    assert_eq!(result, 15);
    assert_eq!(counter_client.get_count(), 15);
}

#[test]
fn test_get_counter_value() {
    let env = Env::default();

    let counter_id = env.register(CounterContract, ());
    let caller_id = env.register(CallerContract, ());

    let counter_client = counter::CounterContractClient::new(&env, &counter_id);
    let caller_client = CallerContractClient::new(&env, &caller_id);

    let owner = Address::generate(&env);
    counter_client.initialize(&owner, &42);

    // Leer el valor a través del Caller
    let value = caller_client.get_counter_value(&counter_id);
    assert_eq!(value, 42);
}

#[test]
fn test_increment_multiple_times() {
    let env = Env::default();

    let counter_id = env.register(CounterContract, ());
    let caller_id = env.register(CallerContract, ());

    let counter_client = counter::CounterContractClient::new(&env, &counter_id);
    let caller_client = CallerContractClient::new(&env, &caller_id);

    let owner = Address::generate(&env);
    counter_client.initialize(&owner, &0);

    // Incrementar 5 veces
    let final_value = caller_client.increment_multiple_times(&counter_id, &5);
    assert_eq!(final_value, 5);
    assert_eq!(counter_client.get_count(), 5);
}

#[test]
fn test_read_increment_read() {
    let env = Env::default();

    let counter_id = env.register(CounterContract, ());
    let caller_id = env.register(CallerContract, ());

    let counter_client = counter::CounterContractClient::new(&env, &counter_id);
    let caller_client = CallerContractClient::new(&env, &caller_id);

    let owner = Address::generate(&env);
    counter_client.initialize(&owner, &100);

    // Leer -> Incrementar -> Leer
    let (old_value, new_value) = caller_client.read_increment_read(&counter_id);
    assert_eq!(old_value, 100);
    assert_eq!(new_value, 101);
}
