import { Provider } from "ethers"
import { type ConfidentialAccount, decryptValue, createRandomUserKey } from "@coti-io/coti-sdk-core"
import { getContract } from "../util/contracts"
import { assert } from "../util/assert"

const gasLimit = 12000000

function getDataOnChainContract(user: ConfidentialAccount) {
  return getContract("DataOnChain", user.wallet)
}

export async function dataOnChainExample(provider: Provider, user: ConfidentialAccount) {
  const contract = getDataOnChainContract(user)
  const value = 100
  console.log(`setting network encrypted value: ${value}`)
  await (await contract.setSomeEncryptedValue(value, { gasLimit })).wait()

  const networkEncryptedValue = await contract.getNetworkSomeEncryptedValue()
  console.log(`Network encrypted value: ${networkEncryptedValue}`)
  console.log(`Network decrypted value: ${user.decryptValue(networkEncryptedValue)}`)

  await (await contract.setUserSomeEncryptedValue({ gasLimit })).wait()
  console.log(`setting user encrypted value: ${value}`)

  const userEncryptedValue = await contract.getUserSomeEncryptedValue()
  console.log(`User encrypted value: ${userEncryptedValue}`)
  console.log(`User decrypted value: ${user.decryptValue(userEncryptedValue)}`)

  const otherUserKey = createRandomUserKey()
  console.log(`Other User decrypted value: ${decryptValue(userEncryptedValue, otherUserKey)}`)

  const value2 = 555
  await setValueWithEncryptedInput(contract, user, value2)

  await (await contract.add({ gasLimit })).wait()

  const encryptedResult = await contract.getUserArithmeticResult()
  const decryptedResult = user.decryptValue(encryptedResult)
  const expectedResult = value + value2
  assert(
    decryptedResult === expectedResult,
    `Expected addition result to be ${expectedResult}, but got ${decryptedResult}`
  )
  console.log(`User decrypted addition result: ${decryptedResult}`)
}

async function setValueWithEncryptedInput(
  contract: ReturnType<typeof getDataOnChainContract>,
  user: ConfidentialAccount,
  value: number
) {
  console.log(`setting network encrypted value using user encrypted value: ${value}`)
  const func = contract.setSomeEncryptedValueEncryptedInput
  const { ctInt, signature } = await user.encryptValue(value, await contract.getAddress(), func.fragment.selector)

  await (await func(ctInt, signature, { gasLimit })).wait()

  await (await contract.setUserSomeEncryptedValueEncryptedInput({ gasLimit })).wait()

  const userEncryptedValue = await contract.getUserSomeEncryptedValueEncryptedInput()
  const decryptedValue = user.decryptValue(userEncryptedValue)
  assert(decryptedValue === value, `Expected value to be ${value}, but got ${decryptedValue}`)
  console.log(`User decrypted using user encrypted value: ${decryptedValue}`)
}
