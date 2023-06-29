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
  var miPrimerNFT = "0x0A34c64e44f4Ea55fCD285aDD229AfE19d9eB8A6";
  
  var tokenAbi = ["function safeMint(address _to, uint256 _tokenId)"];
  var tokenContract = new ethers.Contract(miPrimerNFT, tokenAbi, signer);
  var tx = await tokenContract.safeMint(winnerAccount, nftId);
  var res = await tx.wait();
  return res;
};
