import {Suspense} from "react"
import {Loading} from "../parts/loading.comp"
import {useAccountItem} from "../hooks/use-account-item.hook"
// import {useMarketItem} from "../hooks/use-market-item.hook"
import {useCurrentUser} from "../hooks/use-current-user.hook"
import {IDLE, KITTY_ITEMS_ADDRESS, KITTY_ITEMS_NAME} from "../global/constants"
import {Tr, Td, Button, Spinner, Flex, Center, Text} from "@chakra-ui/react"

export function AccountItemCluster({address, id}) {
  // TODO: NFTの種類を選べるようにする
  const key = `${KITTY_ITEMS_ADDRESS}.${KITTY_ITEMS_NAME}.${id}`
  const item = useAccountItem(address, key)
  // const list = useMarketItem(address, key)
  const [cu] = useCurrentUser()

  // TODO: なぜか機能していない
  const BUSY = item.status !== IDLE

  if (address == null) return null
  if (id == null) return null

  return (
    <Tr>
      <Td maxW="50px">
        <Flex>
          <Text as={item.forSale && "del"}>#{item.id}</Text>
          {BUSY && (
            <Center ml="4">
              <Spinner size="xs" />
            </Center>
          )}
        </Flex>
      </Td>
      <Td>{item.type}</Td>
      {cu.addr === address && (
        <>
          {!item.forSale ? (
            <Td isNumeric maxW="50px">
              <Button
                colorScheme="blue"
                size="sm"
                disabled={BUSY}
                onClick={() => item.sell("10.0")}
              >
                List for 10 KIBBLE
              </Button>
            </Td>
          ) : (
            <Td isNumeric maxW="50px">
              <Button size="sm" disabled={true} colorScheme="orange">
                Unlist (TODO)
              </Button>
            </Td>
          )}
        </>
      )}
    </Tr>
  )
}

export default function WrappedAccountItemCluster(props) {
  return (
    <Suspense
      fallback={
        <Tr>
          <Td>
            <Flex>
              <Text>#{props.id}</Text>
              <Center ml="4">
                <Spinner size="xs" />
              </Center>
            </Flex>
          </Td>
          <Td />
          <Td />
          <Td />
        </Tr>
      }
    >
      <AccountItemCluster {...props} />
    </Suspense>
  )
}
