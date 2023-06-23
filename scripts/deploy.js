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

deployTokens()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exitCode = 1; // exitcode quiere decir fallor por error, terminacion fatal
});

// var MINTER_ROLE = getRole("MINTER_ROLE");
// var BURNER_ROLE = getRole("BURNER_ROLE");

// async function deployMumbai() {
//   var relayerAddress = "0xeb0868cf925105ac466c2b19039301e904061514";
//   var name = "Mi Primer NFT";
//   var symbol = "MPRNFT";
//   var nftContract = await deploySC("MiPrimerNft", [name, symbol]);
//   var implementation = await printAddress("NFT", nftContract.address);

//   // set up
//   await ex(nftTknContract, "grantRole", [MINTER_ROLE, relayerAddress], "GR");

//   await verify(implementation, "MiPrimerNft", []);
// }


// async function deployGoerli() {
//   // gnosis safe
//   // Crear un gnosis safe en https://gnosis-safe.io/app/
//   // Extraer el address del gnosis safe y pasarlo al contrato con un setter
//   var gnosis = { address: "" };
// }


// // deployMumbai()
// // deployGoerli()
// // deployMiPrimerToken();
// deployUSDCoin();
// // deployMiPrimerNft();

//   //
//   .catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
//   });
