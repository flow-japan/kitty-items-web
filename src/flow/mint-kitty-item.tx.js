import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import { tx } from "./util/tx"
import { invariant } from "@onflow/util-invariant"

const CODE = fcl.cdc`
  import NonFungibleToken from 0xNonFungibleToken
  import KittyItems from 0xKittyItems

  transaction(recipient: Address, typeID: UInt64) {
      let minter: @KittyItems.NFTMinter

      prepare(signer: AuthAccount) {
          self.minter <- KittyItems.createNewMinter()
      }

      execute {
          // Get the public account object for the recipient
          let recipient = getAccount(recipient)

          // Borrow the recipient's public NFT collection reference
          let receiver = recipient
              .getCapability(KittyItems.CollectionPublicPath)!
              .borrow<&{NonFungibleToken.CollectionPublic}>()
              ?? panic("Could not get receiver reference to the NFT Collection")

          // Mint the NFT and deposit it to the recipient's collection
          self.minter.mintNFT(recipient: receiver, typeID: typeID)

          destroy self.minter
      }
  }
`

// prettier-ignore
export function mintKittyItem({ recipient, typeID }, opts = {}) {
  invariant(recipient != null, "mintKibbles({recipient, typeID}) -- recipient required")
  invariant(typeID != null, "mintKibbles({recipient, typeID}) -- typeID required")

  return tx([
    fcl.transaction(CODE),
    fcl.args([
      fcl.arg(String(recipient), t.Address),
      fcl.arg(Number(typeID), t.UInt64)
    ]),
    fcl.proposer(fcl.authz),
    fcl.payer(fcl.authz),
    fcl.authorizations([fcl.authz]),
    fcl.limit(1000),
  ], opts)
}
