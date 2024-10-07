import dotenv from "dotenv"
import {setupAccount} from "./util/onboard"
import {erc20Example} from "./examples/erc20"
import {
    initEtherProvider,
    isProviderConnected,
    printAccountDetails,
    printNetworkDetails,
    validateAddress
} from "@coti-io/coti-sdk-typescript/dist/ethers_utils";
import {nativeTransfer} from "./examples/nativeTransfer";
import { dataOnChainExample } from "./examples/dataOnChain";
import { onChainDatabaseExample } from "./examples/onChainDatabase";

dotenv.config()

async function main() {
    const provider = initEtherProvider();
    if (!await isProviderConnected(provider))
        throw Error('provider not connected')
    await printNetworkDetails(provider)

    const owner = await setupAccount(provider)
    await printAccountDetails(provider, owner.wallet.address)

    const validAddress = await validateAddress(owner.wallet.address)
    if (!validAddress.valid) {
        throw Error('Invalid address')
    }

    if (process.argv[2] === "erc20") {
        console.log("Running erc20 example...")
        await erc20Example(provider, owner)
    } else if (process.argv[2] === "dataOnChain") {
        console.log("Running dataOnChain example...")
        await dataOnChainExample(provider, owner)
    } else if (process.argv[2] === "nativeTransfer") {
        console.log("Running nativeTransfer example...")
        await nativeTransfer(provider)
    } else if (process.argv[2] === "onChainDatabase") {
        console.log("Running onChainDatabase example...")
        await onChainDatabaseExample(provider, owner)
    } else {
        console.log("No example specified.")
    }
}

main()
