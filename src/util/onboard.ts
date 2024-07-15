import {ConfidentialAccount, getAccountBalance} from "@coti-io/coti-sdk-typescript/"
import { Wallet, Provider } from "ethers"
import {getWallet, setEnvValue} from "./general-utils";

export async function setupAccount(provider: Provider) {
  const wallet = getWallet(provider)
  if (await getAccountBalance(wallet.address, provider) === BigInt("0")) {
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

