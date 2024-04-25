import fs from "fs"
import path from "path"
import { Contract, Interface, ContractRunner } from "ethers"
import type { ERC20Example, AccountOnboard } from "../../confidentiality-contracts/typechain-types"

type DeployedContract = { ERC20Example: ERC20Example; AccountOnboard: AccountOnboard }

const deploymentsDir = "./deployments"
const deployedContracts: Record<string, Contract> = {}

export function loadDeployments() {
  const files = fs.readdirSync(deploymentsDir)
  console.log(`Found ${files.length} deployments -> ${files.join(", ")}`)

  files.map((f) => {
    const { address, abi } = JSON.parse(fs.readFileSync(path.join(deploymentsDir, f), "utf-8"))
    deployedContracts[f.replace(".json", "")] = new Contract(address, Interface.from(JSON.stringify(abi)))
  })

  console.log("Loaded all deployments", Object.keys(deployedContracts))
}

export function getContract<C extends keyof DeployedContract>(name: C, contractRunner: ContractRunner) {
  return deployedContracts[name].connect(contractRunner) as unknown as DeployedContract[C]
}
