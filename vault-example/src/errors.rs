use soroban_sdk::contracterror;

// Errores públicos del contrato Vault.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum VaultError {
    // Se intenta retirar más de lo disponible.
    InsufficientBalance = 1,
    // El monto debe ser mayor que cero.
    InvalidAmount = 2,
    // Una operación aritmética excedió límites de i128.
    Overflow = 3,
    // El token del vault aún no fue configurado.
    TokenNotConfigured = 4,
    // Evita reconfigurar el token luego de inicializar.
    AlreadyInitialized = 5,
}
