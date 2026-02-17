use super::*;
use soroban_sdk::testutils::Address as _;

#[test]
fn test_counter_basic() {
    let env = Env::default();
    let contract_id = env.register(CounterContract, ());
    let client = CounterContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);

    // Inicializar
    client.initialize(&owner, &10);

    // Verificar valor inicial
    assert_eq!(client.get_count(), 10);

    // Incrementar
    let new_value = client.increment();
    assert_eq!(new_value, 11);
    assert_eq!(client.get_count(), 11);

    // Incrementar por un valor
    let new_value = client.increment_by(&5);
    assert_eq!(new_value, 16);
}

#[test]
fn test_reset() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(CounterContract, ());
    let client = CounterContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);

    client.initialize(&owner, &100);
    client.increment();
    
    assert_eq!(client.get_count(), 101);

    // Reset por el owner
    client.reset(&owner);
    assert_eq!(client.get_count(), 0);
}

#[test]
#[should_panic(expected = "Contract already initialized")]
fn test_cannot_initialize_twice() {
    let env = Env::default();
    let contract_id = env.register(CounterContract, ());
    let client = CounterContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);

    client.initialize(&owner, &10);
    client.initialize(&owner, &20); // Debe fallar
}
