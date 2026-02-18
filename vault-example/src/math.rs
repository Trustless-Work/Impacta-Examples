use crate::{VaultError, types::Balance};

// Suma segura para evitar overflow de i128.
pub fn checked_add_balance(current_balance: Balance, amount: Balance) -> Result<Balance, VaultError> {
    current_balance.checked_add(amount).ok_or(VaultError::Overflow)
}

// Resta segura para evitar underflow/overflow.
pub fn checked_sub_balance(current_balance: Balance, amount: Balance) -> Result<Balance, VaultError> {
    current_balance.checked_sub(amount).ok_or(VaultError::Overflow)
}