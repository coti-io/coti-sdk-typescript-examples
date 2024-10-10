import {itUint, Provider, Wallet} from "@coti-io/coti-ethers"
import {getContract} from "../util/contracts"
import {assert} from "../util/assert"

const gasLimit = 12000000

async function assertBalance(token: ReturnType<typeof getTokenContract>, amount: number, user: Wallet) {
    const ctBalance = await token.balanceOf()
    let balance = Number(await user.decryptValue(ctBalance))
    assert(balance === amount, `Expected balance to be ${amount}, but got ${balance}`)
    return balance
}

async function assertAllowance(
    token: ReturnType<typeof getTokenContract>,
    amount: number,
    owner: Wallet,
    spenderAddress: string
) {
    const ctAllowance = await token.allowance(owner.address, spenderAddress)
    let allowance = Number(await owner.decryptValue(ctAllowance))
    assert(allowance === amount, `Expected allowance to be ${amount}, but got ${allowance}`)
}

function getTokenContract(user: Wallet) {
    return getContract("ERC20Example", user)
}

export async function erc20Example(provider: Provider, user: Wallet) {
    const token = getTokenContract(user)
    const otherWallet = new Wallet(Wallet.createRandom(provider).privateKey)

    const transferAmount = 5

    let balance = Number(await user.decryptValue(await token.balanceOf()))
    if (balance === 0) {
        await (await token.setBalance(100000000, {gasLimit})).wait()
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
    owner: Wallet,
    alice: Wallet,
    transferAmount: number
) {
    console.log("************* Transfer clear ", transferAmount, " from my account to Alice *************")

    await (await token["transfer(address,uint64,bool)"](alice.address, transferAmount, true, {gasLimit})).wait()

    await assertBalance(token, initlalBalance - transferAmount, owner)

    await (await token["transfer(address,uint64,bool)"](alice.address, transferAmount, true, {gasLimit})).wait()

    return await assertBalance(token, initlalBalance - 2 * transferAmount, owner)
}

async function confidentialTransfer(
    token: ReturnType<typeof getTokenContract>,
    initlalBalance: number,
    owner: Wallet,
    alice: Wallet,
    transferAmount: number
) {
    console.log("************* Transfer confidential ", transferAmount, " from my account to Alice *************")

    const func = token["transfer(address,uint256,bytes,bool)"]
    const selector = func.fragment.selector
    const {ciphertext, signature} = await owner.encryptValue(BigInt(transferAmount), await token.getAddress(), selector) as itUint

    await (await func(alice.address, ciphertext, signature, false, {gasLimit})).wait()
    return await assertBalance(token, initlalBalance - transferAmount, owner)
}

async function clearTransferFromWithoutAllowance(
    token: ReturnType<typeof getTokenContract>,
    initlalBalance: number,
    owner: Wallet,
    alice: Wallet,
    transferAmount: number
) {
    console.log(
        "************* TransferFrom clear ",
        transferAmount,
        " from my account to Alice (without allowance) *************"
    )

    await (await token.approveClear(alice.address, 0, {gasLimit})).wait()

    const func = token["transferFrom(address,address,uint64,bool)"]
    await (await func(owner.address, alice.address, transferAmount, true, {gasLimit})).wait()

    return await assertBalance(token, initlalBalance, owner)
}

async function clearApprove(
    token: ReturnType<typeof getTokenContract>,
    owner: Wallet,
    alice: Wallet,
    approveAmount: number
) {
    console.log("************* Approve clear ", approveAmount, " to Alice address *************")
    await (await token.approveClear(alice.address, approveAmount, {gasLimit})).wait()
    await assertAllowance(token, approveAmount, owner, alice.address)
}

async function confidentialApprove(
    token: ReturnType<typeof getTokenContract>,
    owner: Wallet,
    alice: Wallet,
    approveAmount: number
) {
    console.log("************* Approve confidential ", approveAmount, " to Alice address *************")
    await (await token.approveClear(alice.address, 0, {gasLimit})).wait()
    await assertAllowance(token, 0, owner, alice.address)

    const func = token["approve(address,uint256,bytes)"]
    const selector = func.fragment.selector
    const {ciphertext, signature} = await await owner.encryptValue(BigInt(approveAmount), await token.getAddress(), selector) as itUint
    await (await func(alice.address, ciphertext, signature, {gasLimit})).wait()

    await assertAllowance(token, approveAmount, owner, alice.address)
}

async function clearTransferFrom(
    token: ReturnType<typeof getTokenContract>,
    initlalBalance: number,
    owner: Wallet,
    alice: Wallet,
    transferAmount: number
) {
    console.log("************* TransferFrom clear ", transferAmount, " from my account to Alice *************")

    const func = token["transferFrom(address,address,uint64,bool)"]
    await (await func(owner.address, alice.address, transferAmount, true, {gasLimit})).wait()

    return await assertBalance(token, initlalBalance - transferAmount, owner)
}

async function confidentialTransferFrom(
    token: ReturnType<typeof getTokenContract>,
    initlalBalance: number,
    owner: Wallet,
    alice: Wallet,
    transferAmount: number
) {
    console.log("************* TransferFrom confidential ", transferAmount, " from my account to Alice *************")

    const func = token["transferFrom(address,address,uint256,bytes,bool)"]
    const selector = func.fragment.selector
    let {ciphertext, signature} = await owner.encryptValue(BigInt(transferAmount), await token.getAddress(), selector) as itUint
    await (await func(owner.address, alice.address, ciphertext, signature, false, {gasLimit})).wait()

    return await assertBalance(token, initlalBalance - transferAmount, owner)
}
