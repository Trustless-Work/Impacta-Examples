use soroban_sdk::{contractevent, Address, Env};

use crate::types::Balance;

// Evento de depósito (topic fijo + usuario indexado).
#[contractevent(topics = ["deposited"], data_format = "vec")]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Deposited {
    #[topic]
    pub user: Address,
    pub amount: Balance,
    pub new_balance: Balance,
}

// Evento de retiro (topic fijo + usuario indexado).
#[contractevent(topics = ["withdrawn"], data_format = "vec")]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Withdrawn {
    #[topic]
    pub user: Address,
    pub amount: Balance,
    pub new_balance: Balance,
}

// Emite evento de depósito con monto y nuevo balance.
pub fn emit_deposit(env: &Env, user: &Address, amount: Balance, new_balance: Balance) {
    Deposited {
        user: user.clone(),
        amount,
        new_balance,
    }
    .publish(env);
}

// Emite evento de retiro con monto y nuevo balance.
pub fn emit_withdraw(env: &Env, user: &Address, amount: Balance, new_balance: Balance) {
    Withdrawn {
        user: user.clone(),
        amount,
        new_balance,
    }
    .publish(env);
}
