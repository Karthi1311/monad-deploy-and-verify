require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const fs = require("fs");

const privateKeysFile = "private_keys.json";
let privateKeys = fs.existsSync(privateKeysFile)
  ? JSON.parse(fs.readFileSync(privateKeysFile, "utf8"))
  : [];

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      metadata: {
        bytecodeHash: "none", // disable IPFS storage of metadata
        useLiteralContent: true, // store source code directly in JSON
      },
    },
  },
  networks: {
    monad: {
      url: "https://testnet-rpc.monad.xyz/",
      accounts: privateKeys.length > 0 ? privateKeys : [],
    },
  },
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify-api-monad.blockvision.org",
    browserUrl: "https://testnet.monadexplorer.com",
  },
  etherscan: {
    enabled: false,
  },
};