import { useState, useMemo, type ChangeEvent } from 'react'
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Input,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
  Tooltip,
  useToast,
} from '@chakra-ui/react'
import { CopyIcon } from '@chakra-ui/icons'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { createSplToken } from '@/solana/token'
import type { TokenFormValues } from '@/types'
import { useNavigate } from 'react-router-dom'

const TAGS = ['Meme', 'Airdrop', 'Tokenization', 'NFT'] as const

export default function TokenForm() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const navigate = useNavigate()
  const toast = useToast()

  const baseFeeLamports = Number(import.meta.env.VITE_FEE_BASE_LAMPORTS || import.meta.env.VITE_SERVICE_FEE_LAMPORTS || 0)
  const feeRevokeMint = Number(import.meta.env.VITE_FEE_REVOKE_MINT_LAMPORTS || 0)
  const feeRevokeFreeze = Number(import.meta.env.VITE_FEE_REVOKE_FREEZE_LAMPORTS || 0)
  const feeCustomCreator = Number(import.meta.env.VITE_FEE_CUSTOM_CREATOR_LAMPORTS || 0)
  const feeVanity = Number(import.meta.env.VITE_FEE_VANITY_LAMPORTS || 0)
  const toSol = (lamports: number) => lamports / 1_000_000_000
  const cluster = (import.meta.env.VITE_SOLANA_CLUSTER || 'devnet') as string

  const [values, setValues] = useState<TokenFormValues>({
    name: '',
    symbol: '',
    decimals: 6,
    supply: '1000000',
    logoUrl: '',
    description: '',
    tags: [],
    revokeMintAuthority: false,
    revokeFreezeAuthority: false,
    immutable: false,
    customCreator: '',
    vanityPrefix: '',
    vanitySuffix: '',
    vanityCaseSensitive: false,
    vanityMaxIterations: 0,
  })
  const [submitting, setSubmitting] = useState(false)
  const totalFeeLamports =
    baseFeeLamports +
    (values.revokeMintAuthority ? feeRevokeMint : 0) +
    (values.revokeFreezeAuthority ? feeRevokeFreeze : 0) +
    (values.customCreator ? feeCustomCreator : 0) +
    ((values.vanityPrefix || values.vanitySuffix) && values.vanityMaxIterations > 0 ? feeVanity : 0)

  const canSubmit = useMemo(() => {
    return (
      !!wallet.publicKey &&
      values.name.trim().length > 0 &&
      values.name.trim().length <= 30 &&
      values.symbol.trim().length > 0 &&
      values.symbol.trim().length <= 10 &&
      values.decimals >= 0 && values.decimals <= 9 &&
      /^\d+(\.\d+)?$/.test(values.supply.trim())
    )
  }, [values, wallet.publicKey])

  function update<K extends keyof TokenFormValues>(key: K, v: TokenFormValues[K]) {
    setValues((s: TokenFormValues) => ({ ...s, [key]: v }))
  }

  async function onSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const result = await createSplToken(connection, wallet, values)
      toast({ title: 'Token created!', description: `Mint: ${result.mint.toBase58()}`, status: 'success' })
      navigate(`/token/${result.mint.toBase58()}` as const, {
        state: { txSig: result.txSig, ata: result.ata.toBase58() },
      })
    } catch (e: any) {
      console.error(e)
      toast({ title: 'Failed to create token', description: e?.message || String(e), status: 'error', duration: 8000 })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Token information</Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <FormControl isRequired>
          <FormLabel>Token Name (Max 30)</FormLabel>
          <Input placeholder="My Token" value={values.name} onChange={(e: ChangeEvent<HTMLInputElement>) => update('name', e.target.value)} maxLength={30} />
          <FormHelperText>Display name shown in wallets and explorers.</FormHelperText>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Token Symbol (Max 10)</FormLabel>
          <Input placeholder="MYT" value={values.symbol} onChange={(e: ChangeEvent<HTMLInputElement>) => update('symbol', e.target.value.toUpperCase())} maxLength={10} />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Decimals</FormLabel>
          <NumberInput min={0} max={9} value={values.decimals} onChange={(_: string, n: number) => update('decimals', Number.isFinite(n) ? n : 0)}>
            <NumberInputField />
          </NumberInput>
          <FormHelperText>Change the number of decimals for your token.</FormHelperText>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Supply</FormLabel>
          <Input placeholder="1000000" value={values.supply} onChange={(e: ChangeEvent<HTMLInputElement>) => update('supply', e.target.value)} />
          <FormHelperText>The initial number of available tokens that will be created in your wallet.</FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Logo URL</FormLabel>
          <Input placeholder="https://.../logo.png" value={values.logoUrl || ''} onChange={(e: ChangeEvent<HTMLInputElement>) => update('logoUrl', e.target.value)} />
          <FormHelperText>Add logo for your token.</FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea placeholder="Describe your token..." value={values.description || ''} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => update('description', e.target.value)} />
        </FormControl>

        <FormControl>
          <FormLabel>Tags (optional) - max 3</FormLabel>
          <Stack direction={{ base: 'column', md: 'row' }}>
            {TAGS.map((t) => (
              <Checkbox
                key={t}
                isChecked={values.tags.includes(t)}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const checked = e.target.checked
                  setValues((s: TokenFormValues) => {
                    let next = s.tags.slice()
                    if (checked) {
                      if (next.length < 3 && !next.includes(t)) next.push(t)
                    } else {
                      next = next.filter((x) => x !== t)
                    }
                    return { ...s, tags: next }
                  })
                }}
              >
                {t}
              </Checkbox>
            ))}
          </Stack>
        </FormControl>
      </SimpleGrid>

      <Heading size="md" mt={8} mb={4}>Additional settings</Heading>

      <Stack spacing={4}>
        <Flex align="center" gap={3}>
          <Switch isChecked={values.revokeMintAuthority} onChange={(e: ChangeEvent<HTMLInputElement>) => update('revokeMintAuthority', e.target.checked)} />
          <Box>
            <Text fontWeight="semibold">
              Revoke Mint Authority {feeRevokeMint ? <Badge ml={2}>{toSol(feeRevokeMint)} SOL fee</Badge> : null}
            </Text>
            <Text fontSize="sm" color="gray.400">Prevent additional token supply to increase investors trust. DEX scanners will mark your coin as safe.</Text>
          </Box>
        </Flex>

        <Flex align="center" gap={3}>
          <Switch isChecked={values.revokeFreezeAuthority} onChange={(e: ChangeEvent<HTMLInputElement>) => update('revokeFreezeAuthority', e.target.checked)} />
          <Box>
            <Text fontWeight="semibold">
              Revoke Freeze Authority {feeRevokeFreeze ? <Badge ml={2}>{toSol(feeRevokeFreeze)} SOL fee</Badge> : null}
            </Text>
            <Text fontSize="sm" color="gray.400">Prevent token freezing. DEX scanners will mark your coin as safe.</Text>
          </Box>
        </Flex>

        <Flex align="center" gap={3}>
          <Switch isChecked={values.immutable} onChange={(e: ChangeEvent<HTMLInputElement>) => update('immutable', e.target.checked)} />
          <Box>
            <Text fontWeight="semibold">Immutable</Text>
            <Text fontSize="sm" color="gray.400">If your token is immutable, you will not be able to update token metadata.</Text>
          </Box>
        </Flex>

        <FormControl>
          <FormLabel>Custom Creator Info (public key)</FormLabel>
          <Input placeholder="Optional: creator public key" value={values.customCreator || ''} onChange={(e: ChangeEvent<HTMLInputElement>) => update('customCreator', e.target.value)} />
          <FormHelperText>
            Change information about token creator in token metadata. {feeCustomCreator ? `Fee: ${toSol(feeCustomCreator)} SOL` : ''}
          </FormHelperText>
        </FormControl>
      </Stack>

      <Heading size="md" mt={8} mb={4}>Personalization</Heading>

      <Alert status="info" borderRadius="md" mb={4}>
        <AlertIcon />
        Vanity mint address search can take time and uses CPU. Keep iterations modest (e.g., 5,000 - 50,000). It is optional.
      </Alert>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <FormControl>
          <FormLabel>Claim a Custom Address - Prefix</FormLabel>
          <Input placeholder="e.g., SOL" value={values.vanityPrefix || ''} onChange={(e: ChangeEvent<HTMLInputElement>) => update('vanityPrefix', e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Suffix</FormLabel>
          <Input placeholder="e.g., MOON" value={values.vanitySuffix || ''} onChange={(e: ChangeEvent<HTMLInputElement>) => update('vanitySuffix', e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Max Iterations</FormLabel>
          <NumberInput min={0} max={500000} value={values.vanityMaxIterations} onChange={(_: string, n: number) => update('vanityMaxIterations', Math.max(0, Math.min(500000, Number.isFinite(n) ? n : 0)))}>
            <NumberInputField />
          </NumberInput>
          <FormHelperText>
            0 disables vanity search. Higher = more time. {feeVanity ? `Fee: ${toSol(feeVanity)} SOL` : ''}
          </FormHelperText>
        </FormControl>
      </SimpleGrid>

      <Flex align="center" gap={3} mt={2}>
        <Switch isChecked={values.vanityCaseSensitive} onChange={(e: ChangeEvent<HTMLInputElement>) => update('vanityCaseSensitive', e.target.checked)} />
        <Text>Case sensitive</Text>
      </Flex>

      <Alert status="warning" mt={6} borderRadius="md">
        <AlertIcon />
        You're connected to <Badge ml={1}>{cluster}</Badge>. Use devnet/testnet for free testing. Mainnet requires SOL for fees.
      </Alert>

      {(baseFeeLamports || totalFeeLamports) ? (
        <Alert status="info" mt={4} borderRadius="md">
          <AlertIcon />
          Estimated service fee at submission: <b>{toSol(totalFeeLamports)} SOL</b>{baseFeeLamports ? ` (includes base fee ${toSol(baseFeeLamports)} SOL)` : ''}
        </Alert>
      ) : null}

      <HStack mt={8}>
        <Button colorScheme="teal" onClick={onSubmit} isDisabled={!canSubmit || submitting} isLoading={submitting}>
          Create Token
        </Button>
        <Tooltip label="Copy current form as JSON (for debugging)">
          <IconButton aria-label="copy" icon={<CopyIcon />} onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(values, null, 2))
            toast({ title: 'Copied form JSON to clipboard', status: 'info' })
          }} />
        </Tooltip>
      </HStack>
    </Box>
  )
}
