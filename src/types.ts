export type TokenFormValues = {
  name: string
  symbol: string
  decimals: number
  supply: string // human units, may contain decimals
  logoUrl?: string
  description?: string
  tags: string[]
  revokeMintAuthority: boolean
  revokeFreezeAuthority: boolean
  immutable: boolean
  customCreator?: string
  vanityPrefix?: string
  vanitySuffix?: string
  vanityCaseSensitive: boolean
  vanityMaxIterations: number
}
