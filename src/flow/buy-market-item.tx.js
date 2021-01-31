import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import {tx} from "./util/tx"
import {invariant} from "@onflow/util-invariant"

const CODE = fcl.cdc`
  import FungibleToken from 0xFungibleToken
  import NonFungibleToken from 0xNonFungibleToken
  import Kibble from 0xKibble
  import FlowToken from 0xFlowToken
  import KittyItems from 0xKittyItems
  import SampleMarket from 0xSampleMarket

  transaction(saleItemTokenAddress: Address, saleItemTokenName: String, saleItemID: UInt64, marketCollectionAddress: Address) {
      let paymentVault: @FungibleToken.Vault
      let kittyItemsCollection: &KittyItems.Collection{NonFungibleToken.Receiver}
      let marketCollection: &SampleMarket.Collection{SampleMarket.CollectionPublic}

      prepare(acct: AuthAccount) {
          self.marketCollection = getAccount(marketCollectionAddress)
              .getCapability<&SampleMarket.Collection{SampleMarket.CollectionPublic}>(
                  SampleMarket.CollectionPublicPath
              )!
              .borrow()
              ?? panic("Could not borrow market collection from market address")

          let saleItem = self.marketCollection.borrowSaleItem(
              saleItemTokenAddress: saleItemTokenAddress,
              saleItemTokenName: saleItemTokenName,
              saleItemID: saleItemID
          )
          let price = saleItem.salePrice
          let salePaymentTokenName = saleItem.salePaymentTokenName

          if salePaymentTokenName == "Kibble" {
              let paymentVault = acct.borrow<&Kibble.Vault>(from: Kibble.VaultStoragePath)
                  ?? panic("Cannot borrow Kibble vault from acct storage")
              self.paymentVault <- paymentVault.withdraw(amount: price)
          } else {
              let paymentVault = acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
                  ?? panic("Cannot borrow FlowToken vault from acct storage")
              self.paymentVault <- paymentVault.withdraw(amount: price)
          }

          self.kittyItemsCollection = acct.borrow<&KittyItems.Collection{NonFungibleToken.Receiver}>(
              from: KittyItems.CollectionStoragePath
          ) ?? panic("Cannot borrow KittyItems collection receiver from acct")
      }

      execute {
          self.marketCollection.purchase(
              saleItemTokenAddress: saleItemTokenAddress,
              saleItemTokenName: saleItemTokenName,
              saleItemID: saleItemID,
              buyerCollection: self.kittyItemsCollection,
              buyerPayment: <- self.paymentVault
          )
      }
  }
`

// prettier-ignore
export function buyMarketItem({
  itemTokenAddress,
  itemTokenName,
  itemId,
  ownerAddress
}, opts = {}) {
  invariant(itemTokenAddress != null, "buyMarketItem() -- itemTokenAddress required")
  invariant(itemTokenName != null, "buyMarketItem() -- itemTokenName required")
  invariant(itemId != null, "buyMarketItem() -- itemId required")
  invariant(ownerAddress != null, "buyMarketItem() -- ownerAddress required")

  return tx([
    fcl.transaction(CODE),
    fcl.args([
      fcl.arg(String(itemTokenAddress), t.Address),
      fcl.arg(String(itemTokenName), t.String),
      fcl.arg(Number(itemId), t.UInt64),
      fcl.arg(String(ownerAddress), t.Address),
    ]),
    fcl.proposer(fcl.authz),
    fcl.payer(fcl.authz),
    fcl.authorizations([fcl.authz]),
    fcl.limit(1000),
  ], opts)
}
