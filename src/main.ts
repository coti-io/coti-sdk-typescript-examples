import dotenv from "dotenv"
import {erc20Example} from "./examples/erc20"
import {loadDeployments} from "./util/contracts"
import {dataOnChainExample} from "./examples/dataOnChain"
import {nativeTransfer} from "./examples/nativeTransfer";
import {setupAccount} from "./util/general-utils";
import {
    initEtherProvider,
    isProviderConnected,
    printAccountDetails,
    printNetworkDetails,
    validateAddress
} from "@coti-io/coti-ethers";


dotenv.config()

async function main() {
    loadDeployments()
    const provider = initEtherProvider();
    if (!await isProviderConnected(provider))
        throw Error('provider not connected')
    await printNetworkDetails(provider)

    const wallet = await setupAccount(provider)
    await printAccountDetails(provider, wallet.address)

    const validAddress = validateAddress(wallet.address)
    if (!validAddress.valid) {
        throw Error('Invalid address')
    }

    if (process.argv[2] === "erc20") {
        console.log("Running erc20 example...")
        await erc20Example(wallet)
    } else if (process.argv[2] === "dataOnChain") {
        console.log("Running dataOnChain example...")
        await dataOnChainExample(wallet)
    } else if (process.argv[2] === "nativeTransfer") {
        console.log("Running nativeTransfer example...")
        await nativeTransfer(wallet)
    } else {
        console.log("No example specified.")
    }
}

main()
