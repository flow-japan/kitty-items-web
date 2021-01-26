export function fmtPrice(balance, tokenName = '') {
  if (balance == null) return null
  return [
    String(balance).replace(/0+$/, "").replace(/\.$/, ""),
    tokenName,
  ]
    .filter(Boolean)
    .join(" ")
}
