const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe staging test", async function () {
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseUnits("0.01")

          beforeEach(async function () {
              // const accounts = await ethers.getSigners()
              // const accountsZero = accounts[0]
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer) // 获取合约
          })
          it("allows people to fund and withdraw", async function () {
              await (await fundMe.fund({ value: sendValue })).wait(1)
              awair(await fundMe.withdraw()).wait(1)
              const endingBalance = await ethers.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
