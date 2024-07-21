import {Provider, Wallet} from "ethers";
import {getNativeBalance, transferNative} from "@coti-io/coti-sdk-typescript";
import {getWallet} from "../util/general-utils";

export async function nativeTransfer(provider: Provider) {
    const wallet = await getWallet(provider)
    const otherWallet = new Wallet(Wallet.createRandom(provider).privateKey)
    const transferAmount = BigInt(1000000000000000000)
    const gasUnit = 21000

    console.log(await getNativeBalance(provider, wallet.address))
    try {
        const response = await transferNative(provider, wallet, otherWallet.address, transferAmount, gasUnit)
        console.log(response)
    } catch (e) {
        console.error(e)
    }

}