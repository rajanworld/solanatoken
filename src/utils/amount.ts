export function toTokenAmount(humanAmount: string, decimals: number): bigint {
  // Normalize and convert e.g. "123.456" with decimals=6 => 123456000
  const [intPart, fracPartRaw = ''] = humanAmount.trim().split('.')
  if (!/^\d+$/.test(intPart || '0') || (fracPartRaw && !/^\d+$/.test(fracPartRaw))) {
    throw new Error('Invalid supply format. Use numbers like 1000 or 123.45')
  }
  const fracPart = (fracPartRaw + '0'.repeat(decimals)).slice(0, decimals)
  const full = (intPart || '0') + fracPart
  return BigInt(full)
}
