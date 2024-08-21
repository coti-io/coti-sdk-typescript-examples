import {Provider} from "ethers";
import {Wallet} from "@coti-io/coti-ethers"
import fs from "fs";
import {getAccountBalance} from "@coti-io/coti-sdk-typescript";

export async function setupAccount(provider: Provider) {
    const wallet = getWallet(provider)
    if (await getAccountBalance(wallet.address, provider) === BigInt("0")) {
        throw new Error(`Please use faucet to fund account ${wallet.address}`)
    }
    const userKey = process.env.USER_KEY
    if (userKey) {
        wallet.setAesKey(userKey)
    } else {
        await wallet.generateOrRecoverAes()
        if (!wallet.getUserOnboardInfo()?.aesKey)
            throw new Error(`failed to create user key for wallet: ${wallet.address}`)
        else
            setEnvValue("USER_KEY", `${wallet.getUserOnboardInfo()?.aesKey}`)
    }
    return wallet
}

export function getWallet(provider: Provider) {
    if (!process.env.SIGNING_KEY) {
        const wallet = new Wallet(undefined, provider)

        setEnvValue("SIGNING_KEY", `${wallet.privateKey}`)
        console.log("************* Created new account ", wallet.address, " and saved into .env file *************")

        throw new Error(`Please use faucet to fund account ${wallet.address}`)
    }
    return new Wallet(process.env.SIGNING_KEY, provider)
}

export function setEnvValue(key: string, value: string) {
    fs.appendFileSync("./.env", `\n${key}=${value}`, "utf8")
}

export function validateTxStatus(tx: any) {
    return tx?.status === 1
}
