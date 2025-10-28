import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'
import { Buffer } from 'buffer'
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  AuthorityType,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { uploadOrBuildMetadataUri } from '@/solana/metadata'
import type { TokenFormValues } from '@/types'

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
)

export type CreateTokenResult = {
  mint: PublicKey
  ata: PublicKey
  txSig: string
}

export async function createSplToken(
  connection: Connection,
  wallet: WalletContextState,
  values: TokenFormValues
): Promise<CreateTokenResult> {
  if (!wallet.publicKey) throw new Error('Connect wallet')

  // Optional service fee transfer (base + selected features)
  const feeRecipientRaw = import.meta.env.VITE_SERVICE_FEE_RECIPIENT as string | undefined
  const feeRecipient = feeRecipientRaw && isValidPubkey(feeRecipientRaw) ? new PublicKey(feeRecipientRaw) : null
  const totalFeeLamports = computeTotalFeeLamports(values)

  // 1) Optional vanity address generation
  const mintKeypair = await findVanityKeypair({
    prefix: values.vanityPrefix,
    suffix: values.vanitySuffix,
    caseSensitive: values.vanityCaseSensitive,
    maxIterations: values.vanityMaxIterations || 0,
  })

  const payer = wallet.publicKey
  const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE)

  const tx = new Transaction()

  // Optional service fee transfer first (if configured)
  if (totalFeeLamports && totalFeeLamports > 0 && feeRecipient) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: feeRecipient,
        lamports: totalFeeLamports,
      })
    )
  }

  // 2) Create the mint account
  tx.add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    })
  )

  // 3) Initialize mint with decimals and authorities (payer is mint & freeze authority initially)
  tx.add(
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      values.decimals,
      payer, // mint authority = wallet
      payer, // freeze authority (revoked later if selected)
      TOKEN_PROGRAM_ID
    )
  )

  // 4) Create associated token account for the payer
  const ata = await getAssociatedTokenAddress(
    mintKeypair.publicKey,
    payer,
    false
  )

  tx.add(
    createAssociatedTokenAccountInstruction(
      payer,
      ata,
      payer,
      mintKeypair.publicKey
    )
  )

  // 5) Mint initial supply to payer's ATA
  const amount = parseAmountToNumber(values.supply, values.decimals)
  tx.add(
    createMintToInstruction(
      mintKeypair.publicKey,
      ata,
      payer,
      amount
    )
  )

  // 6) Create metadata account
  const creators = [
    {
      address: (values.customCreator && isValidPubkey(values.customCreator)
        ? new PublicKey(values.customCreator)
        : payer
      ).toBase58(),
      share: 100,
    },
  ]

  const metadataUri = await uploadOrBuildMetadataUri({
    name: values.name,
    symbol: values.symbol,
    description: values.description,
    image: values.logoUrl,
    tags: values.tags,
    creators,
  })

  const [metadataPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  )

  const { createCreateMetadataAccountV3Instruction } = await import(
    '@metaplex-foundation/mpl-token-metadata'
  )

  const name = values.name.slice(0, 32)
  const symbol = values.symbol.slice(0, 10)
  const uri = metadataUri

  tx.add(
    createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPda,
        mint: mintKeypair.publicKey,
        mintAuthority: payer,
        payer,
        updateAuthority: payer,
        systemProgram: SystemProgram.programId,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name,
            symbol,
            uri,
            sellerFeeBasisPoints: 0,
            creators: creators.map((c) => ({ address: new PublicKey(c.address), share: c.share, verified: false })),
            collection: null,
            uses: null,
          },
          isMutable: !values.immutable,
          collectionDetails: null,
        },
      }
    )
  )

  // 7) Optional revoke authorities
  if (values.revokeMintAuthority) {
    tx.add(
      createSetAuthorityInstruction(
        mintKeypair.publicKey,
        payer,
        AuthorityType.MintTokens,
        null // revoke (set to null)
      )
    )
  }
  if (values.revokeFreezeAuthority) {
    tx.add(
      createSetAuthorityInstruction(
        mintKeypair.publicKey,
        payer,
        AuthorityType.FreezeAccount,
        null // revoke (set to null)
      )
    )
  }

  // 8) Sign and send
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
  tx.recentBlockhash = blockhash
  tx.feePayer = payer

  let sig: string
  if (wallet.sendTransaction) {
    // Preferred path: let the wallet handle sending. Provide the mint signer explicitly.
    try {
      sig = await wallet.sendTransaction(tx, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        signers: [mintKeypair],
        maxRetries: 3,
      } as any)
    } catch (e: any) {
      const msg = String(e?.message || e)
      const alreadyProcessed = msg.toLowerCase().includes('already been processed') || msg.toLowerCase().includes('alreadyprocessed')
      if (alreadyProcessed) {
        // Refresh blockhash and retry once
        const again = await connection.getLatestBlockhash('confirmed')
        tx.recentBlockhash = again.blockhash
        tx.feePayer = payer
        sig = await wallet.sendTransaction(tx, connection, {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          signers: [mintKeypair],
          maxRetries: 3,
        } as any)
      } else {
        throw e
      }
    }
  } else if (wallet.signTransaction) {
    // Fallback path: sign locally with wallet and send via RPC
    tx.partialSign(mintKeypair)
    const signedTx = await wallet.signTransaction(tx)
    try {
      sig = await connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: false, maxRetries: 3 })
    } catch (e: any) {
      const msg = String(e?.message || e)
      const alreadyProcessed = msg.toLowerCase().includes('already been processed') || msg.toLowerCase().includes('alreadyprocessed')
      if (alreadyProcessed) {
        // Rebuild blockhash and resend (new signature will be generated)
        const again = await connection.getLatestBlockhash('confirmed')
        tx.recentBlockhash = again.blockhash
        tx.feePayer = payer
        tx.partialSign(mintKeypair)
        const reSigned = await wallet.signTransaction(tx)
        sig = await connection.sendRawTransaction(reSigned.serialize(), { skipPreflight: false, maxRetries: 3 })
      } else {
        throw e
      }
    }
  } else {
    throw new Error('Wallet does not support sending or signing transactions')
  }

  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed')

  return { mint: mintKeypair.publicKey, ata, txSig: sig }
}

function parseAmountToNumber(human: string, decimals: number): number {
  const [intPart, fracPartRaw = ''] = human.trim().split('.')
  if (!/^\d+$/.test(intPart || '0') || (fracPartRaw && !/^\d+$/.test(fracPartRaw))) {
    throw new Error('Invalid supply format. Use numbers like 1000 or 123.45')
  }
  const fracPart = (fracPartRaw + '0'.repeat(decimals)).slice(0, decimals)
  const full = (intPart || '0') + fracPart
  const asBig = BigInt(full)
  const max = BigInt(Number.MAX_SAFE_INTEGER)
  if (asBig > max) {
    throw new Error(`Supply too large for current toolchain. Max safe amount with ${decimals} decimals is ${Number.MAX_SAFE_INTEGER}`)
  }
  return Number(asBig)
}

function isValidPubkey(s: string): boolean {
  try {
    new PublicKey(s)
    return true
  } catch {
    return false
  }
}

type VanityOptions = {
  prefix?: string
  suffix?: string
  caseSensitive?: boolean
  maxIterations: number // 0 disables vanity
}

export async function findVanityKeypair(opts: VanityOptions): Promise<Keypair> {
  const { prefix, suffix, caseSensitive, maxIterations } = opts
  if (!prefix && !suffix) return Keypair.generate()
  if (!maxIterations || maxIterations <= 0) return Keypair.generate()

  const p = (prefix || '').trim()
  const s = (suffix || '').trim()
  const normalize = (x: string) => (caseSensitive ? x : x.toLowerCase())
  const targetPrefix = normalize(p)
  const targetSuffix = normalize(s)

  let i = 0
  while (true) {
    i++
    const kp = Keypair.generate()
    const base58 = kp.publicKey.toBase58()
    const value = normalize(base58)
    const okPrefix = targetPrefix ? value.startsWith(targetPrefix) : true
    const okSuffix = targetSuffix ? value.endsWith(targetSuffix) : true
    if (okPrefix && okSuffix) return kp

    if (i >= maxIterations) return kp // give up safely
    if (i % 200 === 0) await new Promise((r) => setTimeout(r, 0)) // yield to UI
  }
}

function computeTotalFeeLamports(values: TokenFormValues): number {
  const base = num(import.meta.env.VITE_FEE_BASE_LAMPORTS) ?? num(import.meta.env.VITE_SERVICE_FEE_LAMPORTS) ?? 0
  const revokeMint = values.revokeMintAuthority ? num(import.meta.env.VITE_FEE_REVOKE_MINT_LAMPORTS) ?? 0 : 0
  const revokeFreeze = values.revokeFreezeAuthority ? num(import.meta.env.VITE_FEE_REVOKE_FREEZE_LAMPORTS) ?? 0 : 0
  const customCreator = values.customCreator ? num(import.meta.env.VITE_FEE_CUSTOM_CREATOR_LAMPORTS) ?? 0 : 0
  const vanity = (values.vanityPrefix || values.vanitySuffix) && values.vanityMaxIterations > 0
    ? num(import.meta.env.VITE_FEE_VANITY_LAMPORTS) ?? 0
    : 0
  return base + revokeMint + revokeFreeze + customCreator + vanity
}

function num(x: string | undefined): number | undefined {
  if (!x) return undefined
  const n = Number(x)
  return Number.isFinite(n) ? n : undefined
}
