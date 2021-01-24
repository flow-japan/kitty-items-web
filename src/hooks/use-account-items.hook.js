import {atomFamily, selectorFamily, useRecoilState} from "recoil"
import {fetchAccountItems} from "../flow/fetch-account-items.script"
import {mintKittyItem} from "../flow/mint-kitty-item.tx"
import {IDLE, PROCESSING} from "../global/constants"

export const $state = atomFamily({
  key: "account-items::state",
  default: selectorFamily({
    key: "account-items::default",
    get: address => async () => fetchAccountItems(address),
  }),
})

export const $status = atomFamily({
  key: "account-items::status",
  default: IDLE,
})

export function useAccountItems(address) {
  const [items, setItems] = useRecoilState($state(address))
  const [status, setStatus] = useRecoilState($status(address))

  async function refresh() {
    setStatus(PROCESSING)
    await fetchAccountItems(address).then(setItems)
    setStatus(IDLE)
  }

  return {
    ids: items,
    status,
    refresh,
    async mint() {
      setStatus(PROCESSING)

      // TODO: mintをapiで実施するよう変更
      // await fetch(
      //   "https://kitty-items-flow-testnet.herokuapp.com/v1/kitty-items/mint",
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       recipient: address,
      //       typeId: 2,
      //     }),
      //   }
      // )
      // これは一時的なコード
      await mintKittyItem({
        recipient: address,
        typeID: 1
      });

      await fetchAccountItems(address).then(setItems)
      setStatus(IDLE)
    },
  }
}
