// // We require the Hardhat Runtime Environment explicitly here. This is optional
// // but useful for running the script in a standalone fashion through `node <script>`.
// //
// // You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// // will compile your contracts, add the Hardhat Runtime Environment's members to the
// // global scope, and execute the script.
// const hre = require("hardhat");

// async function main() {
//   const currentTimestampInSeconds = Math.round(Date.now() / 1000);
//   const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
//   const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

//   const lockedAmount = hre.ethers.utils.parseEther("1");

//   const Lock = await hre.ethers.getContractFactory("Lock");
//   const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

//   await lock.deployed();

//   console.log(
//     `Lock with 1 ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`
//   );
// }

// // We recommend this pattern to be able to use async/await everywhere
// // and properly handle errors.
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

//import
const { ethers, run, network } = require("hardhat")

//main
async function main() {
    const contractFactory = await ethers.getContractFactory("SimpleStorage")
    const simpleStorage = await contractFactory.deploy()
    console.log("Deploying contract..")
    await simpleStorage.deployed()
    // RPC_URL && PRIVATE_KRY alreayed in ethers
    console.log("contract address : " + simpleStorage.address)

    /* Get some Interface by searching https://docs.ethers.io/ */
    // console.log(simpleStorage.deployTransaction.blockNumber)
    // console.log(simpleStorage.deployTransaction.confirmations)

    /* Verify when it's Goerli */
    //console.log(network.config) // find chainId
    if (network.config.chainId === 420 && process.env.ETHERSCAN_AOPI_KEY) {
        await simpleStorage.deployTransaction.wait(6)
        await verify(simpleStorage.address, [])
    }

    /* Interact with contract */
    const currentValue = await simpleStorage.retrieve()
    console.log("current value : " + currentValue)
    console.log(
        "block number is : " + simpleStorage.deployTransaction.blockNumber
    )
    await (await simpleStorage.store(7)).wait(1)
    const updatedValue = await simpleStorage.retrieve()
    console.log("Updated value : " + updatedValue)
    console.log(
        "block number is : " + simpleStorage.deployTransaction.blockNumber
    )
}

// verify contract on Goerli
async function verify(contractAddress, args) {
    console.log("Verify contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowercase().includes("already verified")) {
            console.log("Verified!!!")
        } else {
            console.error(e)
        }
    }
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
