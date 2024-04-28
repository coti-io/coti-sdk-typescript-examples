import { Provider } from "ethers"
import type { User } from "../util/onboard"
import { getContract } from "../util/contracts"
import { decryptValue, createRandomUserKey } from "../libs/crypto"

const gasLimit = 12000000

function getDataOnChainContract(user: User) {
  return getContract("DataOnChain", user.wallet)
}

export async function dataOnChainExample(provider: Provider, user: User) {
  const contract = getDataOnChainContract(user)
  const value = 100
  console.log(`setting network encrypted value: ${value}`)
  await (await contract.setSomeEncryptedValueOf(value, { gasLimit })).wait()

  const networkEncryptedValue = await contract.getNetworkSomeEncryptedValueOf()
  console.log(`Network encrypted value: ${networkEncryptedValue}`)
  console.log(`Network decripted value: ${decryptValue(networkEncryptedValue, user.userKey)}`)

  await (await contract.setUserSomeEncryptedValueOf({ gasLimit })).wait()
  console.log(`setting user encrypted value: ${value}`)

  const userEncryptedValue = await contract.getUserSomeEncryptedValueOf()
  console.log(`User encrypted value: ${userEncryptedValue}`)
  console.log(`User decripted value: ${decryptValue(userEncryptedValue, user.userKey)}`)

  const otherUserKey = createRandomUserKey()
  console.log(`Other User decripted value: ${decryptValue(userEncryptedValue, otherUserKey)}`)
}
