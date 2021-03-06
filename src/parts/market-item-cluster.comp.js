import {Suspense} from "react"
import {useMarketItem} from "../hooks/use-market-item.hook"
import {useAccountItem} from "../hooks/use-account-item.hook"
import {useCurrentUser} from "../hooks/use-current-user.hook"
import {IDLE} from "../global/constants"
import {fmtPrice} from "../util/fmt-price"
import {Tr, Td, Button, Spinner, Flex, Center, Text} from "@chakra-ui/react"

export function MarketItemCluster({address, itemKey}) {
  const item = useAccountItem(address, itemKey)
  const list = useMarketItem(address, itemKey)
  const [, loggedIn] = useCurrentUser()

  const BUSY = item.status !== IDLE || list.status !== IDLE

  if (address == null) return null
  if (itemKey == null) return null

  return (
    <Tr>
      <Td>{list.itemTokenName}</Td>
      <Td>
        <Flex>
          <Text>#{item.id}</Text>
          {BUSY && (
            <Center ml="4">
              <Spinner size="xs" />
            </Center>
          )}
        </Flex>
      </Td>
      <Td isNumeric>{fmtPrice(list.price, list.paymentTokenName === 'Kibble' ? 'KIBBLE' : 'FLOW')}</Td>
      {loggedIn && (
        <>
          {item.owned ? (
            <Td isNumeric maxW="50px">
              <Button
                colorScheme="orange"
                size="sm"
                disabled={BUSY}
                onClick={list.cancelListing}
              >
                Unlist
              </Button>
            </Td>
          ) : (
            <Td isNumeric maxW="15px">
              <Button
                colorScheme="blue"
                size="sm"
                disabled={BUSY}
                onClick={list.buy}
              >
                Buy
              </Button>
            </Td>
          )}
        </>
      )}
    </Tr>
  )
}

export default function WrappedMarketItemCluster(props) {
  return (
    <Suspense
      fallback={
        <Tr>
          <Td maxW="50px">
            <Flex>
              <Text>#{props.itemKey}</Text>
              <Center ml="4">
                <Spinner size="xs" />
              </Center>
            </Flex>
          </Td>
          <Td />
          <Td />
        </Tr>
      }
    >
      <MarketItemCluster {...props} />
    </Suspense>
  )
}
