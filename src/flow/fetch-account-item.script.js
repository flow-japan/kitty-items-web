import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import {batch} from "./util/batch"

const CODE = fcl.cdc`
import NonFungibleToken from 0xNonFungibleToken
import KittyItems from 0xKittyItems

pub struct Item {
  pub let id: UInt64
  pub let type: UInt64
  pub let owner: Address

  init(id: UInt64, type: UInt64, owner: Address) {
    self.id = id
    self.type = type
    self.owner = owner
  }
}

pub fun fetch(address: Address, id: UInt64): Item? {
  let cap = getAccount(address)
    .getCapability<&KittyItems.Collection{NonFungibleToken.CollectionPublic, KittyItems.KittyItemsCollectionPublic}>(KittyItems.CollectionPublicPath)!

  if let collection = cap.borrow() {
    if let item = collection.borrowKittyItem(id: id) {
      return Item(id: id, type: item.typeID, owner: address)
    } else {
      return nil
    }
  } else {
    return nil
  }
}

pub fun main(keys: [String], addresses: [Address], ids: [UInt64]): {String: Item?} {
  let r: {String: Item?} = {}
  var i = 0
  while i < keys.length {
    let key = keys[i]
    let address = addresses[i]
    let id = ids[i]
    r[key] = fetch(address: address, id: id)
    i = i + 1
  }
  return r
}
`

const collate = px => {
  return Object.keys(px).reduce(
    (acc, key) => {
      acc.keys.push(key)
      acc.addresses.push(px[key][0])
      acc.ids.push(px[key][1])
      return acc
    },
    {keys: [], addresses: [], ids: []}
  )
}

const {enqueue} = batch("FETCH_ACCOUNT_ITEM", async px => {
  const {keys, addresses, ids} = collate(px)

  return fcl
    .send([
      fcl.script(CODE),
      fcl.args([
        fcl.arg(keys, t.Array(t.String)),
        fcl.arg(addresses, t.Array(t.Address)),
        fcl.arg(ids.map(Number), t.Array(t.UInt64)),
      ]),
    ])
    .then(fcl.decode)
})

export async function fetchAccountItem(address, key) {
  if (address == null) return Promise.resolve(null)
  if (key == null) return Promise.resolve(null)
  // key example: '0xf8d6e0586b0a20c7.KittyItems.1'
  const keyArray = key.split('.')
  const id = keyArray[keyArray.length - 1]
  return enqueue(address, id)
}
