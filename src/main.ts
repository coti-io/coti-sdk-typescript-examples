import dotenv from "dotenv"
dotenv.config()

import { getDefaultProvider } from "@coti-io/coti-sdk-typescript"
import { setupAccount } from "./util/onboard"
import { erc20Example } from "./examples/erc20"
import { loadDeployments } from "./util/contracts"
import { dataOnChainExample } from "./examples/dataOnChain"

async function main() {
  loadDeployments()
  const provider = getDefaultProvider()
  const owner = await setupAccount(provider)
  if (process.argv[2] === "erc20") {
    console.log("Running erc20 example...")
    await erc20Example(provider, owner)
  } else if (process.argv[2] === "dataOnChain") {
    console.log("Running dataOnChain example...")
    await dataOnChainExample(provider, owner)
  } else {
    console.log("No example specified.")
  }
}

main()
