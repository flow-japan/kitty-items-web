import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import { tx } from "./util/tx"
import { invariant } from "@onflow/util-invariant"

const CODE = fcl.cdc`
  import FungibleToken from 0xFungibleToken
  import NonFungibleToken from 0xNonFungibleToken
  import Kibble from 0xKibble
  import KittyItems from 0xKittyItems

  transaction(recipient: Address, amount: UFix64) {
      let minter: @Kibble.Minter
      let tokenReceiver: &{FungibleToken.Receiver}

      prepare(acct: AuthAccount) {
          // Setup to receive Kibbles
          if acct.borrow<&Kibble.Vault>(from: Kibble.VaultStoragePath) == nil {
              acct.save(<-Kibble.createEmptyVault(), to: Kibble.VaultStoragePath)
              acct.link<&Kibble.Vault{FungibleToken.Receiver}>(
                  Kibble.ReceiverPublicPath,
                  target: Kibble.VaultStoragePath
              )
              acct.link<&Kibble.Vault{FungibleToken.Balance}>(
                  Kibble.BalancePublicPath,
                  target: Kibble.VaultStoragePath
              )
          }

          // Setup to receive KittyItems
          if acct.borrow<&KittyItems.Collection>(from: KittyItems.CollectionStoragePath) == nil {
              let collection <- KittyItems.createEmptyCollection()
              acct.save(<-collection, to: KittyItems.CollectionStoragePath)
              acct.link<&KittyItems.Collection{NonFungibleToken.CollectionPublic, KittyItems.KittyItemsCollectionPublic}>(
                KittyItems.CollectionPublicPath,
                target: KittyItems.CollectionStoragePath
              )
          }

          self.minter <-Kibble.createNewMinter()

          self.tokenReceiver = getAccount(recipient)
              .getCapability(Kibble.ReceiverPublicPath)!
              .borrow<&{FungibleToken.Receiver}>()
              ?? panic("Unable to borrow receiver reference")
      }

      execute {
          let mintedVault <- self.minter.mintTokens(amount: amount)
          self.tokenReceiver.deposit(from: <-mintedVault)
          destroy self.minter
      }
  }
`

// prettier-ignore
export function mintKibbles({ recipient, amount }, opts = {}) {
  invariant(recipient != null, "mintKibbles({recipient, amount}) -- recipient required")
  invariant(amount != null, "mintKibbles({recipient, amount}) -- amount required")

  return tx([
    fcl.transaction(CODE),
    fcl.args([
      fcl.arg(String(recipient), t.Address),
      fcl.arg(String(amount), t.UFix64)
    ]),
    fcl.proposer(fcl.authz),
    fcl.payer(fcl.authz),
    fcl.authorizations([fcl.authz]),
    fcl.limit(1000),
  ], opts)
}
