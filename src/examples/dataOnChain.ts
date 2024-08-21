import {Wallet} from "@coti-io/coti-ethers"
import {getContract} from "../util/contracts"
import {assert} from "../util/assert"
import {validateTxStatus} from "../util/general-utils";

const gasLimit = 12000000

function getDataOnChainContract(user: Wallet) {
    return getContract("DataOnChain", user)
}

export async function dataOnChainExample(user: Wallet) {
    const contract = getDataOnChainContract(user)
    const value = BigInt(100)
    console.log(`setting network encrypted value: ${value}`)
    await (await contract.setSomeEncryptedValue(value, {gasLimit})).wait()

    const networkEncryptedValue = await contract.getNetworkSomeEncryptedValue()
    console.log(`Network encrypted value: ${networkEncryptedValue}`)
    console.log(`Network decrypted value: ${await user.decryptValue(networkEncryptedValue)}`)

    await (await contract.setUserSomeEncryptedValue({gasLimit})).wait()
    console.log(`setting user encrypted value: ${value}`)

    const userEncryptedValue = await contract.getUserSomeEncryptedValue()
    console.log(`User encrypted value: ${userEncryptedValue}`)
    console.log(`User decrypted value: ${await user.decryptValue(userEncryptedValue)}`)

    const otherWalletSigningKey = process.env.OTHER_WALLET_SIGNING_KEY || Wallet.createRandom().privateKey
    const onBoardInfo = {aesKey: process.env.OTHER_WALLET_AES_KEY}
    const otherWallet = new Wallet(otherWalletSigningKey, null, onBoardInfo)

    console.log(`Other User decrypted value: ${await otherWallet.decryptValue(userEncryptedValue)}`)

    const value2 = BigInt(555)
    await setValueWithEncryptedInput(contract, user, value2)

    await (await contract.add({gasLimit})).wait()

    const encryptedResult = await contract.getUserArithmeticResult()
    const decryptedResult = await user.decryptValue(encryptedResult)
    const expectedResult = value + value2
    assert(
        decryptedResult === expectedResult,
        `Expected addition result to be ${expectedResult}, but got ${decryptedResult}`
    )
    console.log(`User decrypted addition result: ${decryptedResult}`)

    await testUserEncryptedString(contract, user)

}

async function testUserEncryptedString(contract: ReturnType<typeof getDataOnChainContract>,
                                       user: Wallet) {
    const testString = 'test string'
    const func = contract.setSomeEncryptedStringEncryptedInput
    if (!user.getUserOnboardInfo() || !user.getUserOnboardInfo()?.aesKey) {
        await user.generateOrRecoverAes();
        if (!user.getUserOnboardInfo()?.aesKey) {
            throw new Error("Failed to generate or recover AES key.");
        }
    }
    const encryptedString = await user.encryptValue(testString, await contract.getAddress(), func.fragment.selector)


    const ciphertexts = encryptedString.map((val) => val.ciphertext);
    const signatures = encryptedString.map((val) => val.signature);


    let response = await (await contract.setSomeEncryptedStringEncryptedInput(ciphertexts, signatures, {gasLimit})).wait();
    if (!validateTxStatus(response)) {
        throw Error("tx setSomeEncryptedStringEncryptedInput failed")
    }
    response = await (await contract.setUserSomeEncryptedStringEncryptedInput({gasLimit})).wait()
    if (!validateTxStatus(response)) {
        throw Error("tx to setUserSomeEncryptedStringEncryptedInput failed")
    }
    const userEncyData = await contract.getUserSomeEncryptedStringEncryptedInput()
    const decryptedUserString = await user.decryptValue(userEncyData)
    assert(testString === decryptedUserString,
        `Expected test result to be ${testString}, but got ${decryptedUserString}`
    )
    console.log(`user data decrypted successfully - the value is: ${decryptedUserString}`)
}

async function setValueWithEncryptedInput(
    contract: ReturnType<typeof getDataOnChainContract>,
    user: Wallet,
    value: bigint
) {
    console.log(`setting network encrypted value using user encrypted value: ${value}`)
    const func = contract.setSomeEncryptedValueEncryptedInput
    let ct = await user.encryptValue(value.valueOf(), await contract.getAddress(), func.fragment.selector)
    const ciphertexts = ct.map((val) => val.ciphertext);
    const signatures = ct.map((val) => val.signature);

    await (await func(ciphertexts[0], signatures[0], {gasLimit})).wait()


    await (await contract.setUserSomeEncryptedValueEncryptedInput({gasLimit})).wait()

    const userEncryptedValue = await contract.getUserSomeEncryptedValueEncryptedInput()
    const decryptedValue = await user.decryptValue(userEncryptedValue)
    assert(decryptedValue === value, `Expected value to be ${value}, but got ${decryptedValue}`)
    console.log(`User decrypted using user encrypted value: ${decryptedValue}`)
}
