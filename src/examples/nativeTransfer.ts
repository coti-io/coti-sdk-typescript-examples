import {getNativeBalance, initEtherProvider, transferNative, Wallet} from "@coti-io/coti-ethers";

export async function nativeTransfer(wallet: Wallet) {
    const otherWallet = new Wallet()
    const transferAmount = BigInt(1000000000000000000)
    const gasUnit = 21000
    const defaultProvider = wallet.provider || initEtherProvider()
    console.log(await getNativeBalance(defaultProvider, wallet.address))
    try {
        const response = await transferNative(defaultProvider, wallet, otherWallet.address, transferAmount, gasUnit)
        console.log(response)
    } catch (e) {
        console.error(e)
    }

}
