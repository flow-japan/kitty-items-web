import {atomFamily, selectorFamily, useRecoilState} from "recoil"
import {fetchKibblesBalance} from "../flow/fetch-kibbles-balance.script"
import {mintKibbles} from "../flow/mint-kibbles.tx"
import {IDLE, PROCESSING} from "../global/constants"

export const valueAtom = atomFamily({
  key: "kibbles-balance::state",
  default: selectorFamily({
    key: "kibbles-balance::default",
    get: address => async () => fetchKibblesBalance(address),
  }),
})

export const statusAtom = atomFamily({
  key: "kibbles-balance::status",
  default: IDLE,
})

export function useKibblesBalance(address) {
  const [balance, setBalance] = useRecoilState(valueAtom(address))
  const [status, setStatus] = useRecoilState(statusAtom(address))

  async function refresh() {
    setStatus(PROCESSING)
    await fetchKibblesBalance(address).then(setBalance)
    setStatus(IDLE)
  }

  return {
    balance,
    status,
    refresh,
    async mint() {
      setStatus(PROCESSING)

      // TODO: mintをapiで実施するよう変更
      // await fetch(
      //   "https://kitty-items-flow-testnet.herokuapp.com/v1/kibbles/mint",
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       recipient: address,
      //       amount: 5.0,
      //     }),
      //   }
      // )
      //
      // これは一時的なコード
      await mintKibbles({
        recipient: address,
        amount: '5.0'
      });

      await fetchKibblesBalance(address).then(setBalance)
      setStatus(IDLE)
    },
  }
}
