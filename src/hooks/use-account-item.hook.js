import {config, sansPrefix} from "@onflow/fcl"
import {atomFamily, selectorFamily, useRecoilState} from "recoil"
import {useCurrentUser} from "../hooks/use-current-user.hook"
import {fetchAccountItem} from "../flow/fetch-account-item.script"
import {createSaleOffer} from "../flow/create-sale-offer.tx"
import {IDLE, PROCESSING, KIBBLE_ADDRESS, KIBBLE_NAME} from "../global/constants"
import {useAccountItems} from "../hooks/use-account-items.hook"
import {useMarketItems} from "../hooks/use-market-items.hook"

function expand(key) {
  return key.split("|")
}

function comp(address, id) {
  return [address, id].join("|")
}

export const $state = atomFamily({
  key: "account-item::state",
  default: selectorFamily({
    key: "account-item::default",
    get: key => async () => fetchAccountItem(...expand(key)),
  }),
})

export const $status = atomFamily({
  key: "account-item::status",
  default: IDLE,
})

export function useAccountItem(address, key) {
  const [cu] = useCurrentUser()
  const accountItems = useAccountItems(address)
  const marketItems = useMarketItems(address)
  const stateKey = comp(address, key)
  const [item, setItem] = useRecoilState($state(stateKey))
  const [status, setStatus] = useRecoilState($status(stateKey))

  const [itemTokenAddress, itemTokenName, itemId] = key.split('.')

  return {
    ...item,
    status,
    forSale: marketItems.has(itemId),
    owned: sansPrefix(cu.addr) === sansPrefix(address),
    async sell(price) {
      // TODO: FT の種類を選べるようにする
      await createSaleOffer(
        {
          itemTokenAddress,
          itemTokenName,
          itemId,
          paymentTokenAddress: KIBBLE_ADDRESS,
          paymentTokenName: KIBBLE_NAME,
          price: price
        },
        {
          onStart() {
            setStatus(PROCESSING)
          },
          async onSuccess() {
            accountItems.refresh()
            marketItems.refresh()
          },
          async onComplete() {
            setStatus(IDLE)
          },
        }
      )
    },
    async refresh() {
      setStatus(PROCESSING)
      await fetchAccountItem(...expand(stateKey)).then(setItem)
      setStatus(IDLE)
    },
  }
}
