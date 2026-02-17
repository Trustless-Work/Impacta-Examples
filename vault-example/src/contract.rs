use soroban_sdk::{contract, contractimpl, Address, Env};

use crate::errors::VaultError;
use crate::events::{emit_deposit, emit_withdraw};
use crate::math::{checked_add_balance, checked_sub_balance};
use crate::storage::{read_balance, read_token, write_balance, write_token};
use crate::token_bridge::{require_token_configured, transfer_into_vault, transfer_out_of_vault};
use crate::validators::require_valid_amount;

// Contrato principal: orquesta reglas y delega helpers.
#[contract]
pub struct VaultContract;

#[contractimpl]
impl VaultContract {
    // Configura el token que manejará el vault. Solo se permite una vez.
    pub fn initialize(env: Env, token: Address) -> Result<(), VaultError> {
        if read_token(&env).is_some() {
            return Err(VaultError::AlreadyInitialized);
        }

        write_token(&env, &token);
        Ok(())
    }

    // Aumenta el balance de un usuario validando monto y autorización.
    pub fn deposit(env: Env, user: Address, amount: i128) -> Result<(), VaultError> {
        require_valid_amount(amount)?;
        user.require_auth();

        let token = require_token_configured(read_token(&env))?;

        let current_balance = read_balance(&env, &user);
        let updated_balance = checked_add_balance(current_balance, amount)?;

        transfer_into_vault(&env, &token, &user, amount);
        write_balance(&env, &user, updated_balance);
        emit_deposit(&env, &user, amount, updated_balance);

        Ok(())
    }

    // Reduce el balance de un usuario si hay fondos suficientes.
    pub fn withdraw(env: Env, user: Address, amount: i128) -> Result<(), VaultError> {
        require_valid_amount(amount)?;

        let token = require_token_configured(read_token(&env))?;

        let current_balance = read_balance(&env, &user);
        if current_balance < amount {
            return Err(VaultError::InsufficientBalance);
        }

        user.require_auth();

        let updated_balance = checked_sub_balance(current_balance, amount)?;

        transfer_out_of_vault(&env, &token, &user, amount);
        write_balance(&env, &user, updated_balance);
        emit_withdraw(&env, &user, amount, updated_balance);

        Ok(())
    }

    // Consulta el balance actual; si no existe registro, devuelve 0.
    pub fn balance_of(env: Env, user: Address) -> i128 {
        read_balance(&env, &user)
    }
}
