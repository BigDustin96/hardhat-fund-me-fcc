const { task } = require("hardhat/config")
require("@nomicfoundation/hardhat-toolbox")

task("BLOCKNUMBER", "prints block number").setAction(async (taskArgs, hre) => {
    const blockNumber = await hre.ethers.provider.getBlockNumber()
    console.log("blocknumber is " + blockNumber)
})

task("accounts", "Prints the list of accounts", async () => {
    const accounts = await ethers.getSigners()

    for (const account of accounts) {
        console.log(account.address)
    }
})
