import {atomFamily, selectorFamily, useRecoilState} from "recoil"
import {sansPrefix} from "@onflow/fcl"
import {IDLE, PROCESSING} from "../global/constants"
import {useCurrentUser} from "../hooks/use-current-user.hook"
import {useAccountItems} from "../hooks/use-account-items.hook"
import {useMarketItems} from "../hooks/use-market-items.hook"
import {useKibblesBalance} from "../hooks/use-kibbles-balance.hook"
import {fetchMarketItem} from "../flow/fetch-market-item.script"
import {buyMarketItem} from "../flow/buy-market-item.tx"
import {cancelMarketListing} from "../flow/cancel-market-listing.tx"

function expand(key) {
  return key.split("|")
}

function comp(address, key) {
  return [address, key].join("|")
}

export const $state = atomFamily({
  key: "market-item::state",
  default: selectorFamily({
    key: "market-item::default",
    get: key => async () => fetchMarketItem(...expand(key)),
  }),
})

export const $status = atomFamily({
  key: "market-item::status",
  default: IDLE,
})

export function useMarketItem(address, key) {
  const [cu] = useCurrentUser()
  const ownerItems = useAccountItems(address)
  const cuItems = useAccountItems(cu.addr)
  const ownerMarket = useMarketItems(address)
  const cuMarket = useMarketItems(cu.addr)
  const kibble = useKibblesBalance(cu.addr)
  const stateKey = comp(address, key)
  const [item, setItem] = useRecoilState($state(stateKey))
  const [status, setStatus] = useRecoilState($status(stateKey))

  const owned = sansPrefix(cu.addr) === sansPrefix(address)

  const [itemTokenAddress, itemTokenName, itemId] = key.split('.')

  return {
    ...item,
    status,
    owned,
    async buy() {
      await buyMarketItem(
        {
          itemTokenAddress,
          itemTokenName,
          itemId,
          ownerAddress: address
        },
        {
          onStart() {
            setStatus(PROCESSING)
          },
          async onSuccess() {
            if (address !== cu.addr) {
              ownerItems.refresh()
              ownerMarket.refresh()
            }
            cuItems.refresh()
            cuMarket.refresh()
            kibble.refresh()
          },
          async onComplete() {
            setStatus(IDLE)
          },
        }
      )
    },
    async cancelListing() {
      await cancelMarketListing(
        {
          itemTokenAddress,
          itemTokenName,
          itemId
        },
        {
          onStart() {
            setStatus(PROCESSING)
          },
          async onSuccess() {
            cuItems.refresh()
            cuMarket.refresh()
            kibble.refresh()
          },
          async onComplete() {
            setStatus(IDLE)
          },
        }
      )
    },
    async refresh() {
      setStatus(PROCESSING)
      await fetchMarketItem(...expand(stateKey)).then(setItem)
      setStatus(IDLE)
    },
  }
}
