import { FC, PropsWithChildren, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'

export const SolanaProvider: FC<PropsWithChildren> = ({ children }) => {
  const cluster = (import.meta.env.VITE_SOLANA_CLUSTER || 'devnet') as string
  const rpcUrl = (import.meta.env.VITE_SOLANA_RPC_URL || '') as string

  const network: WalletAdapterNetwork =
    cluster === 'mainnet-beta'
      ? WalletAdapterNetwork.Mainnet
      : cluster === 'testnet'
      ? WalletAdapterNetwork.Testnet
      : WalletAdapterNetwork.Devnet

  const isBrowser = typeof window !== 'undefined'
  const host = isBrowser ? window.location.hostname : ''
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
  const origin = isBrowser ? window.location.origin : ''
  const endpoint = rpcUrl
    || (cluster === 'mainnet-beta' && isLocalhost ? `${origin}/solana` : clusterApiUrl(network))

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  )

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
