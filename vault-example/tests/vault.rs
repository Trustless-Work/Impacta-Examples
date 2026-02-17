use soroban_sdk::{token::StellarAssetClient, token::TokenClient, testutils::Address as _, Address, Env};
use vault_example::{VaultContract, VaultContractClient, VaultError};

fn create_contract(env: &Env) -> VaultContractClient<'_> {
    let contract_id = env.register(VaultContract, ());
    VaultContractClient::new(env, &contract_id)
}

fn create_token(env: &Env) -> (Address, TokenClient<'_>, StellarAssetClient<'_>) {
    let token_admin = Address::generate(env);
    let sac = env.register_stellar_asset_contract_v2(token_admin);
    let token_address = sac.address();
    let token_client = TokenClient::new(env, &token_address);
    let asset_admin_client = StellarAssetClient::new(env, &token_address);

    (token_address, token_client, asset_admin_client)
}

fn create_user(env: &Env) -> Address {
    Address::generate(env)
}

fn create_auth_env() -> Env {
    let env = Env::default();
    env.mock_all_auths();
    env
}

#[test]
fn deposit_updates_balance() {
    let env = create_auth_env();
    let client = create_contract(&env);
    let (token_address, token_client, token_admin_client) = create_token(&env);
    let user = create_user(&env);

    client.initialize(&token_address);
    token_admin_client.mint(&user, &1_000);

    client.deposit(&user, &100);

    let balance = client.balance_of(&user);
    assert_eq!(balance, 100);
    assert_eq!(token_client.balance(&user), 900);
    assert_eq!(token_client.balance(&client.address), 100);
}

#[test]
fn withdraw_updates_balance() {
    let env = create_auth_env();
    let client = create_contract(&env);
    let (token_address, token_client, token_admin_client) = create_token(&env);
    let user = create_user(&env);

    client.initialize(&token_address);
    token_admin_client.mint(&user, &1_000);

    client.deposit(&user, &150);
    client.withdraw(&user, &40);

    let balance = client.balance_of(&user);
    assert_eq!(balance, 110);
    assert_eq!(token_client.balance(&user), 890);
    assert_eq!(token_client.balance(&client.address), 110);
}

#[test]
fn balance_defaults_to_zero() {
    let env = Env::default();
    let contract_id = env.register(VaultContract, ());
    let client = VaultContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let balance = client.balance_of(&user);

    assert_eq!(balance, 0);
}

#[test]
fn deposit_rejects_invalid_amount() {
    let env = create_auth_env();
    let client = create_contract(&env);
    let (token_address, _token_client, _token_admin_client) = create_token(&env);
    let user = create_user(&env);

    client.initialize(&token_address);

    let result = client.try_deposit(&user, &0);

    assert_eq!(result, Err(Ok(VaultError::InvalidAmount)));
}

#[test]
fn withdraw_rejects_invalid_amount() {
    let env = create_auth_env();
    let client = create_contract(&env);
    let (token_address, _token_client, _token_admin_client) = create_token(&env);
    let user = create_user(&env);

    client.initialize(&token_address);

    let result = client.try_withdraw(&user, &-10);

    assert_eq!(result, Err(Ok(VaultError::InvalidAmount)));
}

#[test]
fn withdraw_rejects_insufficient_balance() {
    let env = create_auth_env();
    let client = create_contract(&env);
    let (token_address, _token_client, token_admin_client) = create_token(&env);
    let user = create_user(&env);

    client.initialize(&token_address);
    token_admin_client.mint(&user, &20);

    client.deposit(&user, &20);

    let result = client.try_withdraw(&user, &25);
    assert_eq!(result, Err(Ok(VaultError::InsufficientBalance)));
}

#[test]
fn deposit_rejects_overflow_when_balance_is_max_i128() {
    let env = create_auth_env();
    let client = create_contract(&env);
    let (token_address, _token_client, token_admin_client) = create_token(&env);
    let user = create_user(&env);

    client.initialize(&token_address);
    token_admin_client.mint(&user, &i128::MAX);

    client.deposit(&user, &i128::MAX);

    token_admin_client.mint(&user, &1);

    let result = client.try_deposit(&user, &1);
    assert_eq!(result, Err(Ok(VaultError::Overflow)));
}

#[test]
fn deposit_rejects_when_token_not_initialized() {
    let env = create_auth_env();
    let client = create_contract(&env);
    let user = create_user(&env);

    let result = client.try_deposit(&user, &10);
    assert_eq!(result, Err(Ok(VaultError::TokenNotConfigured)));
}
