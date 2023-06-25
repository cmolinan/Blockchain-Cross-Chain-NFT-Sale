const { ethers } = require("ethers");
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require("defender-relay-client/lib/ethers");

exports.handler = async function (data) {  
  // Eventos que vienen del sentinel
  // Este evento viene de Goerli cuando el usuario adquiere un NFT
  const payload = data.request.body.events;

  // Inicializa Proveedor: en este caso es OZP
  const provider = new DefenderRelayProvider(data);
 
  // Se crea el signer quien será el msg.sender en los smart contracts
  const signer = new DefenderRelaySigner(data, provider, { speed: "fast" });

  // Filtrando solo eventos
  var onlyEvents = payload[0].matchReasons.filter((e) => e.type === "event");
  if (onlyEvents.length === 0) return;

  // Filtrando solo DeliverNft
  var event = onlyEvents.filter((ev) =>
    ev.signature.includes("DeliverNft")
  );
  // Mismos params que en el evento
  var { winnerAccount, nftId } = event[0].params;
  console.log("CMN-params",winnerAccount,nftId, "-FIN");
  
  // Ejecutar 'SafeMint' en Mumbai del contrato MiPrimerNFT
  var miPrimerNFT = "0x9e03a5f5447af8A0Df23F663a86EcDf62aC1B571";
  var tokenAbi = ["function safeMint(address _to, uint256 _tokenId)"];
  var tokenContract = new ethers.Contract(miPrimerNFT, tokenAbi, signer);
  // var tx = await tokenContract.safeMint("0x7A30a1401a37FBAFbb7db0207a1658511096B861", 8);
  var tx = await tokenContract.safeMint(winnerAccount, nftId);
  var res = await tx.wait();
  return res;
};
