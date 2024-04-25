import dotenv from "dotenv"
dotenv.config()

import { setupAccount } from "./util/onboard"
import { getProvider } from "./util/provider"
import { erc20Example } from "./examples/erc20"
import { loadDeployments } from "./util/contracts"

async function main() {
  loadDeployments()
  const provider = getProvider()
  const owner = await setupAccount(provider)
  if (process.argv[2] === "erc20") {
    console.log("Running erc20 example...")
    await erc20Example(provider, owner)
  }
}

main().finally(() => console.log("done"))
