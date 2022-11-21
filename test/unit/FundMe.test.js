const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const {
    isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace")

describe("FundMe", async function () {
    let fundMe
    let deployer
    let MockV3Aggregator
    const sendValue = ethers.utils.parseUnits("1")

    beforeEach(async function () {
        // const accounts = await ethers.getSigners()
        // const accountsZero = accounts[0]
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"]) // 部署所有合约
        fundMe = await ethers.getContract("FundMe", deployer) // 获取合约
        MockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("construnctor", async function () {
        it("set aggregator address correctly", async function () {
            const response = await fundMe.priceFeed() // ???不是一个接口为啥可以（）
            assert.equal(response, MockV3Aggregator.address)
        })
    })

    describe("fund", async function () {
        it("fails if not enough money", async function () {
            await expect(fundMe.fund()).to.be.reverted
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        it("updated the aoumnt funded data structure", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(deployer)

            assert.equal(response.toString(), sendValue)
        })
        it("check funder", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getFunders(0)
            assert.equal(response, deployer)
        })
    })
    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })
        it("withdraw from a single founder", async function () {
            // arrange
            const contractBalance = await ethers.provider.getBalance(
                fundMe.address
            )
            const deployerBalance = await ethers.provider.getBalance(deployer)
            // act
            const transactionReceipt = await (await fundMe.withdraw()).wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const endingContractBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )
            // assert
            assert.equal(endingContractBalance, 0)
            assert.equal(
                endingDeployerBalance
                    .add(gasUsed.mul(effectiveGasPrice))
                    .toString(),
                contractBalance.add(deployerBalance).toString()
            )
        })
        it("multiple funders", async function () {
            // arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const contractBalance = await ethers.provider.getBalance(
                fundMe.address
            )
            const deployerBalance = await ethers.provider.getBalance(deployer)

            // act
            const transactionReceipt = await (await fundMe.withdraw()).wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const endingContractBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )
            // assert: deployer reset
            assert.equal(endingContractBalance, 0)
            assert.equal(
                endingDeployerBalance
                    .add(gasUsed.mul(effectiveGasPrice))
                    .toString(),
                contractBalance.add(deployerBalance).toString()
            )
            // assert: singers reset
            expect(fundMe.getFunders(0)).to.be.reverted
            for (let i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })
        it("only allows owner to withdraw", async function () {
            const attackers = ethers.getSigners()
            const attacker = attackers[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
                "FundMe_NotOwner"
            )
        })
    })
})
