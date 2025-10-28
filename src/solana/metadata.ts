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

  // Prefer to include image if possible (without truncating the URL, which would break it)
  // Strategy: progressively try (name + symbol + image) -> (name + image) -> (name + symbol) -> (name)
  // While reducing name length until it fits the 200-char limit. As a last resort, return a tiny JSON.
  const tryEncode = (obj: any) => `${PREFIX}${encodeURIComponent(JSON.stringify(obj))}`

  let nameLimit = 32
  while (nameLimit > 0) {
    const nameVal = sanitize(input.name, nameLimit)
    const symbolVal = sanitize(input.symbol, 10)
    const imageVal = input.image && input.image.trim() ? input.image.trim() : undefined

    if (imageVal) {
      // Try name + symbol + image
      const withAll = symbolVal ? { name: nameVal, symbol: symbolVal, image: imageVal } : { name: nameVal, image: imageVal }
      let uri = tryEncode(withAll)
      if (uri.length <= MAX_URI_LEN) return uri

      // Try name + image (drop symbol)
      uri = tryEncode({ name: nameVal, image: imageVal })
      if (uri.length <= MAX_URI_LEN) return uri
    }

    // Try name + symbol (no image)
    if (symbolVal) {
      const uri = tryEncode({ name: nameVal, symbol: symbolVal })
      if (uri.length <= MAX_URI_LEN) return uri
    }

    // Try name only
    {
      const uri = tryEncode({ name: nameVal })
      if (uri.length <= MAX_URI_LEN) return uri
    }

    // Reduce name and try again
    nameLimit -= 1
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
