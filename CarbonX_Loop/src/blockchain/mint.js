import { getContract } from "./contract"
import abi from "../abi/carbonCreditsABI.json"

export async function mintCredits(address, amount) {

  const contract = await getContract()

  // Execute the mint transaction on the smart contract
  const tx = await contract.mint(address, amount)

  // Wait for the transaction to be mined/confirmed
  await tx.wait()

  console.log("Mint successful", tx.hash)
  
  // Return the transaction object so the caller can use tx.hash
  return tx
}