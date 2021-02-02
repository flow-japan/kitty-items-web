import {Suspense} from "react"
import {useAccountItem} from "../hooks/use-account-item.hook"
import {useCurrentUser} from "../hooks/use-current-user.hook"
import {IDLE, KITTY_ITEMS_ADDRESS, KITTY_ITEMS_NAME, KIBBLE_ADDRESS, KIBBLE_NAME, FLOW_TOKEN_ADDRESS, FLOW_TOKEN_NAME} from "../global/constants"
import {Tr, Td, Button, Spinner, Flex, Center, Text, Tag} from "@chakra-ui/react"

export function AccountItemCluster({address, id, forSale}) {
  // TODO: NFTの種類を選べるようにする
  const key = `${KITTY_ITEMS_ADDRESS}.${KITTY_ITEMS_NAME}.${id}`
  const item = useAccountItem(address, key)
  const [cu] = useCurrentUser()

  const BUSY = item.status !== IDLE

  if (address == null) return null
  if (id == null) return null

  return (
    <Tr>
      <Td>{KITTY_ITEMS_NAME}</Td>
      <Td>
        <Flex>
          <Text as={forSale && "del"}>#{item.id}</Text>
          {BUSY && (
            <Center ml="4">
              <Spinner size="xs" />
            </Center>
          )}
        </Flex>
      </Td>
      {cu.addr === address && (
        <>
          {!forSale ? (
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
              {/* <Button size="sm" disabled={true} colorScheme="orange">
                Unlist
              </Button> */}
              <Tag size="lg" key="lg" variant="subtle" colorScheme="gray" color="gray.500">
                Listed For Sale
              </Tag>
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
