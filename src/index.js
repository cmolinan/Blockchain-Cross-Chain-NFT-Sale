import './style.css';
import { BigNumber, Contract, providers, ethers, utils } from "ethers";


window.ethers = ethers;

var provider, signer, account;
var usdcTkContract, miPrTokenContract, nftTknContract, pubSContract;

// REQUIRED
// Conectar con metamask
function initSCs() {
  provider = new providers.Web3Provider(window.ethereum);

  // Importar ABI
  var nftTknAbi = require("../artifacts/contracts/NFT.sol/MiPrimerNft.json").abi;
  var miPrimerTknAbi = require("../artifacts/contracts/MiPrimerToken.sol/MiPrimerToken.json").abi;  
  var usdcTknAbi = require("../artifacts/contracts/USDCoin.sol/USDCoin.json").abi;
  var publicSaleAbi = require("../artifacts/contracts/PublicSale.sol/PublicSale.json").abi; 

  var nftTknAdd = "0x9e03a5f5447af8A0Df23F663a86EcDf62aC1B571";
  var miPrTknAdd = "0xb428ca84e6B8EE3237306349bf5c388c1f4E86e1";
  var usdcAddress = "0xCF66961da28482626a0481CD8ca489aF6F6d9E71";
  var pubSContractAdd = "0xC680831a80b32a3332512638498d108C4cAE0B1F";
  

  nftTknContract = new Contract(nftTknAdd, nftTknAbi, provider);
  miPrTokenContract = new Contract(miPrTknAdd, miPrimerTknAbi, provider);
  usdcTkContract = new Contract(usdcAddress, usdcTknAbi, provider);
  pubSContract = new Contract(pubSContractAdd, publicSaleAbi, provider);
  
}


// OPTIONAL
// No require conexion con Metamask
// Usar JSON-RPC
// Se pueden escuchar eventos de los contratos usando el provider con RPC
// function initSCsMumbai() {
//   var nftAddress;
//   nftTknContract; // = new Contract...
// }

function setUpListeners() {
  // Connect to Metamask

  var bttn = document.getElementById("connect");
  bttn.addEventListener("click", async function () {
    if (window.ethereum) {
      document.getElementById("account").innerHTML = "";
      [account] = await ethereum.request({
        method: "eth_requestAccounts",
      });
      
      
      console.log("Billetera metamask", account);

      provider = new providers.Web3Provider(window.ethereum);
      signer = provider.getSigner(account);
      window.signer = signer;

      document.getElementById("account").innerHTML = account;
    }
  });
  
  //Balance of USDCoin
  var usdcBalanceBtn = document.getElementById("usdcUpdate");
  var usdcValuePrint = document.getElementById("usdcBalance");

  usdcBalanceBtn.addEventListener("click", async function () {  
    try {
      usdcValuePrint.innerText = "";
      var res = await usdcTkContract.balanceOf(account);
      var value = ethers.utils.formatUnits(res, 6);
      console.log(value);
      usdcValuePrint.innerText = value;

    } catch (error) {
      console.log(error.reason);
    }
  });

  //Balance of MiPrimerToken
  var mptknBalanceBtn = document.getElementById("miPrimerTknUpdate");
  var mptknValuePrint = document.getElementById("miPrimerTknBalance");
  mptknBalanceBtn.addEventListener("click", async function () {
    try {
      mptknValuePrint.innerText = "";
      var res = await miPrTokenContract.balanceOf(account);
      var value = ethers.utils.formatUnits(res, 18);
      console.log(value);
      mptknValuePrint.innerText = value;

    } catch (error) {
      console.log(error.reason);
    }
  });

  // Approve MiPrimerToken
  var approveErr = document.getElementById("approveError");
  var approveBtn = document.getElementById("approveButton");
  
  approveErr.innerText ="(amount with 18 decimals!)";

  approveBtn.addEventListener("click", async function () {
    
    var valueForApproveInp = document.getElementById("approveInput");
    if (valueForApproveInp.value == "") {
      approveErr.innerText ="Enter a valid amount with 18 decimals";
      return
    }

    try {
      var tx = await miPrTokenContract
        .connect(signer)
        .approve(miPrTokenContract.address, valueForApproveInp.value);
        approveErr.innerText = "...wait";
      var response = await tx.wait();
      var transactionHash = response.transactionHash;
      console.log("Tx Hash", transactionHash);
      approveErr.innerText = "Approved confirmed for "+ valueForApproveInp.value +"\nHash: " + transactionHash;
      valueForApproveInp.value = "";
    } catch (error) {
      console.log(error.reason);
      approveErr.innerText=error.reason;
    }
  });


  // Purchase a Token By ID
  var purchaseMsg = document.getElementById("purchaseMsg");
  var purchaseBtn = document.getElementById("purchaseButton");

  purchaseBtn.addEventListener("click", async function () {
    purchaseMsg.innerText ="";
    var tknIdInput = document.getElementById("purchaseInput");
    if (tknIdInput.value == "") {
      purchaseMsg.innerText ="Enter a valid Id";
      return
    }

    try {
      var tx = await pubSContract
        .connect(signer)
        .purchaseNftById(tknIdInput.value);
      purchaseMsg.innerText = "...wait";
      var response = await tx.wait();
      var transactionHash = response.transactionHash;
      console.log("Tx Hash", transactionHash);
      purchaseMsg.innerText = "Purchase confirmed for Token #" + tknIdInput.value + "\nHash: " + transactionHash;
      tknIdInput.value = "";
    } catch (error) {
      console.log(error.reason);
      purchaseMsg.innerText=error.reason;
    }
  });
 
  // Purchase NFT (with Ether)
  var purchaseEthBtn = document.getElementById("purchaseEthButton");
  var purchaseEthErr = document.getElementById("purchaseEthError");

  purchaseEthBtn.addEventListener("click", async function () {  
    try {
      purchaseEthErr.innerText = "";
    
      var response = await pubSContract
      .connect(signer)
      .depositEthForARandomNft();

      var transactionHash = response.transactionHash;
      purchaseEthErr.innerText = "Purchased confirmed with Hash: " + transactionHash;
      
      console.log(transactionHash);      

    } catch (error) {
      console.log(error.reason);
    }
  });


}

// Setup for receive events of PublicSale Contract
var showListOfTokens = document.getElementById("nftList");
function setUpEventsContracts() {  
  pubSContract.on("DeliverNft", (winnerAccount, nftId) => {
    var tokenNum = ethers.utils.formatUnits(nftId, 0);
    
    var child = document.createElement("li");
    child.innerText = `Token #${tokenNum} was purchased by: ${winnerAccount}`;
    showListOfTokens.appendChild(child);

    console.log("Account", winnerAccount);
    console.log("Token #", tokenNum);
  });

}

  
async function setUp() {

  setUpListeners();  
  initSCs();
  // initSCsMumbai();

  setUpEventsContracts();
}

setUp()
  .then()
  .catch((e) => console.log(e));
