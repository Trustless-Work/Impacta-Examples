use crate::{VaultError, types::Balance};

// Suma segura para evitar overflow de i128.
pub fn checked_add_balance(left: Balance, right: Balance) -> Result<Balance, VaultError> {
    left.checked_add(right).ok_or(VaultError::Overflow)
}

// Resta segura para evitar underflow/overflow.
pub fn checked_sub_balance(left: Balance, right: Balance) -> Result<Balance, VaultError> {
    left.checked_sub(right).ok_or(VaultError::Overflow)
}