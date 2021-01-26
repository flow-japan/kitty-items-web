import {Suspense} from "react"
import {Loading} from "../parts/loading.comp"
import {useAccountItem} from "../hooks/use-account-item.hook"
// import {useMarketItem} from "../hooks/use-market-item.hook"
import {useCurrentUser} from "../hooks/use-current-user.hook"
import {IDLE, KITTY_ITEMS_ADDRESS, KITTY_ITEMS_NAME, KIBBLE_ADDRESS, KIBBLE_NAME, FLOW_TOKEN_ADDRESS, FLOW_TOKEN_NAME} from "../global/constants"
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
      <Td>{KITTY_ITEMS_NAME}</Td>
      <Td>
        <Flex>
          <Text as={item.forSale && "del"}>#{item.id}</Text>
          {BUSY && (
            <Center ml="4">
              <Spinner size="xs" />
            </Center>
          )}
        </Flex>
      </Td>
      {cu.addr === address && (
        <>
          {!item.forSale ? (
            <Td isNumeric size="sm">
              <Flex justify="flex-end">
                <Button
                  colorScheme="blue"
                  size="sm"
                  disabled={BUSY}
                  onClick={() => item.sell("10.0", KIBBLE_ADDRESS, KIBBLE_NAME)}
                >
                  List for 10 KIBBLE
                </Button>
                <Button
                  ml="5"
                  colorScheme="blue"
                  size="sm"
                  disabled={BUSY}
                  onClick={() => item.sell("0.001", FLOW_TOKEN_ADDRESS, FLOW_TOKEN_NAME)}
                >
                  List for 0.001 FLOW
                </Button>
              </Flex>
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
