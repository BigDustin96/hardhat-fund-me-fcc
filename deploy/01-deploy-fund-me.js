const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    console.log("GOT deployer")
    const chainId = network.config.chainId
    console.log("Got chainId")
    let branchFlag
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
        branchFlag = 11111111111111
    } else {
        // test or mainnet
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
        branchFlag = 22222222222222
    }

    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")
    log(branchFlag)
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        // verify
        await verify(fundMe.address, args)
    }
}

module.exports.tags = ["all", "fundme"]
