import {config} from "@onflow/fcl"
import {
  CONTRACTS,
  FLOW_TOKEN_ADDRESS,
  FUNGIBLE_TOKEN_ADDRESS,
  NON_FUNGIBLE_TOKEN_ADDRESS,
  KIBBLE_ADDRESS,
  KITTY_ITEMS_ADDRESS,
  SAMPLE_MARKET_ADDRESS
} from "../global/constants"

config()
  .put("env", "testnet")
  .put("accessNode.api", "https://access-testnet.onflow.org")
  .put("challenge.handshake", "https://fcl-discovery.vercel.app/testnet/authn")
  // .put("accessNode.api", "http://localhost:8080")
  // .put("challenge.handshake", "http://localhost:8701/flow/authenticate")
  .put("0xFlowToken", FLOW_TOKEN_ADDRESS)
  .put("0xFungibleToken", FUNGIBLE_TOKEN_ADDRESS)
  .put("0xNonFungibleToken", NON_FUNGIBLE_TOKEN_ADDRESS)
  .put("0xKibble", KIBBLE_ADDRESS)
  .put("0xSampleMarket", SAMPLE_MARKET_ADDRESS)
  .put("0xKittyItems", KITTY_ITEMS_ADDRESS)
