import { getAccountBalance, Provider, Wallet } from "@coti-io/coti-ethers"
import {getWallet, setEnvValue} from "./general-utils";

export async function setupAccount(provider: Provider) {
  const wallet = getWallet(provider)
  if (await getAccountBalance(wallet.address, provider) === BigInt("0")) {
    throw new Error(`Please use faucet to fund account ${wallet.address}`)
  }

  const toAccount = async (wallet: Wallet, userKey: string | undefined) => {
    if (userKey) {
      return wallet
    }

    console.log("************* Onboarding user ", wallet.address, " *************")
    await wallet.generateOrRecoverAes()
    console.log("************* Onboarded! created user key and saved into .env file *************")

    setEnvValue("USER_KEY", wallet.getUserOnboardInfo()?.aesKey!)
    return wallet
  }

  return toAccount(wallet, process.env.USER_KEY)
}

