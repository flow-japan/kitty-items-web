import {Suspense} from "react"
import {useAccountItems} from "../hooks/use-account-items.hook"
import {useMarketItems} from "../hooks/use-market-items.hook"
import {useCurrentUser} from "../hooks/use-current-user.hook"
import {KITTY_ITEMS_ADDRESS, KITTY_ITEMS_NAME} from "../global/constants"
import Item from "./account-item-cluster.comp"
import {Box, Table, Thead, Tbody, Tr, Th, Text, Spinner} from "@chakra-ui/react"

export function AccountItemsCluster({address}) {
  const items = useAccountItems(address)
  const list = useMarketItems(address)
  const [cu] = useCurrentUser()

  if (address == null) return null

  if (items.ids.length <= 0)
    return (
      <Box borderWidth="1px" borderRadius="lg" p="4">
        <Text>No Items</Text>
      </Box>
    )

  return (
    <Box borderWidth="1px" borderRadius="lg">
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Item Token Name</Th>
            <Th>Id</Th>
            {cu.addr === address && <Th />}
          </Tr>
        </Thead>
        <Tbody>
          {items.ids.map(id => (
            <Item key={id} id={id} address={address} forSale={list.items.some(saleOffer => saleOffer.key === `${KITTY_ITEMS_ADDRESS}.${KITTY_ITEMS_NAME}.${id}`)} />
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}

export default function WrappedAccountItemsCluster({address}) {
  return (
    <Suspense
      fallback={
        <Box borderWidth="1px" borderRadius="lg" p="4">
          <Spinner />
        </Box>
      }
    >
      <AccountItemsCluster address={address} />
    </Suspense>
  )
}
