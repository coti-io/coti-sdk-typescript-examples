import fs from "fs"
import { Wallet, keccak256, Provider } from "ethers"
import { generateRSAKeyPair, decryptRSA, sign } from "../libs/crypto"
import { getContract } from "./contracts"

export type User = Awaited<ReturnType<typeof setupAccount>>

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
  return { wallet, userKey }
}

async function onboard(user: Wallet) {
  const contract = getContract("AccountOnboard", user)
  const { publicKey, privateKey } = generateRSAKeyPair()

  const signedEK = sign(keccak256(publicKey), user.privateKey)
  await (await contract.getFunction("OnboardAccount")(publicKey, signedEK, { gasLimit: 12000000 })).wait()
  const event = await contract.queryFilter(contract.filters.AccountOnboarded(user.address))
  // @ts-ignore
  const encryptedKey = event[0].args.userKey
  const buf = Buffer.from(encryptedKey.substring(2), "hex")
  return decryptRSA(privateKey, buf).toString("hex")
}

function setEnvValue(key: string, value: string) {
  fs.appendFileSync("./.env", `\n${key}=${value}`, "utf8")
}
