import { getContract } from "./contract"

export async function mintCredits(address, amount) {

  const contract = await getContract()

  const tx = await contract.mint(address, amount)

  await tx.wait()

  console.log("Mint successful")
}