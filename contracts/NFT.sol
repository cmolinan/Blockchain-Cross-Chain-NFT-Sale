// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract MiPrimerNft is ERC721, Pausable, AccessControl, ERC721Burnable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC721("MiPrimerNft", "MPRNFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmXcuyR7xGKWzpvyTzKXo9rUkV94PDa7DFRU9jWPYdrWVx/";        
    }

    function pause() public onlyRole(PAUSER_ROLE) whenNotPaused  {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) whenPaused {
        _unpause();
    }
    
    function safeMint(address _to, uint256 _tokenId) public {
        require(!_exists(_tokenId), "It was already minted");
        require( _tokenId >= 1 && _tokenId <= 30, "Public Sale: tokenId must be between 1 and 30");
        _safeMint(_to, _tokenId);
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
