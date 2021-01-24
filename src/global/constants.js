export const LOADING = "LOADING"

// Exposed states of a Flow Transaction
export const IDLE = "IDLE"
export const PROCESSING = "PROCESSING"
export const SUCCESS = "SUCCESS"
export const ERROR = "ERROR"

// How long to pause on a success or error message
// before transitioning back to an IDLE state.
export const IDLE_DELAY = 1000

// // Emulator
// export const CONTRACTS = "0xf8d6e0586b0a20c7"
// export const FLOW_TOKEN_ADDRESS = "0x0ae53cb6e3f42a79"
// export const FUNGIBLE_TOKEN_ADDRESS = "0xee82856bf20e2aa6"
//
// Testnet
export const CONTRACTS = "0xfc40912427c789d2"
export const FLOW_TOKEN_ADDRESS = "0x7e60df042a9c0868"
export const FUNGIBLE_TOKEN_ADDRESS = "0x9a0766d93b6608b7"
//
export const NON_FUNGIBLE_TOKEN_ADDRESS = CONTRACTS
export const KIBBLE_ADDRESS = CONTRACTS
export const KITTY_ITEMS_ADDRESS = CONTRACTS
export const SAMPLE_MARKET_ADDRESS = CONTRACTS

export const KIBBLE_NAME = "Kibble"
export const KITTY_ITEMS_NAME = "KittyItems"

// TODO: APIから一覧取得するよう変更
// export const STORE_ADDRESS = "0xf3fcd2c1a78f5eee"
export const STORE_ADDRESS = "0xfc40912427c789d2"
