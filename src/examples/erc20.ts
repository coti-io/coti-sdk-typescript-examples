import * as fs from "fs"
import * as path from "path"

import {Provider, Wallet} from "ethers"
import {buildInputText, type ConfidentialAccount, decryptUint} from "@coti-io/coti-sdk-typescript"
import {PrivateToken} from "coti-contracts-examples/typechain-types"
import {deploy} from "../util/contracts"
import {assert} from "../util/assert"

const GAS_LIMIT = 12000000

async function assertBalance(token: PrivateToken, amount: bigint, user: ConfidentialAccount) {
    const ctBalance = await token["balanceOf(address)"](user.wallet.address)
    let balance = decryptUint(ctBalance, user.userKey)
    assert(balance === amount, `Expected balance to be ${amount}, but got ${balance}`)
    return balance
}

async function assertAllowance(
    token: PrivateToken,
    amount: bigint,
    owner: ConfidentialAccount,
    spenderAddress: string
) {
    const ctAllowance = (await token["allowance(address,address)"](owner.wallet.address, spenderAddress))[1]
    let allowance = decryptUint(ctAllowance, owner.userKey)
    assert(allowance === amount, `Expected allowance to be ${amount}, but got ${allowance}`)
}

async function getTokenContract(user: ConfidentialAccount) {
    const privateTokenFilePath = path.join(
        "node_modules",
        "coti-contracts-examples",
        "artifacts",
        "contracts",
        "PrivateToken.sol",
        "PrivateToken.json"
    )

    const privateTokenArtifacts: any = JSON.parse(fs.readFileSync(privateTokenFilePath, "utf8"))

    const contract = await deploy(
        privateTokenArtifacts["abi"],
        privateTokenArtifacts["bytecode"],
        user.wallet,
        ["My Private Token", "PTOK"]
    )

    return contract
}

export async function erc20Example(provider: Provider, user: ConfidentialAccount) {
    const token: PrivateToken = await getTokenContract(user)

    await (
        await token
            .mint(user.wallet.address, 5000n, { gasLimit: GAS_LIMIT })
    ).wait()

    let balance = await assertBalance(token, 5000n, user)

    const otherWallet = new Wallet(Wallet.createRandom(provider).privateKey)

    const transferAmount = 5n

    balance = await transfer(token, balance, user, otherWallet, transferAmount)

    await approve(token, user, otherWallet, transferAmount * 10n)

    balance = await transferFrom(token, balance, user, otherWallet, transferAmount)

}

async function transfer(
    token: PrivateToken,
    initlalBalance: bigint,
    owner: ConfidentialAccount,
    alice: Wallet,
    transferAmount: bigint
) {
    console.log("************* Private transfer ", transferAmount, " from my account to Alice *************")

    const itAmount = await buildInputText(transferAmount, owner, await token.getAddress(), token["transfer(address,(uint256,bytes))"].fragment.selector)

    await (
        await token
            ["transfer(address,(uint256,bytes))"]
            (alice.address, itAmount, { gasLimit: GAS_LIMIT })
    ).wait()

    return await assertBalance(token, initlalBalance - transferAmount, owner)
}

async function approve(
    token: PrivateToken,
    owner: ConfidentialAccount,
    alice: Wallet,
    approveAmount: bigint
) {
    console.log("************* Private approve", approveAmount, " to Alice address *************")

    const itAmount = buildInputText(approveAmount, owner, await token.getAddress(), token["approve(address,(uint256,bytes))"].fragment.selector)

    await (
        await token
            ["approve(address,(uint256,bytes))"]
            (alice.address, itAmount, { gasLimit: GAS_LIMIT })
    ).wait()

    await assertAllowance(token, approveAmount, owner, alice.address)
}

async function transferFrom(
    token: PrivateToken,
    initlalBalance: bigint,
    owner: ConfidentialAccount,
    alice: Wallet,
    transferAmount: bigint
) {
    console.log("************* Private transferFrom ", transferAmount, " from my account to Alice *************")

    const itAmount = await buildInputText(BigInt(transferAmount), owner, await token.getAddress(), token["transferFrom(address,address,(uint256,bytes))"].fragment.selector)
    
    await (
        await token
            ["transferFrom(address,address,(uint256,bytes))"]
            (owner.wallet.address, alice.address, itAmount, { gasLimit: GAS_LIMIT })
    ).wait()

    return await assertBalance(token, initlalBalance - transferAmount, owner)
}
