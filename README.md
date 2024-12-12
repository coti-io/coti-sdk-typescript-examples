> [!WARNING]
> This repository has been deprecated and moved to [coti-typescript-examples](https://github.com/coti-io/coti-typescript-examples)

# COTI V2 Confidentiality Preserving L2 | SDKs and Examples

> [!NOTE]
> Please refer to the latest [tags](https://github.com/coti-io/coti-sdk-typescript-examples/tags) to find the most stable version to use.

All repositories specified below contain smart contracts that implement confidentiality features using the COTI V2 protocol.
The contracts provide examples for various use cases, such as Non-Fungible Tokens (NFTs), ERC20 tokens, Auction, and Identity management.

These contracts demonstrate how to leverage the confidentiality features of the COTI V2 protocol to enhance privacy and security in decentralized applications.
The contracts are of Solidity and can be compiled and deployed using popular development tools like Hardhat and Foundry (Work in progress).

#### Important Links:

[Docs](https://docs.coti.io) | [Devnet Explorer](https://explorer-devnet.coti.io) | [Discord](https://discord.gg/cuCykh8P4m) | [Faucet](https://faucet.coti.io)

Interact with the network using any of the following:

1. [Python SDK](https://github.com/coti-io/coti-sdk-python) | [Python SDK Examples](https://github.com/coti-io/coti-sdk-python-examples)
2. [Typescript SDK](https://github.com/coti-io/coti-sdk-typescript) | [Typescript SDK Examples](https://github.com/coti-io/coti-sdk-typescript-examples)
3. [Hardhat Dev Environment](https://github.com/coti-io/confidentiality-contracts)

The following contracts are available in each of the packages:

| Contract                       |            | python sdk  | hardhat sdk | typescript sdk | Contract Description                                                                                                                          |
|--------------------------------|------------|-------------|-------------|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| `AccountOnboard`               | deployment | ✅ *        | ✅           | ❌              | Onboard a EOA account - During onboard network creates AES unique for that EOA which is used for decrypting values sent back from the network |
| `AccountOnboard`               | execution  | ✅          | ✅           | ✅              | "                                                                                                                                             |
| `ERC20Example`                 | deployment | ✅          | ✅           | ❌              | Confidential ERC20 - deploy and transfer encrypted amount of funds                                                                            |
| `ERC20Example`                 | execution  | ✅          | ✅           | ✅              | "                                                                                                                                             |
| `NFTExample`                   | deployment | ❌          | ✅           | ❌              | Confidential NFT example - saving encrypted data                                                                                              |
| `NFTExample`                   | execution  | ❌          | ✅           | ❌              | "                                                                                                                                             |
| `ConfidentialAuction`          | deployment | ❌          | ✅           | ❌              | Confidential auction - encrypted bid amount                                                                                                   |
| `ConfidentialAuction`          | execution  | ❌          | ✅           | ❌              | "                                                                                                                                             |
| `ConfidentialIdentityRegistry` | deployment | ❌          | ✅           | ❌              | Confidential Identity Registry - Encrypted identity data                                                                                      |
| `ConfidentialIdentityRegistry` | execution  | ❌          | ✅           | ❌              | "                                                                                                                                             |
| `DataOnChain`                  | deployment | ✅          | ❌           | ❌              | Basic encryption and decryption - Good place to start explorining network capabilties                                                         |
| `DataOnChain`                  | execution  | ✅          | ❌           | ✅              | "                                                                                                                                             |
| `Precompile`                   | deployment | ✅          | ✅           | ❌              | Thorough examples of the precompile functionality                                                                                             |
| `Precompile`                   | execution  | ✅          | ✅           | ❌              | "                                                                                                                                             |-              |              

(*) no deployment needed (system contract)

> [!NOTE]  
> Due to the nature of ongoing development, future version might break existing functionality

### Faucet

🤖 To request devnet/testnet funds use our [faucet](https://faucet.coti.io)

# COTI v2 Typescript SDK Examples

> [!NOTE]
> Please refer to the latest [tags](https://github.com/coti-io/coti-sdk-typescript-examples/tags) to find the most stable version to use.

Examples that described above resides in [coti-sdk-typescript/src/examples], the solidity contracts are in the [confidentiality-contracts](https://github.com/coti-io/confidentiality-contracts) repo that is imported as a git submodule.

The following examples are available for **execution**:

| Contract       | Contract Description                                                                                                                          |
|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| AccountOnboard | Onboard a EOA account - During onboard network creates AES unique for that EOA which is used for decrypting values sent back from the network |
| ERC20Example   | Confidential ERC20 - deploy and transfer encrypted amount of funds                                                                            |
| DataOnChain    | Basic encryption and decryption - Good place to start explorining network capabilties                                                         |

## Usage

1.  Clone the Typescript examples repo along with its submodules into your desired location

    ```bash
    git clone --recurse-submodules https://github.com/coti-io/coti-sdk-typescript-examples.git
    ```


2.  Change directory to the newly create one

    ```bash
    cd coti-sdk-typescript-examples
    ```


3.  Install dependencies

    ```bash
    yarn
    ```


> [!NOTE]  
> Ensure your environment meets all the pre-requisites. Visit the [pre-requisites section of the readme](https://github.com/coti-io/coti-sdk-typescript-examples/blob/main/README.md).

### ERC20

The following process will help you run the [**`erc20.ts`**](https://github.com/coti-io/coti-sdk-typescript-examples/blob/main/src/examples/erc20.ts) example from the [**COTI Typescript SDK Examples**](https://github.com/coti-io/coti-sdk-typescript-examples) project. The script includes functions for transferring tokens, approving allowances, and handling confidential transactions. The script uses various utilities from the SDK to manage confidential accounts, decrypt values, and ensure correct balances and allowances during transactions. It will also:

* Create a EOA (Externally Owned Account)
* Validate minimum balance

1.  Run `erc20.ts` script

    ```bash
    yarn erc20
    ```

    \
    Running this test will automatically create an account and a key/value pair with name: `SIGNING_KEY` (visible in the .env file). The script will output something like this:\


    ```bash
    yarn run v1.22.22
    $ ts-node src/main.ts erc20
    ************* Created new account  0x87c13D0f5903a68bE8288E52b23A220CeC6b1aB6  and saved into .env file *************
    /Users/user/projects/coti-sdk-typescript-examples/src/util/onboard.ts:13
          throw new Error(`Please use faucet to fund account ${wallet.address}`)
                ^
    Error: Please use faucet to fund account 0x87c13D0f5903a68bE8288E52b23A220CeC6b1aB6
    ```

    \
    It is normal to receive the exception `Error: Please use faucet to fund account` on the first run. This will be resolved once the account is funded.  

2. Head to the faucet at [**https://faucet.coti.io**](https://faucet.coti.io) to get devnet funds. \
   Send the following message to the BOT using your newly created account, visible in the fourth line of the response `Created new account  0x87c13D0f5903a68bE8288E52b23A220CeC6b1aB6 [...]`\
   \
   `devnet <account address>`\
   \
   The bot will reply with the message:\
   \
   `<username> faucet transferred 5 COTIv2 (devnet)` \
   &#x20;
3.  Run `erc20.ts` script once more

    ```bash
    yarn erc20
    ```

### Data On Chain

The following process will help you run the [**`dataOnChain.ts`**](https://github.com/coti-io/coti-sdk-typescript-examples/blob/main/src/examples/dataOnChain.ts) example from the [**COTI Typescript SDK Examples**](https://github.com/coti-io/coti-sdk-typescript-examples) project. The script includes functions for storing values on-chain that are encrypted using using either your user or the network key, and then reading these encrypted values and attempting to decrypt them using either your key or another users key.

1.  Run `dataOnChain.ts` script

    ```bash
    yarn dataOnChain
    ```


#### Pending enhancements

- Extending examples such as confidential ERC20 minting, confidential NFT (deployment and actions) and more.

#### To report issues, please create a [github issue](https://github.com/coti-io/coti-sdk-typescript/issues)
