// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Flowlancer} from "../src/Flowlancer.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract FlowlancerScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address signerAddress = vm.envAddress("SIGNER_ADDRESS");
        address upgradeAddress = vm.envAddress("UPGRADE_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        
        Flowlancer implementation = new Flowlancer();
        console.log("Implementation deployed at:", address(implementation));

      
        require(address(implementation) != address(0), "Implementation deployment failed");

        
        bytes memory initData = abi.encodeWithSelector(
            Flowlancer.initialize.selector,
            signerAddress
        );
        console.log("Initialize data length:", initData.length);

        if (upgradeAddress != address(0)) {
          
            console.log("Upgrading contract at address:", upgradeAddress);
            UUPSUpgradeable proxy = UUPSUpgradeable(upgradeAddress);
            proxy.upgradeToAndCall(address(implementation), "");
            console.log("Contract upgraded at:", upgradeAddress);
        } else {
           
            ERC1967Proxy proxy = new ERC1967Proxy(
                address(implementation),
                initData
            );
            console.log("Proxy deployed at:", address(proxy));

           
            Flowlancer flowlancer = Flowlancer(payable(address(proxy)));
            require(flowlancer.signerAddress() == signerAddress, "Initialization verification failed");

            console.log("Flowlancer (proxy) initialized at:", address(flowlancer));
            console.log("Signer address set to:", flowlancer.signerAddress());
        }

        vm.stopBroadcast();
    }
}
