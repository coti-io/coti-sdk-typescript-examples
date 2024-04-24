import type { User } from "../util/onboard"
import { getContract } from "../util/contract"

export async function erc20Example(user: User) {
  const token = getContract("ERC20Example", user.wallet)

  console.log("name: ", await token.getFunction("name")())
}
