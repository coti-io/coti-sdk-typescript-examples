import {Provider, Wallet} from "ethers";
import fs from "fs";

export function getWallet(provider: Provider) {
    if (!process.env.SIGNING_KEY) {
        const wallet = Wallet.createRandom(provider)

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