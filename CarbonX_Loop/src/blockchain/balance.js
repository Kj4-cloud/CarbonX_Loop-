import { getContract } from "./contract"

export async function getCreditBalance(userAddress) {

  const contract = await getContract()

  const balance = await contract.balanceOf(userAddress, 0)

  return balance.toString()
}