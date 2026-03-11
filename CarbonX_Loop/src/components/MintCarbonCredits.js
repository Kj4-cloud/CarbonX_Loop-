import { ethers } from "ethers";
import abi from "../abi/carbonCreditABI.json";

const CONTRACT_ADDRESS = "0x4032f564e2783914b8d297a8f850634411fb95ed";

export default function MintCarbonCredits() {

  const mintCredits = async () => {
    try {

      if (!window.ethereum) {
        alert("Install MetaMask");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi,
        signer
      );

      const address = await signer.getAddress();

      const tx = await contract.mint(address, 10);

      await tx.wait();

      alert("Carbon Credits Minted Successfully!");

    } catch (error) {
      console.error(error);
      alert("Transaction failed");
    }
  };

  return (
    <div>
      <button onClick={mintCredits}>
        Mint Carbon Credits
      </button>
    </div>
  );
}