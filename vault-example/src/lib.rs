#![no_std]
// Módulo raíz pequeño: solo declaración de módulos y exports públicos.
pub mod contract;
pub mod errors;
pub mod events;
pub mod storage;
pub mod token_bridge;
pub mod types;
pub mod validators;
pub mod math;

pub use contract::{VaultContract, VaultContractClient};
pub use errors::VaultError;
