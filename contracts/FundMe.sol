// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
import "../node_modules/hardhat/console.sol";

error FundMe_NotOwner();

/** @title
 *  @author
 *  @notice
 *  @dev
 */
contract FundMe {
    // type declaration  11:06:06
    using PriceConverter for uint256;

    mapping(address => uint256) private addressToAmountFunded; // s_addressToAmountFunded storage costs at least 20000gas!
    address[] private funders; //s_funders

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10**18;

    AggregatorV3Interface public priceFeed; // s_priceFeed

    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe_NotOwner();
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /** @notice
     * @dev
     */
    function fund() public payable {
        console.log("I'm in fund() now");
        require(
            msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }

    function getVersion() public view returns (uint256) {
        // ETH/USD price feed address of Goerli Network.
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
        return priceFeed.version();
    }

    function withdraw() public onlyOwner {
        address[] memory cheap_funders = funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < cheap_funders.length;
            funderIndex++
        ) {
            address funder = cheap_funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \
    //         yes  no
    //         /     \
    //    receive()?  fallback()
    //     /   \
    //   yes   no
    //  /        \
    //receive()  fallback()

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders(uint256 index) public view returns (address) {
        return funders[index];
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }
}

// Concepts we didn't cover yet (will cover in later sections)
// 1. Enum
// 2. Events
// 3. Try / Catch
// 4. Function Selector
// 5. abi.encode / decode
// 6. Hash with keccak256
// 7. Yul / Assembly
