import fs from "fs"
import { Wallet, HDNodeWallet, keccak256, Provider, BaseWallet } from "ethers"
import { generateRSAKeyPair, decryptRSA, sign, decryptValue, prepareIT } from "../libs/crypto"
import { getContract } from "./contracts"

export class ConfidentialAccount {
  constructor(readonly wallet: BaseWallet, readonly userKey: string) {}

  public decryptValue(amount: bigint) {
    return decryptValue(amount, this.userKey)
  }

  public encryptValue(plaintext: bigint | number, contractAddress: string, functionSelector: string) {
    return prepareIT(BigInt(plaintext), this, contractAddress, functionSelector)
  }
}

export async function setupAccount(provider: Provider) {
  const getWallet = () => {
    if (!process.env.SIGNING_KEY) {
      const wallet = Wallet.createRandom(provider)

      setEnvValue("SIGNING_KEY", `${wallet.privateKey}`)
      console.log("************* Created new account ", wallet.address, " and saved into .env file *************")

      throw new Error(`Please use faucet to fund account ${wallet.address}`)
    }

    return new Wallet(process.env.SIGNING_KEY, provider)
  }

  const wallet = getWallet()
  if ((await provider.getBalance(wallet.address)) === BigInt("0")) {
    throw new Error(`Please use faucet to fund account ${wallet.address}`)
  }

  const createUserKey = async (wallet: Wallet) => {
    console.log("************* Onboarding user ", wallet.address, " *************")
    const userKey = await onboard(wallet)
    console.log("************* Onboarded! created user key and saved into .env file *************")

    setEnvValue("USER_KEY", userKey)
    return userKey
  }

  const userKey = process.env.USER_KEY ? process.env.USER_KEY : await createUserKey(wallet)
  return new ConfidentialAccount(wallet, userKey)
}

async function onboard(user: Wallet | HDNodeWallet) {
  const contract = getContract("AccountOnboard", user)
  const { publicKey, privateKey } = generateRSAKeyPair()

  const signedEK = sign(keccak256(publicKey), user.privateKey)
  const receipt = await (await contract.OnboardAccount(publicKey, signedEK, { gasLimit: 12000000 })).wait()
  if (!receipt || !receipt.logs || !receipt.logs[0]) {
    throw new Error("failed to onboard, receipt or receipt.logs or receipt.logs[0] is undefined")
  }
  const log = receipt.logs[0]
  const eventFragment = contract.interface.getEvent("AccountOnboarded")
  const decodedEvent = contract.interface.decodeEventLog(eventFragment, log.data, log.topics)
  const encryptedKey = decodedEvent.userKey
  const buf = Buffer.from(encryptedKey.substring(2), "hex")
  return decryptRSA(privateKey, buf).toString("hex")
}

function setEnvValue(key: string, value: string) {
  fs.appendFileSync("./.env", `\n${key}=${value}`, "utf8")
}
