use soroban_sdk::{Address, Env};
use crate::types::{Balance, DataKey};

// Lee balance desde storage; devuelve 0 si no existe.
pub fn read_balance(env: &Env, user: &Address) -> Balance {
    let key = DataKey::Balance(user.clone());
    env.storage().persistent().get(&key).unwrap_or(0)
}

// Escribe balance persistente de un usuario.
pub fn write_balance(env: &Env, user: &Address, balance: Balance) {
    let key = DataKey::Balance(user.clone());
    env.storage().persistent().set(&key, &balance);
}

// Lee el token configurado para el vault.
pub fn read_token(env: &Env) -> Option<Address> {
    env.storage().persistent().get(&DataKey::Token)
}

// Guarda el token del vault (configuración inicial).
pub fn write_token(env: &Env, token: &Address) {
    env.storage().persistent().set(&DataKey::Token, token);
}
