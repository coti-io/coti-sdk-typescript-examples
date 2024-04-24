import fs from "fs"
import path from "path"
import { Contract, ContractRunner } from "ethers"

type DeployedContract = {
  address: string
  abi: unknown[]
}
type DeployedContractName = "ERC20Example" | "AccountOnBoard"

const deploymentsDir = "./deployments"
const deployedContracts: Record<string, Contract> = {}

export function loadDeployments() {
  const files = fs.readdirSync(deploymentsDir)
  console.log(`Found ${files.length} deployments -> ${files.join(", ")}`)

  files.map((f) => {
    const { address, abi } = JSON.parse(fs.readFileSync(path.join(deploymentsDir, f), "utf-8")) as DeployedContract
    deployedContracts[f.replace(".json", "")] = new Contract(address, JSON.stringify(abi))
  })

  console.log("Loaded all deployments", Object.keys(deployedContracts))
}

export function getContract(name: DeployedContractName, contractRunner: ContractRunner) {
  return deployedContracts[name].connect(contractRunner)
}
