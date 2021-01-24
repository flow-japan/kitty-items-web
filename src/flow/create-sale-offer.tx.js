import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import {tx} from "./util/tx"

const CODE = fcl.cdc`
  import FungibleToken from 0xFungibleToken
  import NonFungibleToken from 0xNonFungibleToken
  import Kibble from 0xKibble
  import FlowToken from 0xFlowToken
  import KittyItems from 0xKittyItems
  import SampleMarket from 0xSampleMarket

  transaction(
    saleItemTokenAddress: Address,
    saleItemTokenName: String,
    saleItemID: UInt64,
    salePaymentTokenAddress: Address,
    salePaymentTokenName: String,
    saleItemPrice: UFix64
  ) {
    let market: &SampleMarket.Collection
    let sellerPaymentReceiver: Capability<&AnyResource{FungibleToken.Receiver}>
    let itemProvider: Capability<&AnyResource{NonFungibleToken.Provider}>

    prepare(acct: AuthAccount) {
      self.market = acct.borrow<&SampleMarket.Collection>(from: SampleMarket.CollectionStoragePath) ?? panic("Need the marketplace resouce")

      if salePaymentTokenName == "Kibble" {
        self.sellerPaymentReceiver = acct.getCapability<&Kibble.Vault{FungibleToken.Receiver}>(Kibble.ReceiverPublicPath)!
      } else {
        self.sellerPaymentReceiver = acct.getCapability<&FlowToken.Vault{FungibleToken.Receiver}>(/public/flowTokenReceiver)!
      }

      let providerPath = /private/KittyItemsCollectionProvider
      acct.unlink(providerPath)

      if !acct.getCapability<&KittyItems.Collection{NonFungibleToken.Provider}>(providerPath)!.check() {
        acct.link<&KittyItems.Collection{NonFungibleToken.Provider}>(providerPath, target: KittyItems.CollectionStoragePath)
      }

      // if saleItemTokenName == "KittyItems" {
        self.itemProvider = acct.getCapability<&KittyItems.Collection{NonFungibleToken.Provider}>(providerPath)!
        assert(self.itemProvider.borrow() != nil, message: "Missing or mis-typed KittyItemsCollection provider")
      // } else {
      //   ...
      // }
    }

    execute {
      let offer <- SampleMarket.createSaleOffer (
        saleItemTokenAddress: saleItemTokenAddress,
        saleItemTokenName: saleItemTokenName,
        saleItemID: saleItemID,
        sellerItemProvider: self.itemProvider,
        salePaymentTokenAddress: salePaymentTokenAddress,
        salePaymentTokenName: salePaymentTokenName,
        salePrice: saleItemPrice,
        sellerPaymentReceiver: self.sellerPaymentReceiver
      )

      self.market.insert(offer: <-offer)
    }
  }
`

export function createSaleOffer({
  itemTokenAddress,
  itemTokenName,
  itemId,
  paymentTokenAddress,
  paymentTokenName,
  price
}, opts = {}) {
  if (itemId == null) throw new Error("createSaleOffer() -- itemId required")
  if (price == null) throw new Error("createSaleOffer() -- price required")

  // prettier-ignore
  return tx([
    fcl.transaction(CODE),
    fcl.args([
      fcl.arg(String(itemTokenAddress), t.Address),
      fcl.arg(String(itemTokenName), t.String),
      fcl.arg(Number(itemId), t.UInt64),
      fcl.arg(String(paymentTokenAddress), t.Address),
      fcl.arg(String(paymentTokenName), t.String),
      fcl.arg(String(price), t.UFix64),
    ]),
    fcl.proposer(fcl.authz),
    fcl.payer(fcl.authz),
    fcl.authorizations([
      fcl.authz
    ]),
    fcl.limit(1000)
  ], opts)
}
