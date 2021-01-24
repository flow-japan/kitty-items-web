import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import {tx} from "./util/tx"
import {invariant} from "@onflow/util-invariant"

const CODE = fcl.cdc`
  import SampleMarket from 0xSampleMarket

  transaction(
    saleItemTokenAddress: Address,
    saleItemTokenName: String,
    saleItemID: UInt64
  ) {
      prepare(account: AuthAccount) {
          let listing <- account
            .borrow<&SampleMarket.Collection>(from: SampleMarket.CollectionStoragePath)!
            .remove(
              saleItemTokenAddress: saleItemTokenAddress,
              saleItemTokenName: saleItemTokenName,
              saleItemID: saleItemID
            )
          destroy listing
      }
  }
`

// prettier-ignore
export function cancelMarketListing({ itemTokenAddress, itemTokenName, itemId }, opts = {}) {
  invariant(itemTokenAddress != null, "cancelMarketListing() -- itemTokenAddress required")
  invariant(itemTokenName != null, "cancelMarketListing() -- itemTokenName required")
  invariant(itemId != null, "cancelMarketListing() -- itemId required")

  return tx([
    fcl.transaction(CODE),
    fcl.args([
      fcl.arg(String(itemTokenAddress), t.Address),
      fcl.arg(String(itemTokenName), t.String),
      fcl.arg(Number(itemId), t.UInt64)
    ]),
    fcl.proposer(fcl.authz),
    fcl.payer(fcl.authz),
    fcl.authorizations([fcl.authz]),
    fcl.limit(1000),
  ], opts)
}
