import fs from "fs"
import path from "path"
import { glob } from "glob"
import { Wallet, parseEther, keccak256, Contract, ContractFactory } from "ethers"
const solc = require('solc')

const contractsDir = "./confidentiality-contracts/contracts"
const deploymentsDir = "./deployments"

const loadedContracts = {}
const deployedContracts = {}

async function sources(path: string) {
  return await glob(`**/**.sol`, { dotRelative: true, cwd: path })
}

async function localPathToSourceName(projectRoot: string, localFileAbsolutePath: string): Promise<string> {
  const relativePath = path.relative(projectRoot, localFileAbsolutePath)
  // const normalized = normalizeSourceName(relativePath);

  // if (normalized.startsWith("..")) {
  //   throw new HardhatError(ERRORS.SOURCE_NAMES.EXTERNAL_AS_LOCAL, {
  //     path: localFileAbsolutePath,
  //   });
  // }

  // if (normalized.includes(NODE_MODULES)) {
  //   throw new HardhatError(ERRORS.SOURCE_NAMES.NODE_MODULES_AS_LOCAL, {
  //     path: localFileAbsolutePath,
  //   });
  // }

  return relativePath
}

async function loadContracts() {
  console.log(contractsDir)
  const sourcePaths: string[] = await sources(contractsDir)
  console.log(sourcePaths)
  //   const sourceNames: string[] = await localPathToSourceName(TASK_COMPILE_SOLIDITY_GET_SOURCE_NAMES, {
  //     rootPath,
  //     sourcePaths,
  //   })
}

export async function loadDeployments() {
  await loadContracts()
}

// async function deploy(owner: Wallet) {
//   const factory = await ContractFactory("GetUserKey", owner)
//   const contract = await factory.connect(owner).deploy({ gasLimit: 12000000 })
//   return contract.waitForDeployment()
// }
