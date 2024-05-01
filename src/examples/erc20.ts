import { Contract, Provider, Wallet } from "ethers"
import type { ConfidentialAccount } from "../util/onboard"
import { getContract } from "../util/contracts"
import { assert } from "../util/assert"
import { decryptValue, prepareIT } from "../libs/crypto"

const gasLimit = 12000000

async function assertBalance(token: ReturnType<typeof getTokenContract>, amount: number, user: ConfidentialAccount) {
  const ctBalance = await token.balanceOf()
  let balance = decryptValue(ctBalance, user.userKey)
  assert(balance === amount, `Expected balance to be ${amount}, but got ${balance}`)
  return balance
}

async function assertAllowance(
  token: ReturnType<typeof getTokenContract>,
  amount: number,
  owner: ConfidentialAccount,
  spenderAddress: string
) {
  const ctAllowance = await token.allowance(owner.wallet.address, spenderAddress)
  let allowance = decryptValue(ctAllowance, owner.userKey)
  assert(allowance === amount, `Expected allowance to be ${amount}, but got ${allowance}`)
}

function getTokenContract(user: ConfidentialAccount) {
  return getContract("ERC20Example", user.wallet)
}

export async function erc20Example(provider: Provider, user: ConfidentialAccount) {
  const token = getTokenContract(user)
  const otherWallet = new Wallet(Wallet.createRandom(provider).privateKey)

  const transferAmount = 5

  let balance = decryptValue(await token.balanceOf(), user.userKey)
  if (balance === 0) {
    await (await token.setBalance(100000000, { gasLimit })).wait()
    balance = await assertBalance(token, 100000000, user)
  }
  balance = await clearTransfer(token, balance, user, otherWallet, transferAmount)
  balance = await confidentialTransfer(token, balance, user, otherWallet, transferAmount)

  await clearTransferFromWithoutAllowance(token, balance, user, otherWallet, transferAmount)
  await clearApprove(token, user, otherWallet, transferAmount * 10)
  balance = await clearTransferFrom(token, balance, user, otherWallet, transferAmount)

  balance = await confidentialTransferFrom(token, balance, user, otherWallet, transferAmount)

  await confidentialApprove(token, user, otherWallet, transferAmount * 10)
}

async function clearTransfer(
  token: ReturnType<typeof getTokenContract>,
  initlalBalance: number,
  owner: ConfidentialAccount,
  alice: Wallet,
  transferAmount: number
) {
  console.log("************* Transfer clear ", transferAmount, " from my account to Alice *************")

  await (await token["transfer(address,uint64,bool)"](alice.address, transferAmount, true, { gasLimit })).wait()

  await assertBalance(token, initlalBalance - transferAmount, owner)

  await (await token["transfer(address,uint64,bool)"](alice.address, transferAmount, true, { gasLimit })).wait()

  return await assertBalance(token, initlalBalance - 2 * transferAmount, owner)
}

async function confidentialTransfer(
  token: ReturnType<typeof getTokenContract>,
  initlalBalance: number,
  owner: ConfidentialAccount,
  alice: Wallet,
  transferAmount: number
) {
  console.log("************* Transfer confidential ", transferAmount, " from my account to Alice *************")

  const func = token["transfer(address,uint256,bytes,bool)"]
  const selector = func.fragment.selector
  const { ctInt, signature } = await prepareIT(BigInt(transferAmount), owner, await token.getAddress(), selector)

  await (await func(alice.address, ctInt, signature, false, { gasLimit })).wait()
  return await assertBalance(token, initlalBalance - transferAmount, owner)
}

async function clearTransferFromWithoutAllowance(
  token: ReturnType<typeof getTokenContract>,
  initlalBalance: number,
  owner: ConfidentialAccount,
  alice: Wallet,
  transferAmount: number
) {
  console.log(
    "************* TransferFrom clear ",
    transferAmount,
    " from my account to Alice (without allowance) *************"
  )

  await (await token.approveClear(alice.address, 0, { gasLimit })).wait()

  const func = token["transferFrom(address,address,uint64,bool)"]
  await (await func(owner.wallet.address, alice.address, transferAmount, true, { gasLimit })).wait()

  return await assertBalance(token, initlalBalance, owner)
}

async function clearApprove(
  token: ReturnType<typeof getTokenContract>,
  owner: ConfidentialAccount,
  alice: Wallet,
  approveAmount: number
) {
  console.log("************* Approve clear ", approveAmount, " to Alice address *************")
  await (await token.approveClear(alice.address, approveAmount, { gasLimit })).wait()
  await assertAllowance(token, approveAmount, owner, alice.address)
}

async function confidentialApprove(
  token: ReturnType<typeof getTokenContract>,
  owner: ConfidentialAccount,
  alice: Wallet,
  approveAmount: number
) {
  console.log("************* Approve confidential ", approveAmount, " to Alice address *************")
  await (await token.approveClear(alice.address, 0, { gasLimit })).wait()
  await assertAllowance(token, 0, owner, alice.address)

  const func = token["approve(address,uint256,bytes)"]
  const selector = func.fragment.selector
  const { ctInt, signature } = await prepareIT(BigInt(approveAmount), owner, await token.getAddress(), selector)
  await (await func(alice.address, ctInt, signature, { gasLimit })).wait()

  await assertAllowance(token, approveAmount, owner, alice.address)
}

async function clearTransferFrom(
  token: ReturnType<typeof getTokenContract>,
  initlalBalance: number,
  owner: ConfidentialAccount,
  alice: Wallet,
  transferAmount: number
) {
  console.log("************* TransferFrom clear ", transferAmount, " from my account to Alice *************")

  const func = token["transferFrom(address,address,uint64,bool)"]
  await (await func(owner.wallet.address, alice.address, transferAmount, true, { gasLimit })).wait()

  return await assertBalance(token, initlalBalance - transferAmount, owner)
}

async function confidentialTransferFrom(
  token: ReturnType<typeof getTokenContract>,
  initlalBalance: number,
  owner: ConfidentialAccount,
  alice: Wallet,
  transferAmount: number
) {
  console.log("************* TransferFrom confidential ", transferAmount, " from my account to Alice *************")

  const func = token["transferFrom(address,address,uint256,bytes,bool)"]
  const selector = func.fragment.selector
  let { ctInt, signature } = await prepareIT(BigInt(transferAmount), owner, await token.getAddress(), selector)
  await (await func(owner.wallet.address, alice.address, ctInt, signature, false, { gasLimit })).wait()

  return await assertBalance(token, initlalBalance - transferAmount, owner)
}
