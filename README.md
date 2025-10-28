# Solana Token Creator

Create and mint your own SPL Token on Solana without coding. Customize metadata, initial supply, and add safety options like revoking mint/freeze authorities. Test for free on devnet/testnet.

## Features

- Token info: name, symbol, decimals, supply, logo URL, description, tags
- Safety: revoke mint authority, revoke freeze authority, make metadata immutable
- Metadata upload to IPFS via NFT.Storage (optional; falls back to data URI if not set)
- Vanity mint address search (optional; bounded by your iteration limit)
- Wallets: Phantom, Solflare, Backpack via Wallet Adapter
- Cluster via env: devnet, testnet, mainnet-beta

## Tech Stack

- React + Vite + TypeScript
- Chakra UI
- @solana/web3.js + @solana/spl-token
- Metaplex Token Metadata program (@metaplex-foundation/mpl-token-metadata)
- Solana Wallet Adapter (React + UI)

## Prerequisites

- Node.js 18+ and npm
- A Solana wallet extension such as Phantom, Solflare, or Backpack
- For mainnet usage, enough SOL to pay network fees and any configured service fees

## Quickstart

1) Install dependencies

```powershell
# Windows PowerShell
npm install
```

2) Copy the environment template and configure

```powershell
# Windows PowerShell
Copy-Item .env.example .env
# Edit .env with your desired cluster, optional RPC URL, and optional API keys
```

3) Start the dev server

```powershell
npm run dev
```

Open the app at the URL shown in your terminal (typically http://localhost:5173).

## Environment Variables (Human-Readable)

All variables live in `.env` and must be prefixed with `VITE_` to be available to the frontend.

- VITE_SOLANA_CLUSTER
  - What: Which network to connect to.
  - Options: `devnet`, `testnet`, `mainnet-beta`.
  - Example: `VITE_SOLANA_CLUSTER=devnet` (free test tokens on devnet/testnet).

- VITE_SOLANA_RPC_URL (optional)
  - What: Custom RPC endpoint; if empty, the app uses the default public endpoint for the selected cluster.
  - Why: Better reliability, higher rate limits, and performance (especially on mainnet).
  - Where to get:
    - Helius: https://rpc.helius.xyz (requires API key)
    - QuickNode: https://www.quicknode.com (requires API key)
    - Triton One: https://www.triton.one (requires API key)
    - Ankr: https://www.ankr.com/rpc/solana (free tier available)

- VITE_NFT_STORAGE_TOKEN (optional)
  - What: API key from https://nft.storage used to upload your token metadata JSON to IPFS.
  - Why: Ensures your token metadata is stored on decentralized storage and recognized by most explorers.
  - Where to get: Sign up at https://nft.storage and create a token.
  - If omitted: The app uses a data URI fallback; some explorers and wallets might not render rich metadata.

- VITE_SERVICE_FEE_RECIPIENT (optional)
  - What: Base58 public key that will receive any service fees. If omitted or invalid, no fee is taken regardless of the amounts below.

- Fee amounts (all optional; lamports units; 1 SOL = 1_000_000_000 lamports)
  - VITE_FEE_BASE_LAMPORTS: A base fee added to every token creation.
  - VITE_FEE_REVOKE_MINT_LAMPORTS: Fee added when "Revoke Mint Authority" is enabled.
  - VITE_FEE_REVOKE_FREEZE_LAMPORTS: Fee added when "Revoke Freeze Authority" is enabled.
  - VITE_FEE_CUSTOM_CREATOR_LAMPORTS: Fee added when a custom creator public key is provided.
  - VITE_FEE_VANITY_LAMPORTS: Fee added when vanity mint address search is enabled with a positive iteration limit.

The app computes the total service fee at submission time as:

```
Total = BASE + (RevokeMint?fee) + (RevokeFreeze?fee) + (CustomCreator?fee) + (Vanity?fee)
```

If `VITE_SERVICE_FEE_RECIPIENT` is not set or invalid, no service fee is transferred.

## How It Works (High-Level)

- Creates a new mint account (SPL Token), initializes it with your chosen decimals.
- Derives and creates your Associated Token Account (ATA) and mints the initial supply to your ATA.
- Builds and uploads metadata (name, symbol, description, logo URL, tags) using Metaplex Token Metadata.
  - If `VITE_NFT_STORAGE_TOKEN` is set, metadata is uploaded to IPFS via NFT.Storage.
  - Otherwise, a data URI fallback is used.
- If selected, revokes the mint and/or freeze authority in the same transaction for safety.
- Optional vanity search tries to find a mint public key starting or ending with your chosen pattern, up to your max iteration limit.

## Notes and Limits

- Decimals: Typically 0–9 for compatibility. The UI constrains this range.
- Supply: The current mint instruction uses a JavaScript `number` (internally safe up to 9,007,199,254,740,991). If you need a larger supply at high decimals, mint additional tokens later using CLI/server tooling.
- Vanity Search: CPU-intensive; keep iterations modest (5,000–50,000). Larger numbers take longer.
- Wallets: Make sure your wallet network matches the selected cluster.

## Getting API Keys and Addresses

- RPC Providers
  - Helius: Create a key at https://dev.helius.xyz and use `https://rpc.helius.xyz/?api-key=YOUR_KEY`.
  - QuickNode: Create a Solana endpoint at https://www.quicknode.com and paste the HTTPS URL.
  - Triton One: Request access at https://www.triton.one.
  - Ankr: Get a free Solana RPC URL at https://www.ankr.com/rpc/solana.

- NFT.Storage
  - Sign in at https://nft.storage, create a token, and set `VITE_NFT_STORAGE_TOKEN`.

- Service Fee Recipient Address
  - Any valid Solana public key (base58) that will receive service fees, e.g., a wallet you control.

## Troubleshooting

- Missing packages/typings: Run `npm install` again. If TypeScript complains about `Buffer`, ensure `@types/node` is installed (already in devDependencies) and restart the dev server.
- Wallet connection issues: Ensure your wallet extension is installed and the selected cluster matches your wallet network.
- Metadata not visible in explorer: IPFS propagation can take time. Using NFT.Storage token is recommended.

## Development Scripts

- `npm run dev` — Start Vite development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build

## Disclaimer

This repository is provided for educational and demonstration purposes. Always review and audit smart contract interactions and understand implications of revoking authorities before using on mainnet.
