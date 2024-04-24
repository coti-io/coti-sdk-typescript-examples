import { ethers } from "ethers"

const DEVNET_URL = "https://devnet.coti.io"

export function getProvider() {
  return new ethers.JsonRpcProvider(DEVNET_URL)
}
