import { Box, Container, Flex, Heading, Spacer, Text, Badge, Link as ChakraLink, HStack, Button } from '@chakra-ui/react'
import { Link, Route, Routes } from 'react-router-dom'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import TokenForm from '@/components/TokenForm'
import TokenPage from '@/pages/TokenPage'
import DocsPage from '@/pages/DocsPage'

const cluster = (import.meta.env.VITE_SOLANA_CLUSTER || 'devnet') as string

export default function App() {
  return (
    <Box minH="100vh" bgGradient="linear(to-b, gray.900, gray.800)">
      <Container maxW="5xl" py={6}>
        <Flex align="center" gap={4}>
          <Heading size="md">
            <Link to="/">Solana Token Creator</Link>
          </Heading>
          <Badge colorScheme={cluster === 'mainnet-beta' ? 'green' : cluster === 'testnet' ? 'purple' : 'blue'}>
            {cluster}
          </Badge>
          <Spacer />
          <HStack spacing={4}>
            <ChakraLink as={Link} to="/docs" color="teal.300">Docs</ChakraLink>
            <WalletMultiButton />
          </HStack>
        </Flex>
        <Text mt={2} color="gray.300">
          Create and mint SPL Tokens on Solana with metadata, supply, and safety options. Test for free on devnet/testnet.
        </Text>
        <Box mt={8}>
          <Routes>
            <Route path="/" element={<TokenForm />} />
            <Route path="/token/:mint" element={<TokenPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="*" element={<Text>Page not found. Go <ChakraLink as={Link} to="/" color="teal.300">home</ChakraLink>.</Text>} />
          </Routes>
        </Box>
      </Container>
    </Box>
  )
}
