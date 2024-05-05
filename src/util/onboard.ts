import fs from "fs"
import { ConfidentialAccount } from "@coti-io/coti-sdk-typescript"
import { Wallet, Provider } from "ethers"

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

  const toAccount = async (wallet: Wallet, userKey: string | undefined) => {
    if (userKey) {
      return new ConfidentialAccount(wallet, userKey)
    }

    console.log("************* Onboarding user ", wallet.address, " *************")
    const account = await ConfidentialAccount.onboard(wallet)
    console.log("************* Onboarded! created user key and saved into .env file *************")

    setEnvValue("USER_KEY", account.userKey)
    return account
  }

  return toAccount(wallet, process.env.USER_KEY)
}

function setEnvValue(key: string, value: string) {
  fs.appendFileSync("./.env", `\n${key}=${value}`, "utf8")
}
