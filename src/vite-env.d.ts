/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOLANA_CLUSTER?: 'devnet' | 'testnet' | 'mainnet-beta'
  readonly VITE_SOLANA_RPC_URL?: string
  readonly VITE_NFT_STORAGE_TOKEN?: string
  readonly VITE_SERVICE_FEE_LAMPORTS?: string // deprecated: use VITE_FEE_BASE_LAMPORTS
  readonly VITE_SERVICE_FEE_RECIPIENT?: string
  readonly VITE_FEE_BASE_LAMPORTS?: string
  readonly VITE_FEE_REVOKE_MINT_LAMPORTS?: string
  readonly VITE_FEE_REVOKE_FREEZE_LAMPORTS?: string
  readonly VITE_FEE_CUSTOM_CREATOR_LAMPORTS?: string
  readonly VITE_FEE_VANITY_LAMPORTS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
