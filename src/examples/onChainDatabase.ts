import * as fs from "fs"
import * as path from "path"

import { ConfidentialAccount } from "@coti-io/coti-sdk-typescript"
import { Provider, Wallet } from "ethers"
import { deploy } from "../util/contracts"
import { OnChainDatabase } from "coti-contracts-examples/typechain-types"

async function getOnChainDatabaseContract(user: ConfidentialAccount) {
    const onChainDatabaseFilePath = path.join(
        "node_modules",
        "coti-contracts-examples",
        "artifacts",
        "contracts",
        "OnChainDatabase.sol",
        "OnChainDatabase.json"
    )

    const onChainDatabaseArtifacts: any = JSON.parse(fs.readFileSync(onChainDatabaseFilePath, "utf8"))

    const contract = await deploy(
        onChainDatabaseArtifacts["abi"],
        onChainDatabaseArtifacts["bytecode"],
        user.wallet,
        []
    )

    return contract
}

async function allowAllUsersAllOperations(owner: ConfidentialAccount, onChainDatabase: OnChainDatabase) {
    console.log("Sending tx to allow all users to execute all operations.")
    
    const condition = {
        caller: "0x0000000000000000000000000000000000000001", // used to represent all addresses
        operation: "*",
        active: true,
        timestampBefore: "0",
        timestampAfter: "0",
        falseKey: false,
        trueKey: false,
        uintParameter: "0",
        addressParameter: owner.wallet,
        stringParameter: ""
    }

    let tx = await onChainDatabase
        .connect(owner.wallet as Wallet)
        .setPermission(condition)
    
    await tx.wait()

    console.log("Tx " + tx.hash + " confirmed. \n")
}

async function writeEncryptedTestItem(owner: ConfidentialAccount, onChainDatabase: OnChainDatabase) {
    console.log("Writing encrypted test item to the database.")

    const itValue = await owner.encryptUint(
        123,
        await onChainDatabase.getAddress(),
        onChainDatabase.setItem.fragment.selector
    )

    const tx = await onChainDatabase
        .connect(owner.wallet)
        .setItem("test_value", itValue, { gasLimit: 15000000 })
    
    await tx.wait()

    console.log("Tx " + tx.hash + " confirmed. \n")
}

async function readEncryptedTestItem(otherAccount: ConfidentialAccount, onChainDatabase: OnChainDatabase) {
    console.log("Reading encrypted test item from the database.")

    const tx = await onChainDatabase
        .connect(otherAccount.wallet)
        .getItem("test_value", { gasLimit: 15000000 });

    const result = await tx.wait()

    const encryptedValue = (result?.logs[0] as any)['args'][1]

    console.log("Encrypted test value: " + encryptedValue)

    const decryptedValue = otherAccount.decryptUint(encryptedValue)

    console.log("Decrypted test_value: " + decryptedValue + "\n")
}

async function readClearOilUsdPrice(otherAccount: ConfidentialAccount, onChainDatabase: OnChainDatabase) {
    console.log("Reading clear Oil/USD price.")

    const tx = await onChainDatabase
        .connect(otherAccount.wallet as Wallet)
        .getClearOilUsdPrice()
    
    const res = await tx.wait()

    const clearValue = (res?.logs[0] as any)['args'][1]

    console.log("Oil/USD price: " + clearValue)
}

export async function onChainDatabaseExample(provider: Provider, user: ConfidentialAccount) {
    const onChainDatabase: OnChainDatabase = await getOnChainDatabaseContract(user)

    await allowAllUsersAllOperations(user, onChainDatabase) // we first make sure all users are allowed to execute all operations

    await writeEncryptedTestItem(user, onChainDatabase)

    // await readEncryptedTestItem(otherAccount, onChainDatabase)

    // await readClearOilUsdPrice(otherAccount, onChainDatabase)
}