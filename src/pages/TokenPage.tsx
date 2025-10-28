import { Box, Button, Code, Heading, Link, Stack, Text } from '@chakra-ui/react'
import { useLocation, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { explorerAddressUrl, explorerTxUrl } from '@/utils/explorer'

export default function TokenPage() {
  const { mint } = useParams()
  const location = useLocation() as any
  const state = location?.state || {}

  const txUrl = useMemo(() => (state?.txSig ? explorerTxUrl(state.txSig) : null), [state?.txSig])
  const mintUrl = useMemo(() => (mint ? explorerAddressUrl(mint) : null), [mint])
  const ataUrl = useMemo(() => (state?.ata ? explorerAddressUrl(state.ata) : null), [state?.ata])

  return (
    <Box>
      <Heading size="md" mb={4}>Token Created</Heading>

      {mint && (
        <Stack spacing={3}>
          <Text>Mint Address: <Code>{mint}</Code> {mintUrl && <Link href={mintUrl} target="_blank" rel="noreferrer"><Button size="xs" ml={2}>View</Button></Link>}</Text>
          {state?.ata && (
            <Text>Associated Token Account: <Code>{state.ata}</Code> {ataUrl && <Link href={ataUrl} target="_blank" rel="noreferrer"><Button size="xs" ml={2}>View</Button></Link>}</Text>
          )}
          {state?.txSig && (
            <Text>Transaction: <Code>{state.txSig}</Code> {txUrl && <Link href={txUrl} target="_blank" rel="noreferrer"><Button size="xs" ml={2}>View</Button></Link>}</Text>
          )}
        </Stack>
      )}

      {!mint && <Text>No mint address found.</Text>}
    </Box>
  )
}
