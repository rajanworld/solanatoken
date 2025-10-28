const cluster = (import.meta.env.VITE_SOLANA_CLUSTER || 'devnet') as string

function clusterParam() {
  if (cluster === 'mainnet-beta' || cluster === 'mainnet') return ''
  return `?cluster=${cluster}`
}

export function explorerAddressUrl(address: string) {
  return `https://explorer.solana.com/address/${address}${clusterParam()}`
}

export function explorerTxUrl(sig: string) {
  return `https://explorer.solana.com/tx/${sig}${clusterParam()}`
}
