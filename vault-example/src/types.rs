use soroban_sdk::{Address, contracttype};

// Alias didáctico para expresar intención del dominio.
pub type Balance = i128;

// Claves persistentes del contrato.
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Balance(Address),
    Token,
}