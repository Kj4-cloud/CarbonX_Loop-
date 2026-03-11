import { ethers } from "ethers"
import abi from "../abi/carbonCreditABI.json"

const contractAddress = "PASTE_YOUR_CONTRACT_ADDRESS"

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