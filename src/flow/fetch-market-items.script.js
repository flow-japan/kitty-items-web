import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"

const CODE = fcl.cdc`
  import SampleMarket from 0xSampleMarket

  pub fun main(address: Address): [String] {
    let cap = getAccount(address)
      .getCapability<&SampleMarket.Collection{SampleMarket.CollectionPublic}>(SampleMarket.CollectionPublicPath)!

    if let col = cap.borrow() {
      return col.getSaleOfferKeys()
    } else {
      return []
    }
  }
`

export function fetchMarketItems(address) {
  if (address == null) return Promise.resolve([])

  // prettier-ignore
  return fcl.send([
    fcl.script(CODE),
    fcl.args([
      fcl.arg(address, t.Address)
    ])
  ]).then(fcl.decode).then(d => d.sort((a, b) => Number(a.split('.')[2]) - Number(b.split('.')[2])))
}
