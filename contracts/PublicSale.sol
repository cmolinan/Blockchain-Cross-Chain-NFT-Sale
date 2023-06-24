// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract PublicSale is
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // Mi Primer Token
    IERC20Upgradeable miPrimerToken;  // Setter in Constructor

    // 17 de Junio del 2023 GMT
    uint256 constant startDate = 1686960000;

    // Maximo price NFT
    uint256 constant MAX_PRICE_NFT = 50000 * 10 ** 18;

    // Gnosis Safe
    address gnosisSafeWallet;   // Setter in Constructor

    event DeliverNft(address winnerAccount, uint256 nftId);

    mapping (uint256 _tknId => bool) internal tokensSold;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _miPrimerTokenAddress, address _gnosisSafeWallet) public initializer {
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        gnosisSafeWallet = payable(msg.sender);
        miPrimerToken = IERC20Upgradeable(_miPrimerTokenAddress);
        gnosisSafeWallet = _gnosisSafeWallet;
    }

    receive() external payable {}
    fallback() external payable {}

    function purchaseNftById(uint256 _id) external {        
        // Realizar 3 validaciones:
        // 1 - el id no se haya vendido. Sugerencia: llevar la cuenta de ids vendidos
        //         * Mensaje de error: "Public Sale: id not available"
        // 2 - el msg.sender haya dado allowance a este contrato en suficiente de MPRTKN
        //         * Mensaje de error: "Public Sale: Not enough allowance"
        // 3 - el msg.sender tenga el balance suficiente de MPRTKN
        //         * Mensaje de error: "Public Sale: Not enough token balance"
        // 4 - el _id se encuentre entre 1 y 30
        //         * Mensaje de error: "NFT: Token id out of range"

        require( !tokensSold[_id], "Public Sale: id not available");         
        require( _id >=1 && _id <=30, "NFT: Token id out of range");

        // Obtener el precio segun el id
        uint256 priceNft = _getPriceById(_id) * 10 ** 18;
        require( miPrimerToken.allowance(msg.sender, address(this)) >= priceNft, "Public Sale: Not enough allowance");         
        require( miPrimerToken.balanceOf(msg.sender) >= priceNft, "Public Sale: Not enough token balance"); 
        
        // Purchase fees
        // 10% para Gnosis Safe (fee)
        // 90% se quedan en este contrato (net)
        // from: msg.sender - to: gnosisSafeWallet - amount: fee
        // from: msg.sender - to: address(this) - amount: net
        uint256 fee = (priceNft * 10) / 100;
        uint256 net = priceNft - fee;
        miPrimerToken.transferFrom(msg.sender, gnosisSafeWallet, fee);
        miPrimerToken.transferFrom(msg.sender, address(this), net);        

        // EMITIR EVENTO para que lo escuche OPEN ZEPPELIN DEFENDER
        emit DeliverNft(msg.sender, _id);
        tokensSold[_id] = true;
    }

    function depositEthForARandomNft() public payable {
        // Realizar 2 validaciones
        // 1 - que el msg.value sea mayor o igual a 0.01 ether

        // Escgoer una id random de la lista de ids disponibles
        // 2 - validar que haya NFTs disponibles para hacer el random        
        uint256 nftId = _getRandomNftId();
                
        if (nftId == 0) { //se devolveran los ethers
            if (msg.value != 0 ) payable(msg.sender).transfer(msg.value);
            revert("Sorry, no Tokens available");                
        }

        if (msg.value < 0.01 ether) { //se devolveran los ethers
            payable(msg.sender).transfer(msg.value);
            revert("You have less than 0.01 ether");
        }
        
        // Enviar ether a Gnosis Safe
        // SUGERENCIA: Usar gnosisSafeWallet.call para enviar el ether
        // Validar los valores de retorno de 'call' para saber si se envio el ether correctamente
        (bool success, bytes memory error) = payable(gnosisSafeWallet).call{
            value: 0.01 ether,
            gas: 5000000
        }("");

        require(success, "Failed transfer");  //TODO: transaction should not stop
    
        // Dar el cambio al usuario
        // El vuelto seria equivalente a: msg.value - 0.01 ether
        if (msg.value > 0.01 ether) {
            // logica para dar cambio
            // usar '.transfer' para enviar ether de vuelta al usuario            
            payable(msg.sender).transfer(msg.value - 0.01 ether);
        }

        // EMITIR EVENTO para que lo escuche OPEN ZEPPELIN DEFENDER
        emit DeliverNft(msg.sender, nftId);
        tokensSold[nftId] = true;
    }

    // PENDING
    // Crear el metodo receive

    ////////////////////////////////////////////////////////////////////////
    /////////                    Helper Methods                    /////////
    ////////////////////////////////////////////////////////////////////////

    // Devuelve un id random de NFT de una lista de ids disponibles
    function _getRandomNftId() internal view returns (uint256) {    
        uint256 random = 0;

        //verifying if there are at least one token available
        uint256 i;        
        for (i = 1; i <= 30 ; i++) {  
            if (!tokensSold[i]) random++;
        } 
        if (random == 0) return 0;

        do {
            //random = (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)) % 30) + 1;
        random = (uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        ) % 1000) + 1;


        } while (tokensSold[random]);

        return random ;
    }

    // Según el id del NFT, devuelve el precio. Existen 3 grupos de precios
    function _getPriceById(uint256 _id) internal view returns (uint256) {
        
        uint256 priceGroupOne = 500;
        
        uint256 priceGroupTwo = 1000 * _id;
        
        uint256 priceGroupThree = 10000 + 1000 * (block.timestamp - startDate)/3600;
        if (priceGroupThree > MAX_PRICE_NFT) priceGroupThree = MAX_PRICE_NFT;

        if (_id > 1 && _id < 10) {
            return priceGroupOne;
        } else if (_id > 11 && _id < 20) {
            return priceGroupTwo;
        } else {
            return priceGroupThree;
        }
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}
}
