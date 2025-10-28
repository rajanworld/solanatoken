import { NFTStorage } from 'nft.storage'

export type MetadataInput = {
  name: string
  symbol: string
  description?: string
  image?: string // logo URL
  tags?: string[]
  creators?: { address: string; share: number }[]
}

export async function uploadOrBuildMetadataUri(input: MetadataInput): Promise<string> {
  const meta = buildMetadataJson(input)
  const tokenRaw = import.meta.env.VITE_NFT_STORAGE_TOKEN as string | undefined
  const token = tokenRaw?.trim()
  if (token) {
    try {
      const client = new NFTStorage({ token })
      const blob = new Blob([JSON.stringify(meta)], { type: 'application/json' })
      const cid = await client.storeBlob(blob)
      return `https://nftstorage.link/ipfs/${cid}`
    } catch (e) {
      // Graceful fallback if the token is malformed/unauthorized or quota is exhausted.
      // This avoids blocking token creation when external storage fails.
      console.warn('NFT.Storage upload failed; falling back to data URI.', e)
    }
  }
  // Fallback: Build a minimal data URI that MUST be <= 200 chars (Metaplex limit)
  return buildMinimalDataUri(input)
}

function buildMinimalDataUri(input: MetadataInput): string {
  const MAX_URI_LEN = 200
  const PREFIX = 'data:application/json,'

  const sanitize = (s: string | undefined, n: number) => (s || '').slice(0, n)

  // Start with minimal fields to keep URI small
  let nameLimit = 32
  let includeSymbol = true

  while (nameLimit > 0) {
    const base: any = { name: sanitize(input.name, nameLimit) }
    if (includeSymbol && input.symbol) base.symbol = sanitize(input.symbol, 10)

    const json = JSON.stringify(base)
    const encoded = encodeURIComponent(json)
    const uri = `${PREFIX}${encoded}`
    if (uri.length <= MAX_URI_LEN) return uri

    // If too long, first drop symbol, then reduce name progressively
    if (includeSymbol) {
      includeSymbol = false
    } else {
      nameLimit -= 1
    }
  }

  // As a last resort, return a tiny valid JSON
  return `${PREFIX}${encodeURIComponent('{"name":"t"}')}`
}

function buildMetadataJson(input: MetadataInput) {
  const { name, symbol, description, image, tags = [], creators } = input
  return {
    name,
    symbol,
    description: description || '',
    image: image || '',
    attributes: tags.slice(0, 10).map((t) => ({ trait_type: 'tag', value: t })),
    properties: {
      category: 'ft',
      creators: creators?.map((c) => ({ address: c.address, share: c.share })) || [],
    },
  }
}
