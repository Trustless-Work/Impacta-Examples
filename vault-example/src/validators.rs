use crate::errors::VaultError;
use crate::types::Balance;

// Valida reglas básicas de monto reutilizables.
pub fn require_valid_amount(amount: Balance) -> Result<(), VaultError> {
    if amount <= 0 {
        return Err(VaultError::InvalidAmount);
    }

    Ok(())
}