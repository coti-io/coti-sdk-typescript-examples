import * as fs from "fs"
import * as path from "path"

import {Provider} from "ethers"
import {
    buildStringInputText,
    type ConfidentialAccount,
    decryptString,
    decryptUint,
    generateAesKey
} from "@coti-io/coti-sdk-typescript"
import {assert} from "../util/assert"
import {validateTxStatus} from "../util/general-utils";
import { deploy } from "../util/contracts"
import { DataOnChain } from "coti-contracts-examples/typechain-types"

const GAS_LIMIT = 12000000

async function getDataOnChainContract(user: ConfidentialAccount) {
    const dataOnChainFilePath = path.join(
        "node_modules",
        "coti-contracts-examples",
        "artifacts",
        "contracts",
        "DataOnChain.sol",
        "DataOnChain.json"
    )

    const dataOnChainArtifacts: any = JSON.parse(fs.readFileSync(dataOnChainFilePath, "utf8"))

    const contract = await deploy(
        dataOnChainArtifacts["abi"],
        dataOnChainArtifacts["bytecode"],
        user.wallet,
        []
    )

    return contract
}

export async function dataOnChainExample(provider: Provider, user: ConfidentialAccount) {
    const contract: DataOnChain = await getDataOnChainContract(user)
    const value = 100n
    console.log(`setting network encrypted value: ${value}`)
    await (await contract.setSomeEncryptedValue(value, { gasLimit: GAS_LIMIT })).wait()

    const networkEncryptedValue = await contract.getNetworkSomeEncryptedValue()
    console.log(`Network encrypted value: ${networkEncryptedValue}`)
    console.log(`Network decrypted value: ${user.decryptUint(networkEncryptedValue)}`)

    await (await contract.setUserSomeEncryptedValue({ gasLimit: GAS_LIMIT })).wait()
    console.log(`setting user encrypted value: ${value}`)

    const userEncryptedValue = await contract.getUserSomeEncryptedValue()
    console.log(`User encrypted value: ${userEncryptedValue}`)
    console.log(`User decrypted value: ${user.decryptUint(userEncryptedValue)}`)

    const otherUserKey = generateAesKey()
    console.log(`Other User decrypted value: ${decryptUint(userEncryptedValue, otherUserKey)}`)

    const value2 = 555n
    await setValueWithEncryptedInput(contract, user, value2)

    await (await contract.add({ gasLimit: GAS_LIMIT })).wait()

    const encryptedResult = await contract.getUserArithmeticResult()
    const decryptedResult = user.decryptUint(encryptedResult)
    const expectedResult = value + value2
    assert(
        decryptedResult === expectedResult,
        `Expected addition result to be ${expectedResult}, but got ${decryptedResult}`
    )
    console.log(`User decrypted addition result: ${decryptedResult}`)

    await testUserEncryptedString(contract, user)

}

async function testUserEncryptedString(
    contract: DataOnChain,
    user: ConfidentialAccount
) {
    const testString = 'test string'
    const func = contract.setSomeEncryptedStringEncryptedInput
    const encryptedString = await buildStringInputText(testString, user, await contract.getAddress(), func.fragment.selector)
    let response = await (await contract.setSomeEncryptedStringEncryptedInput(encryptedString, {gasLimit: GAS_LIMIT})).wait()
    if (!validateTxStatus(response)) {
        throw Error("tx setSomeEncryptedStringEncryptedInput failed")
    }
    response = await (await contract.setUserSomeEncryptedStringEncryptedInput({ gasLimit: GAS_LIMIT })).wait()
    if (!validateTxStatus(response)) {
        throw Error("tx to setUserSomeEncryptedStringEncryptedInput failed")
    }
    const userEncyData = await contract.getUserSomeEncryptedStringEncryptedInput()
    const decryptedUserString: string = decryptString(userEncyData, user.userKey)
    assert(testString === decryptedUserString,
        `Expected test result to be ${testString}, but got ${decryptedUserString}`
    )
    console.log(`user data decrypted successfully - the value is: ${decryptedUserString}`)
}

async function setValueWithEncryptedInput(
    contract: DataOnChain,
    user: ConfidentialAccount,
    value: bigint
) {
    console.log(`setting network encrypted value using user encrypted value: ${value}`)
    const func = contract.setSomeEncryptedValueEncryptedInput
    const itValue = user.encryptUint(value.valueOf(), await contract.getAddress(), func.fragment.selector)

    await (await func(itValue, { gasLimit: GAS_LIMIT })).wait()

    await (await contract.setUserSomeEncryptedValueEncryptedInput({ gasLimit: GAS_LIMIT })).wait()

    const userEncryptedValue = await contract.getUserSomeEncryptedValueEncryptedInput()
    const decryptedValue = user.decryptUint(userEncryptedValue)
    assert(decryptedValue === value, `Expected value to be ${value}, but got ${decryptedValue}`)
    console.log(`User decrypted using user encrypted value: ${decryptedValue}`)
}
