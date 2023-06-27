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
  var name = "First NFT";
  var symbol = "1stNFT";

  var nftContract = await deploySC("MiPrimerNft", [name, symbol]);
  var implementation = await printAddress("NFT", nftContract.address);

// set up
  await ex(nftContract, "grantRole", [MINTER_ROLE, relayerAddress], "GR");

  await verify(implementation, "MiPrimerNft", []);  
}

async function deployPublicSale() {
  var MiPrimerTokenAddress = "0xb428ca84e6B8EE3237306349bf5c388c1f4E86e1";
  // var GnosisSafeWallet = "0x655252000B5aC35239C9B7F112d3F252874763f4";
  // Carlos Safe Wallet:
  var GnosisSafeWallet = "0x87bbc079221b4079565D9373dd8D142e659ffef2";
  
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
