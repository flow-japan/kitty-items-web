import {Suspense} from "react"
import {useMarketItems} from "../hooks/use-market-items.hook"
import Item from "./market-item-cluster.comp"
import {STORE_ADDRESS} from "../global/constants"
import {Box, Table, Thead, Tbody, Tr, Th, Text, Spinner, Flex, Alert, Spacer, IconButton} from "@chakra-ui/react"
import {RepeatIcon} from '@chakra-ui/icons'

export function MarketItemsCluster({address}) {
  const items = useMarketItems(address)
  if (address == null) return null

  if (items.items.length <= 0)
    return (
      <Box borderWidth="1px" borderRadius="lg" p="4">
        <Text>No Items Listed For Sale</Text>
      </Box>
    )

  return (
    <div>
      {address === STORE_ADDRESS && (
        <Flex>
          <Alert status="info" colorScheme="gray" solid mb="15px" mr="20px">
            It will take up to 1 minute to be updated. Click on the button to refresh.
          </Alert>
          <Spacer />
          <IconButton
            icon={<RepeatIcon/>}
            colorScheme="blue"
            variant="outline"
            size="lg"
            mb="15px"
            aria-label="Update"
            onClick={() => items.refresh()}
          />
        </Flex>
      )}
      {items.items.length <= 0 ? (
        <Box borderWidth="1px" borderRadius="lg" p="4">
          <Text>No Items Listed For Sale</Text>
        </Box>
      ) : (
        <Box borderWidth="1px" borderRadius="lg">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Item Token Name</Th>
                <Th>Id</Th>
                <Th isNumeric>Price</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {items.items.map(item => (
                <Item key={item.key} itemKey={item.key} address={item.collectionAddress} />
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </div>
  )
}

export default function WrappedMarketItemsCluster({address}) {
  return (
    <Suspense
      fallback={
        <Box borderWidth="1px" borderRadius="lg" p="4">
          <Spinner />
        </Box>
      }
    >
      <MarketItemsCluster address={address} />
    </Suspense>
  )
}
