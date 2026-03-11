import { ethers } from "ethers"
import abi from "../abi/carbonCreditsABI.json"

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

export async function getContract() {

  if (!window.ethereum) {
    alert("Please install MetaMask")
    return
  }

  const provider = new ethers.BrowserProvider(window.ethereum)

  await provider.send("eth_requestAccounts", [])

  const signer = await provider.getSigner()

  const contract = new ethers.Contract(
    contractAddress,
    abi,
    signer
  )

  return contract
}