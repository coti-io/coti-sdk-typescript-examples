import { Provider } from "ethers"
import type { ConfidentialAccount } from "../util/onboard"
import { getContract } from "../util/contracts"
import { decryptValue, createRandomUserKey } from "../libs/crypto"
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
  console.log(`Network decripted value: ${decryptValue(networkEncryptedValue, user.userKey)}`)

  await (await contract.setUserSomeEncryptedValue({ gasLimit })).wait()
  console.log(`setting user encrypted value: ${value}`)

  const userEncryptedValue = await contract.getUserSomeEncryptedValue()
  console.log(`User encrypted value: ${userEncryptedValue}`)
  console.log(`User decripted value: ${decryptValue(userEncryptedValue, user.userKey)}`)

  const otherUserKey = createRandomUserKey()
  console.log(`Other User decripted value: ${decryptValue(userEncryptedValue, otherUserKey)}`)

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
  console.log(`User decripted addition result: ${decryptedResult}`)
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
  console.log(`User decripted using user encrypted value: ${decryptValue(userEncryptedValue, user.userKey)}`)
}
