require("dotenv").config();
var hre = require("hardhat");

const {
  getRole,
  verify,
  ex,
  printAddress,
  deploySC,
  deploySCNoUp,
} = require("../utils");

async function deployTokens() {
  //USDCoin  -> Not upgradeable SC 
  // MODE: using local library ../utils -> It includes verify of the Contract
  await deploySCNoUp("USDCoin", []);
  

  //M PRIMER TOKEN -> MiPrimerToken (UPGRADEABLE)
  var name = "MyToken";
  var symbol = "MPRTKN";
  var myTokenProxyContract = await deploySC("MiPrimerToken", [name, symbol]);

  //Implementation Contract
  var myTokenImplementationContract = await printAddress("MiPrimerToken", myTokenProxyContract.address); 
  await verify(myTokenImplementationContract, "MiPrimerToken", []);
    
}

async function deployMumbai() {
  var relayerAddress = "0x9ba986566f59441E2F7d7A30Eb2A935ccEE58fc7";
  var name = "MiPrimerNft";
  var symbol = "MPRNFT";

  var nftContract = await deploySC("MiPrimerNft", [name, symbol]);
  var implementation = await printAddress("NFT", nftContract.address);

// set up
  await ex(nftContract, "grantRole", [MINTER_ROLE, relayerAddress], "GR");

  await verify(implementation, "MiPrimerNft", []);  
}

async function deployPublicSale() {
  var MiPrimerTokenAddress = "0x0Ace802b29936f9F4B2d5b2F5Aa56468bf999932";
  var GnosisSafeWallet = "0x655252000B5aC35239C9B7F112d3F252874763f4";
  
  var psContract = await deploySC("PublicSale", [MiPrimerTokenAddress, GnosisSafeWallet]);
  var implementation = await printAddress("PublicSale", psContract.address);

  await verify(implementation, "PublicSale", []);  
}

var MINTER_ROLE = getRole("MINTER_ROLE");

deployTokens()   //have to run in Goerli Chain !!
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exitCode = 1; // exitcode quiere decir fallor por error, terminacion fatal
});

deployMumbai()  //have to run in Mumbai Chain !!
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exitCode = 1; // exitcode quiere decir fallor por error, terminacion fatal
});

deployPublicSale()  //have to run in Goerli Chain !!
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exitCode = 1; // exitcode quiere decir fallor por error, terminacion fatal
});


// async function deployGoerli() {
//   // gnosis safe
//   // Crear un gnosis safe en https://gnosis-safe.io/app/
//   // Extraer el address del gnosis safe y pasarlo al contrato con un setter
//   var gnosis = { address: "" };
// }
