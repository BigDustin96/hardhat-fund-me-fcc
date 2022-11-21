require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan") // task:verify
require("./tasks/block-number")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")
/** @type import('hardhat/config').HardhatUserConfig */
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || ""
const PRIVATE_KRY =
    process.env.PRIVATE_KRY ||
    "d4ece9795f40568f29735b64b24a2a32656fb8f0c2e5db0c1990e0e0da4107dd"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKET_API_KET = process.env.COINMARKET_API_KET

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KRY],
            chainId: 5,
            blockConfirmations: 1,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            //accounts:
            chainId: 31337,
        },
    },
    // solidity: "0.8.8",
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
    gasReporter: {
        enabled: false,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKET_API_KET,
        token: "MATIC",
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
}
