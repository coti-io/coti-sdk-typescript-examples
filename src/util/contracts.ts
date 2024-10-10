import fs from "fs"
import path from "path"
import { Contract, Interface, ContractRunner } from "@coti-io/coti-ethers"
import type { ERC20Example, AccountOnboard, DataOnChain } from "../../confidentiality-contracts/typechain-types"

type DeployedContract = { ERC20Example: ERC20Example; AccountOnboard: AccountOnboard; DataOnChain: DataOnChain }

const deploymentsDir = "./deployments"
const deployedContracts: Record<string, Contract> = {}

export function loadDeployments() {
  const files = fs.readdirSync(deploymentsDir)

  files.map((f) => {
    const { address, abi } = JSON.parse(fs.readFileSync(path.join(deploymentsDir, f), "utf-8"))
    deployedContracts[f.replace(".json", "")] = new Contract(address, Interface.from(JSON.stringify(abi)))
  })
}

export function getContract<C extends keyof DeployedContract>(name: C, contractRunner: ContractRunner) {
  return deployedContracts[name].connect(contractRunner) as unknown as DeployedContract[C]
}
