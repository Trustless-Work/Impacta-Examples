use soroban_sdk::{token::TokenClient, Address, Env};
use soroban_token_sdk::TokenUtils;

use crate::errors::VaultError;

// Helpers para interactuar con el token SEP-41 configurado.
fn token_client<'a>(env: &'a Env, token: &'a Address) -> TokenClient<'a> {
    TokenClient::new(env, token)
}

// Mueve tokens del usuario hacia el vault.
pub fn transfer_into_vault(env: &Env, token: &Address, from_user: &Address, amount: i128) {
    let _token_utils = TokenUtils::new(env);
    let vault_address = env.current_contract_address();
    token_client(env, token).transfer(from_user, &vault_address, &amount);
}

// Mueve tokens del vault hacia el usuario.
pub fn transfer_out_of_vault(env: &Env, token: &Address, to_user: &Address, amount: i128) {
    let _token_utils = TokenUtils::new(env);
    let vault_address = env.current_contract_address();
    token_client(env, token).transfer(&vault_address, to_user, &amount);
}

// Garantiza que el token exista antes de operar.
pub fn require_token_configured(token: Option<Address>) -> Result<Address, VaultError> {
    token.ok_or(VaultError::TokenNotConfigured)
}
