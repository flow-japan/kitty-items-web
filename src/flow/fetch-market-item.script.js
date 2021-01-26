import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
// import {batch} from "./util/batch"

// const CODE = fcl.cdc`
//   import SampleMarket from 0xfcceff21d9532b58

//   pub struct Item {
//     pub let id: UInt64
//     pub let isCompleted: Bool
//     pub let price: UFix64
//     pub let owner: Address

//     init(id: UInt64, isCompleted: Bool, price: UFix64, owner: Address) {
//       self.id = id
//       self.isCompleted = isCompleted
//       self.price = price
//       self.owner: owner
//     }
//   }

//   pub fun fetch(address: Address, id: UInt64): Item? {
//     let cap = getAccount(address)
//       .getCapability<&SampleMarket.Collection{SampleMarket.CollectionPublic}>(SampleMarket.CollectionPublicPath)!

//     if let collection = cap.borrow() {
//       // this currently throws as the collection.borrowSaleItem returns a non-optional resource
//       if let item = collection.borrowSaleItem(saleItemID: id) {
//         return Item(id: id, isCompleted: item.saleCompleted, price: item.salePrice, owner: address)
//       } else {
//         return nil
//       }
//     } else {
//       return nil
//     }
//   }

//   pub fun main(keys: [String], addresses: [Address], ids: [UInt64]): {String: Item?} {
//     let r: {String: Item?} = {}
//     var i = 0
//     while i < keys.length {
//       let key = keys[i]
//       let address = addresses[i]
//       let id = ids[i]
//       r[key] = fetch(address: address, id: id)
//       i = i + i
//     }
//     return r
//   }
// `

// const collate = px => {
//   return Object.keys(px).reduce(
//     (acc, key) => {
//       acc.keys.push(key)
//       acc.addresses.push(px[key][0])
//       acc.ids.push(px[key][1])
//       return acc
//     },
//     {keys: [], addresses: [], ids: []}
//   )
// }

// const {enqueue} = batch("FETCH_MARKET_ITEM", async px => {
//   const {keys, addresses, ids} = collate(px)

//   // prettier-ignore
//   return fcl.send([
//         fcl.script(CODE),
//         fcl.args([
//           fcl.arg(keys, t.Array(t.String)),
//           fcl.arg(addresses, t.Array(t.Address)),
//           fcl.arg(ids.map(Number), t.Array(t.UInt64)),
//         ]),
//     ]).then(fcl.decode)
// })

// export async function fetchMarketItem(address, id) {
//   if (address == null) return Promise.resolve(null)
//   if (id == null) return Promise.resolve(null)
//   return enqueue(address, id)
// }

export async function fetchMarketItem(address, key) {
  const [itemTokenAddress, itemTokenName, id] = key.split('.')

  return fcl
    .send([
      fcl.script`
      import SampleMarket from 0xSampleMarket

      pub struct Item {
        pub let itemTokenAddress: Address
        pub let itemTokenName: String
        pub let id: UInt64
        pub let isCompleted: Bool
        pub let price: UFix64
        pub let paymentTokenAddress: Address
        pub let paymentTokenName: String
        pub let owner: Address

        init(
          itemTokenAddress: Address,
          itemTokenName: String,
          id: UInt64,
          isCompleted: Bool,
          price: UFix64,
          paymentTokenAddress: Address,
          paymentTokenName: String,
          owner: Address
        ) {
          self.itemTokenAddress = itemTokenAddress
          self.itemTokenName = itemTokenName
          self.id = id
          self.isCompleted = isCompleted
          self.price = price
          self.paymentTokenAddress = paymentTokenAddress
          self.paymentTokenName = paymentTokenName
          self.owner = owner
        }
      }

      pub fun main(address: Address, itemTokenAddress: Address, itemTokenName: String, id: UInt64): Item? {
        let cap = getAccount(address)
          .getCapability<&SampleMarket.Collection{SampleMarket.CollectionPublic}>(SampleMarket.CollectionPublicPath)!

        if let collection = cap.borrow() {
          let item = collection.borrowSaleItem(
            saleItemTokenAddress: itemTokenAddress,
            saleItemTokenName: itemTokenName,
            saleItemID: id
          )
          return Item(
            itemTokenAddress: itemTokenAddress,
            itemTokenName: itemTokenName,
            id: id,
            isCompleted: item.saleCompleted,
            price: item.salePrice,
            paymentTokenAddress: item.salePaymentTokenAddress,
            paymentTokenName: item.salePaymentTokenName,
            owner: address
          )
        } else {
          return nil
        }
      }
    `,
      fcl.args([
        fcl.arg(address, t.Address),
        fcl.arg(itemTokenAddress, t.Address),
        fcl.arg(itemTokenName, t.String),
        fcl.arg(Number(id), t.UInt64)
      ]),
    ])
    .then(fcl.decode)
}
