// prettier-ignore
import {transaction, limit, proposer, payer, authorizations, authz, cdc} from "@onflow/fcl"
import {invariant} from "@onflow/util-invariant"
import {tx} from "./util/tx"

const CODE = cdc`
  import DietKibbles from 0xDietKibbles
  import FungibleToken from 0xFungibleToken

  transaction {
    prepare(acct: AuthAccount) {
      if (!DietKibbles.hasDietKibbles(acct.address)) {
        let vault <- DietKibbles.createEmptyVault()
        acct.save(<- vault, to: DietKibbles.privatePath)
        acct.link<&{FungibleToken.Receiver, FungibleToken.Balance}>(DietKibbles.publicPath, target: DietKibbles.privatePath)
      }
    }
  }
`

export async function initializeAccount(address, opts = {}) {
  // prettier-ignore
  invariant(address != null, "Tried to initialize an account but no address was supplied")

  return tx(
    [
      transaction(CODE),
      limit(25),
      proposer(authz),
      payer(authz),
      authorizations([authz]),
    ],
    opts
  )
}
