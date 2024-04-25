import { Contract, Provider, Wallet } from "ethers"
import type { User } from "../util/onboard"
import { getContract } from "../util/contracts"
import { assert } from "../util/assert"
import { decryptValue } from "../libs/crypto"

const gasLimit = 12000000

async function assertBalance(token: ReturnType<typeof getTokenContract>, amount: number, user: User) {
  const ctBalance = await token.balanceOf()
  let balance = decryptValue(ctBalance, user.userKey)
  assert(balance === amount)
}

async function assertAllowance(token: ReturnType<typeof getTokenContract>, amount: number, owner: User, spenderAddress: string) {
  const ctAllowance = await token.allowance(owner.wallet.address, spenderAddress)
  let allowance = decryptValue(ctAllowance, owner.userKey)
  assert(allowance === amount)
}

function getTokenContract(user: User) {
  return getContract("ERC20Example", user.wallet)
}

export async function erc20Example(provider: Provider, user: User) {
  const token = getTokenContract(user)
  const otherWallet = new Wallet(Wallet.createRandom(provider).privateKey)

  const initlalBalance = decryptValue(await token.balanceOf(), user.userKey)
  await clearTransfer(token, initlalBalance, user, otherWallet, 5)
}

async function clearTransfer(
  token: ReturnType<typeof getTokenContract>,
  initlalBalance: number,
  owner: User,
  otherAccount: Wallet,
  transferAmount: number
) {
  console.log("************* Transfer clear ", transferAmount, " from my account to Alice *************")

  await (await token["transfer(address,uint64,bool)"](otherAccount.address, transferAmount, true, { gasLimit })).wait()

  await assertBalance(token, initlalBalance - transferAmount, owner)

  await (await token["transfer(address,uint64,bool)"](otherAccount.address, transferAmount, true, { gasLimit })).wait()

  await assertBalance(token, initlalBalance - 2 * transferAmount, owner)
}
