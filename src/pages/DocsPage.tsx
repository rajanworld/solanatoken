import { Box, Heading, Text, Link, List, ListItem, OrderedList, UnorderedList, Code, Divider, Alert, AlertIcon, Stack, SimpleGrid, Button, IconButton, Tooltip, useClipboard, HStack, Card, CardHeader, CardBody, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { ExternalLinkIcon, CopyIcon, LinkIcon } from '@chakra-ui/icons'

const DocsPage = () => {
  const envMainnetNoFees = `# MAINNET (no fees)
VITE_SOLANA_CLUSTER=mainnet-beta
VITE_SOLANA_RPC_URL=https://rpc.helius.xyz/?api-key=YOUR_HELIUS_KEY
VITE_NFT_STORAGE_TOKEN=YOUR_NFT_STORAGE_API_TOKEN
VITE_SERVICE_FEE_RECIPIENT=
VITE_FEE_BASE_LAMPORTS=0
VITE_FEE_REVOKE_MINT_LAMPORTS=0
VITE_FEE_REVOKE_FREEZE_LAMPORTS=0
VITE_FEE_CUSTOM_CREATOR_LAMPORTS=0
VITE_FEE_VANITY_LAMPORTS=0
VITE_SERVICE_FEE_LAMPORTS=0`

  const envDevnet = `# DEVNET (free testing)
VITE_SOLANA_CLUSTER=devnet
VITE_SOLANA_RPC_URL=
VITE_NFT_STORAGE_TOKEN=
VITE_SERVICE_FEE_RECIPIENT=
VITE_FEE_BASE_LAMPORTS=0
VITE_FEE_REVOKE_MINT_LAMPORTS=0
VITE_FEE_REVOKE_FREEZE_LAMPORTS=0
VITE_FEE_CUSTOM_CREATOR_LAMPORTS=0
VITE_FEE_VANITY_LAMPORTS=0
VITE_SERVICE_FEE_LAMPORTS=0`

  const CodeCard = ({ title, content, anchor }: { title: string; content: string; anchor?: string }) => {
    const { onCopy, hasCopied } = useClipboard(content)
    return (
      <Box bg="gray.800" border="1px solid" borderColor="gray.700" p={4} rounded="md" position="relative">
        <HStack justify="space-between" mb={2}>
          <HStack spacing={2}>
            <Text fontWeight="bold">{title}</Text>
            {anchor ? (
              <Tooltip label={`Link to ${title}`}>
                <IconButton
                  as={Link}
                  href={`#${anchor}`}
                  aria-label="section link"
                  icon={<LinkIcon />}
                  size="xs"
                  variant="ghost"
                />
              </Tooltip>
            ) : null}
          </HStack>
          <Tooltip label={hasCopied ? 'Copied' : 'Copy'}>
            <IconButton aria-label="copy" icon={<CopyIcon />} size="sm" onClick={onCopy} />
          </Tooltip>
        </HStack>
        <Box as={Code} display="block" whiteSpace="pre" p={3} borderRadius="md" w="full">{content}</Box>
      </Box>
    )
  }

  const SectionHeading = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <HStack id={id} spacing={2} mb={2} mt={6}>
      <Heading size="md">{children}</Heading>
      <Tooltip label="Copy link">
        <IconButton
          as={Link}
          href={`#${id}`}
          aria-label="anchor"
          icon={<LinkIcon />}
          size="xs"
          variant="ghost"
        />
      </Tooltip>
    </HStack>
  )

  return (
    <Box>
      <Heading size="lg" mb={2}>Solana Token Creator — A to Z Guide</Heading>
      <Text color="gray.300" mb={6}>Simple, step-by-step instructions to configure your environment, connect a wallet, and create a token on Solana.</Text>

      <Box bg="gray.800" border="1px solid" borderColor="gray.700" p={4} rounded="md" mb={8}>
        <Heading size="sm" mb={3}>Quick Links</Heading>
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap={3}>
          <Tooltip label="Install Phantom wallet extension (Solana)"><Button as={Link} href="https://phantom.app/download" isExternal leftIcon={<ExternalLinkIcon />} size="sm" colorScheme="teal" variant="outline">Phantom</Button></Tooltip>
          <Tooltip label="Install Solflare wallet extension (Solana)"><Button as={Link} href="https://solflare.com/download" isExternal leftIcon={<ExternalLinkIcon />} size="sm" colorScheme="teal" variant="outline">Solflare</Button></Tooltip>
          <Tooltip label="MetaMask Snaps overview (adds Solana support via Snap)"><Button as={Link} href="https://docs.metamask.io/snaps/" isExternal leftIcon={<ExternalLinkIcon />} size="sm" colorScheme="purple" variant="outline">MetaMask Snaps</Button></Tooltip>
          <Tooltip label="Step-by-step guide to install the Solana Snap in MetaMask"><Button as={Link} href="https://help.solflare.com/en/articles/9271652-how-to-install-the-solana-snap-on-metamask" isExternal leftIcon={<ExternalLinkIcon />} size="sm" colorScheme="purple" variant="outline">Install Solana Snap</Button></Tooltip>
          <Tooltip label="Create a reliable mainnet RPC endpoint with Helius"><Button as={Link} href="https://dev.helius.xyz/" isExternal leftIcon={<ExternalLinkIcon />} size="sm" colorScheme="blue" variant="outline">Helius (RPC)</Button></Tooltip>
          <Tooltip label="Create a Solana endpoint on QuickNode (managed infra)"><Button as={Link} href="https://www.quicknode.com/chains/solana" isExternal leftIcon={<ExternalLinkIcon />} size="sm" colorScheme="blue" variant="outline">QuickNode (RPC)</Button></Tooltip>
          <Tooltip label="Free Solana RPC endpoint (good to start; upgrade for mainnet reliability)"><Button as={Link} href="https://www.ankr.com/rpc/solana" isExternal leftIcon={<ExternalLinkIcon />} size="sm" colorScheme="blue" variant="outline">Ankr (RPC)</Button></Tooltip>
          <Tooltip label="Enterprise-grade Solana RPC provider"><Button as={Link} href="https://www.triton.one/" isExternal leftIcon={<ExternalLinkIcon />} size="sm" colorScheme="blue" variant="outline">Triton One (RPC)</Button></Tooltip>
          <Tooltip label="Get an API token to upload metadata JSON to IPFS"><Button as={Link} href="https://nft.storage" isExternal leftIcon={<ExternalLinkIcon />} size="sm" colorScheme="orange" variant="outline">NFT.Storage</Button></Tooltip>
          <Tooltip label="Get free SOL on devnet/testnet"><Button as={Link} href="https://faucet.solana.com/" isExternal leftIcon={<ExternalLinkIcon />} size="sm" colorScheme="green" variant="outline">Solana Faucet</Button></Tooltip>
        </SimpleGrid>
      </Box>

      <SectionHeading id="what-you-need">1) What You Need</SectionHeading>
      <UnorderedList>
        <ListItem><b>Browser wallet</b> like Phantom or Solflare. Install the extension and create or import a wallet.</ListItem>
        <ListItem><b>SOL</b> on the network you use. Devnet/testnet are free (use faucets). Mainnet requires real SOL.</ListItem>
        <ListItem><b>Optional RPC URL</b> from a provider for better reliability on mainnet (Helius, QuickNode, Ankr, etc.).</ListItem>
        <ListItem><b>Optional NFT.Storage token</b> to upload metadata (logo/name/description) to IPFS for better explorer support.</ListItem>
      </UnorderedList>

      <SectionHeading id="choose-network">2) Choose Your Network</SectionHeading>
      <Text>There are three Solana clusters (networks):</Text>
      <UnorderedList>
        <ListItem><b>devnet</b> — free test network. Recommended for learning.</ListItem>
        <ListItem><b>testnet</b> — technical testing network.</ListItem>
        <ListItem><b>mainnet-beta</b> — real network with real SOL.</ListItem>
      </UnorderedList>

      <SectionHeading id="configure-env">3) Configure the .env File</SectionHeading>
      <Text>Open <Code>.env</Code> in the project root. If it doesn't exist, copy <Code>.env.example</Code> to <Code>.env</Code>.</Text>

      <Card bg="gray.800" border="1px solid" borderColor="gray.700" mt={4}>
        <CardHeader pb={0}>
          <Heading size="sm">Environment Examples</Heading>
          <Text color="gray.400">Switch between Mainnet and Devnet. Use the copy button to paste into your <Code>.env</Code>.</Text>
        </CardHeader>
        <CardBody>
          <Tabs variant="enclosed-colored" colorScheme="teal">
            <TabList>
              <Tab>Mainnet (no fees)</Tab>
              <Tab>Devnet (free)</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <CodeCard title="Mainnet (no fees)" content={envMainnetNoFees} anchor="mainnet-env" />
              </TabPanel>
              <TabPanel>
                <CodeCard title="Devnet (free testing)" content={envDevnet} anchor="devnet-env" />
              </TabPanel>
            </TabPanels>
          </Tabs>
          <Alert status="info" mt={4} borderRadius="md">
            <AlertIcon />
            After you edit <Code>.env</Code>, stop and restart the dev server so changes take effect.
          </Alert>
        </CardBody>
      </Card>

      <Heading size="sm" mt={6} mb={1}>Best links for this step (where to go and why)</Heading>
      <UnorderedList>
        <ListItem>
          <b>RPC for mainnet:</b> {" "}
          <Link href="https://dev.helius.xyz/" isExternal>Helius</Link> (high reliability, rich features), {" "}
          <Link href="https://www.quicknode.com/chains/solana" isExternal>QuickNode</Link> (popular, managed infra), {" "}
          <Link href="https://www.ankr.com/rpc/solana" isExternal>Ankr</Link> (free tier), {" "}
          <Link href="https://www.triton.one/" isExternal>Triton One</Link> (enterprise-grade). Use a paid/reliable RPC on mainnet to avoid rate-limits.
        </ListItem>
        <ListItem>
          <b>NFT.Storage token:</b> {" "}
          <Link href="https://nft.storage/" isExternal>nft.storage</Link> → Sign up → Create API token. Ensures your token metadata is stored on IPFS so explorers can display your logo/name/description.
        </ListItem>
        <ListItem>
          <b>Devnet/Testnet SOL:</b> {" "}
          <Link href="https://faucet.solana.com/" isExternal>Official Solana Faucet</Link> for free SOL on devnet/testnet.
        </ListItem>
      </UnorderedList>

      <SectionHeading id="get-rpc">3.1) Get an RPC URL (Step by step)</SectionHeading>
      <Text mb={3}>Pick one provider below and follow the steps to get an HTTPS RPC URL. Then paste it into your <Code>.env</Code> as <Code>VITE_SOLANA_RPC_URL</Code>.</Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <Card bg="gray.800" border="1px solid" borderColor="gray.700">
          <CardHeader pb={1}>
            <Heading size="sm">Helius (recommended)</Heading>
          </CardHeader>
          <CardBody pt={1}>
            <OrderedList spacing={1}>
              <ListItem>Open <Link href="https://dev.helius.xyz/" isExternal>dev.helius.xyz</Link> and sign in.</ListItem>
              <ListItem>Click <b>Create API Key</b> → choose <b>Solana</b> and <b>Mainnet</b>.</ListItem>
              <ListItem>Copy the HTTPS RPC URL that looks like: <Code>https://rpc.helius.xyz/?api-key=YOUR_KEY</Code></ListItem>
              <ListItem>Paste into your <Code>.env</Code>:</ListItem>
            </OrderedList>
            <Box mt={2}>
              <CodeCard title="Env line" content={`VITE_SOLANA_RPC_URL=https://rpc.helius.xyz/?api-key=YOUR_KEY`} />
            </Box>
          </CardBody>
        </Card>

        <Card bg="gray.800" border="1px solid" borderColor="gray.700">
          <CardHeader pb={1}>
            <Heading size="sm">QuickNode</Heading>
          </CardHeader>
          <CardBody pt={1}>
            <OrderedList spacing={1}>
              <ListItem>Go to <Link href="https://www.quicknode.com/chains/solana" isExternal>QuickNode</Link> and sign in.</ListItem>
              <ListItem>Create a <b>Solana</b> endpoint for <b>Mainnet</b>.</ListItem>
              <ListItem>In the endpoint page, copy the <b>HTTPS</b> Provider URL (not WebSocket).</ListItem>
              <ListItem>Paste into your <Code>.env</Code>:</ListItem>
            </OrderedList>
            <Box mt={2}>
              <CodeCard title="Env line" content={`VITE_SOLANA_RPC_URL=https://YOUR-QUICKNODE-ENDPOINT`} />
            </Box>
          </CardBody>
        </Card>

        <Card bg="gray.800" border="1px solid" borderColor="gray.700">
          <CardHeader pb={1}>
            <Heading size="sm">Ankr (free tier)</Heading>
          </CardHeader>
          <CardBody pt={1}>
            <OrderedList spacing={1}>
              <ListItem>Open <Link href="https://www.ankr.com/rpc/solana" isExternal>Ankr Solana RPC</Link>.</ListItem>
              <ListItem>Copy the provided HTTPS RPC URL.</ListItem>
              <ListItem>Free tier may be rate-limited on mainnet; consider upgrading for production.</ListItem>
              <ListItem>Paste into your <Code>.env</Code>:</ListItem>
            </OrderedList>
            <Box mt={2}>
              <CodeCard title="Env line" content={`VITE_SOLANA_RPC_URL=https://rpc.ankr.com/solana`} />
            </Box>
          </CardBody>
        </Card>

        <Card bg="gray.800" border="1px solid" borderColor="gray.700">
          <CardHeader pb={1}>
            <Heading size="sm">Triton One</Heading>
          </CardHeader>
          <CardBody pt={1}>
            <OrderedList spacing={1}>
              <ListItem>Go to <Link href="https://www.triton.one/" isExternal>Triton One</Link> and request access or sign in.</ListItem>
              <ListItem>Create a Solana endpoint for <b>Mainnet</b>.</ListItem>
              <ListItem>Copy the HTTPS RPC URL from the dashboard.</ListItem>
              <ListItem>Paste into your <Code>.env</Code>:</ListItem>
            </OrderedList>
            <Box mt={2}>
              <CodeCard title="Env line" content={`VITE_SOLANA_RPC_URL=https://YOUR-TRITON-ENDPOINT`} />
            </Box>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Heading size="md" mt={6} mb={2}>4) What Each Setting Means</Heading>
      <UnorderedList>
        <ListItem><Code>VITE_SOLANA_CLUSTER</Code>: Which network to use — <Code>devnet</Code>, <Code>testnet</Code>, or <Code>mainnet-beta</Code>.</ListItem>
        <ListItem><Code>VITE_SOLANA_RPC_URL</Code>: Optional RPC endpoint. Use a provider on mainnet for reliability.</ListItem>
        <ListItem><Code>VITE_NFT_STORAGE_TOKEN</Code>: Optional API token from <Link href="https://nft.storage" isExternal>nft.storage</Link> to upload metadata to IPFS.</ListItem>
        <ListItem><Code>VITE_SERVICE_FEE_RECIPIENT</Code>: Optional address to receive service fees. Leave blank for no fees.</ListItem>
        <ListItem><Code>VITE_FEE_*</Code>: Optional fees in lamports (1 SOL = 1,000,000,000 lamports). Set to 0 to disable.</ListItem>
      </UnorderedList>

      <Heading size="md" mt={6} mb={2}>5) Connect Your Wallet</Heading>
      <Text mb={2}>You can use a Solana wallet (Phantom/Solflare) or MetaMask with the Solana Snap.</Text>
      <Heading size="sm" mt={3} mb={1}>Option A: Phantom or Solflare (recommended)</Heading>
      <OrderedList>
        <ListItem>Open the app in your browser (development: the URL printed by <Code>npm run dev</Code>).</ListItem>
        <ListItem>Click the <b>Connect Wallet</b> button (top-right) and choose Phantom or Solflare.</ListItem>
        <ListItem>In your wallet, switch the network to match your <Code>VITE_SOLANA_CLUSTER</Code> (e.g., mainnet-beta).</ListItem>
      </OrderedList>

      <Heading size="sm" mt={4} mb={1}>Option B: MetaMask (Solana Snap)</Heading>
      <UnorderedList>
        <ListItem><b>Install MetaMask</b> if you don’t have it yet.</ListItem>
        <ListItem><b>Install the Solana Snap</b> in MetaMask:
          <UnorderedList>
            <ListItem>Follow the official guide: <Link href="https://help.solflare.com/en/articles/9271652-how-to-install-the-solana-snap-on-metamask" isExternal>Solflare Help: Install Solana Snap</Link></ListItem>
            <ListItem>Learn more about Snaps: <Link href="https://docs.metamask.io/snaps/" isExternal>MetaMask Snaps docs</Link></ListItem>
          </UnorderedList>
        </ListItem>
        <ListItem><b>Restart the app</b> after installing the Snap.</ListItem>
        <ListItem>Our app automatically registers MetaMask via Wallet Standard. Now, click <b>Connect Wallet</b> and choose MetaMask.</ListItem>
        <ListItem>Approve any Snap connection prompts in MetaMask. Ensure your cluster matches your goal (devnet/mainnet-beta).</ListItem>
      </UnorderedList>

      <Heading size="md" mt={6} mb={2}>6) Fill in Token Information</Heading>
      <UnorderedList>
        <ListItem><b>Name</b>: Display name (max 30).</ListItem>
        <ListItem><b>Symbol</b>: Short ticker (max 10), like <Code>USDT</Code>.</ListItem>
        <ListItem><b>Decimals</b>: How divisible your token is (0–9 recommended).</ListItem>
        <ListItem><b>Supply</b>: Amount of tokens minted at creation (goes to your wallet).</ListItem>
        <ListItem><b>Logo URL</b>: Direct link to your image (PNG/JPG/SVG). If you set <Code>VITE_NFT_STORAGE_TOKEN</Code>, the metadata is uploaded to IPFS.</ListItem>
        <ListItem><b>Description</b> and <b>Tags</b>: Extra information about your token.</ListItem>
      </UnorderedList>

      <Heading size="md" mt={6} mb={2}>7) Safety Options</Heading>
      <UnorderedList>
        <ListItem><b>Revoke Mint Authority</b>: Prevents minting more tokens later. Good for fixed supply tokens.</ListItem>
        <ListItem><b>Revoke Freeze Authority</b>: Prevents freezing accounts. Increases trust for buyers.</ListItem>
        <ListItem><b>Immutable</b>: Locks metadata updates. Use when you’re confident the metadata is final.</ListItem>
      </UnorderedList>

      <Heading size="md" mt={6} mb={2}>8) Personalization</Heading>
      <UnorderedList>
        <ListItem><b>Custom Creator</b>: Replace the default creator with a specific public key in metadata.</ListItem>
        <ListItem><b>Claim a Custom Address (Vanity)</b>: Try to generate a mint address starting/ending with your pattern. Higher iterations take longer.</ListItem>
      </UnorderedList>

      <Heading size="md" mt={6} mb={2}>9) Create the Token</Heading>
      <OrderedList>
        <ListItem>Make sure you have enough SOL for fees (and any configured service fees).</ListItem>
        <ListItem>Click <b>Create Token</b>. Approve the transaction in your wallet.</ListItem>
        <ListItem>When done, you’ll see your mint address, your associated token account, and the transaction link.</ListItem>
      </OrderedList>

      <Heading size="md" mt={6} mb={2}>Safety Checklist (especially for mainnet)</Heading>
      <UnorderedList>
        <ListItem><b>Start on devnet</b> first. Make sure everything works before switching to mainnet-beta.</ListItem>
        <ListItem><b>Double-check addresses</b> in any prompts. Never approve unknown or suspicious requests.</ListItem>
        <ListItem><b>Service fees</b>: Leave <Code>VITE_SERVICE_FEE_RECIPIENT</Code> blank and all <Code>VITE_FEE_*</Code> values as <Code>0</Code> if you don’t want to send any SOL to a third party.</ListItem>
        <ListItem><b>Mint supply</b>: Verify decimals and supply are correct. Fixed supply requires revoking mint authority.</ListItem>
        <ListItem><b>Metadata</b>: Prefer NFT.Storage to ensure explorers display your logo and info reliably.</ListItem>
        <ListItem><b>Wallet address style:</b> Solana addresses are base58 (e.g., ES21...UcEg). Ethereum addresses start with 0x. Ensure you are approving requests for the correct chain and account.</ListItem>
      </UnorderedList>

      <Heading size="md" mt={6} mb={2}>10) View and Share</Heading>
      <UnorderedList>
        <ListItem>Click the explorer links shown to view your token and the transaction.</ListItem>
        <ListItem>Share the mint address with others. They can add the token to their wallet using the mint address.</ListItem>
      </UnorderedList>

      <Divider my={6} />

      <Heading size="md" mt={6} mb={2}>FAQs</Heading>
      <UnorderedList>
        <ListItem><b>What is an RPC URL?</b> A gateway for your app to talk to the Solana network. Paid providers are more reliable on mainnet.</ListItem>
        <ListItem><b>Do I need NFT.Storage?</b> No, but it helps explorers display your logo/metadata properly.</ListItem>
        <ListItem><b>Why revoke authorities?</b> It marks your token as safer (fixed supply, not freezable) in many DEX scanners.</ListItem>
        <ListItem><b>Can I mint more later?</b> Only if you didn’t revoke the mint authority at creation time.</ListItem>
        <ListItem><b>I changed .env and nothing happened?</b> Restart the dev server so Vite reloads environment variables.</ListItem>
      </UnorderedList>

      <Heading size="md" mt={6} mb={2}>Useful Links</Heading>
      <UnorderedList>
        <ListItem><Link href="https://solana.com/docs" isExternal>Solana Docs</Link></ListItem>
        <ListItem><Link href="https://spl.solana.com/token" isExternal>SPL Token Program</Link></ListItem>
        <ListItem><Link href="https://explorer.solana.com" isExternal>Solana Explorer</Link></ListItem>
        <ListItem><Link href="https://nft.storage" isExternal>NFT.Storage</Link></ListItem>
        <ListItem><Link href="https://www.quicknode.com" isExternal>QuickNode</Link>, <Link href="https://dev.helius.xyz" isExternal>Helius</Link>, <Link href="https://www.ankr.com/rpc/solana" isExternal>Ankr</Link></ListItem>
        <ListItem><Link href="https://help.solflare.com/en/articles/9271652-how-to-install-the-solana-snap-on-metamask" isExternal>How to install Solana Snap on MetaMask</Link></ListItem>
        <ListItem><Link href="https://www.quicknode.com/guides/solana-development/wallets/metamask" isExternal>QuickNode: Connect MetaMask to Solana dApps</Link></ListItem>
      </UnorderedList>

      <Alert status="warning" mt={6} borderRadius="md">
        <AlertIcon />
        Mainnet uses real SOL. Always double-check addresses and options before approving transactions.
      </Alert>
    </Box>
  )
}

export default DocsPage
