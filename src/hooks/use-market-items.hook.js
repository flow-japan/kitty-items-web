import {atomFamily, selectorFamily, useRecoilState} from 'recoil'
import {IDLE, PROCESSING} from '../global/constants'

const fetchMarketItems1 = async () => {
  const res = await fetch(
    'https://flow-demo-eehahoagfa-uc.a.run.app/V1/market/latest?limit=30&offset=0',
    {method: 'GET', headers: {'Content-Type': 'application/json'}}
  )
  const {latestSaleOffers} = await res.json()
  return latestSaleOffers
    .filter(s => !!s.collectionAddress)
    .map(s => {
      return {
        collectionAddress: s.collectionAddress,
        key: `${s.tokenAddress}.${s.tokenName}.${s.tokenId}`,
      }
    })
}

export const $state = atomFamily({
  key: 'market-items::state',
  default: selectorFamily({
    key: 'market-items::default',
    get: address => fetchMarketItems1,
  }),
})

export const $status = atomFamily({
  key: 'market-items::status',
  default: IDLE,
})

export function useMarketItems (address) {
  const [items, setItems] = useRecoilState($state(address))
  const [status, setStatus] = useRecoilState($status(address))

  return {
    items,
    status,
    async refresh () {
      setStatus(PROCESSING)
      await fetchMarketItems1(address).then(setItems)
      setStatus(IDLE)
    },
    has (key) {
      return items.some(item => item.key === key)
    },
  }
}
