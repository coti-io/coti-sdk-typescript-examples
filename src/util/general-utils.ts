import {Provider, Wallet} from "ethers";
import fs from "fs";
import {getEoa} from "@coti-io/coti-sdk-typescript";

export async function getWallet(provider: Provider) {
    const signingKey = process.env.SIGNING_KEY
    if (!signingKey) {
        const wallet = Wallet.createRandom(provider)

        setEnvValue("SIGNING_KEY", `${wallet.privateKey}`)
        console.log("************* Created new account ", wallet.address, " and saved into .env file *************")

        throw new Error(`Please use faucet to fund account ${wallet.address}`)
    }
    const eoa = await getEoa(signingKey)
    console.log(`Eoa Created from provided key is: ${eoa}`)
    return new Wallet(signingKey, provider)
}

export function setEnvValue(key: string, value: string) {
    fs.appendFileSync("./.env", `\n${key}=${value}`, "utf8")
}

export function validateTxStatus(tx: any) {
    return tx?.status === 1
}