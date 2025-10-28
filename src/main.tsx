import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import { SolanaProvider } from '@/solana/SolanaProvider'
import App from './App'
import '@solana/wallet-adapter-react-ui/styles.css'
import { initializeWhenDetected } from '@solflare-wallet/metamask-wallet-standard'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
})

// Register MetaMask (Solana Snap) with Wallet Standard when MetaMask is detected in the browser.
// This enables MetaMask to show up in the Wallet Adapter modal after the Solana Snap is installed.
initializeWhenDetected()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <BrowserRouter>
        <SolanaProvider>
          <App />
        </SolanaProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
)
