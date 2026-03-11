import { getContract } from "./contract"
import abi from "../abi/carbonCreditsABI.json"

export async function mintCredits(address, amount) {

  const contract = await getContract()

  const tx = await contract.mint(address, amount)

  await tx.wait()

  console.log("Mint successful")
}