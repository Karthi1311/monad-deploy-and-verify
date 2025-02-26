const hre = require("hardhat");
const fs = require("fs");
const inquirer = require("inquirer").default; // Use default export

// ANSI color codes
const reset = "\x1b[0m";
const boldBlue = "\x1b[1m\x1b[34m";
const yellow = "\x1b[33m";
const green = "\x1b[32m";
const cyan = "\x1b[36m";
const red = "\x1b[31m";
const blue = "\x1b[34m";

// File paths
const privateKeysFile = "private_keys.json";
const verifiedTokensFile = "verified_token.txt";

// Load or initialize private keys
let privateKeys = [];
if (fs.existsSync(privateKeysFile)) {
  privateKeys = JSON.parse(fs.readFileSync(privateKeysFile, "utf8"));
} else {
  fs.writeFileSync(privateKeysFile, JSON.stringify([]));
}

// Function to append verified token details
function appendVerifiedToken(infoLine) {
  fs.appendFileSync(verifiedTokensFile, infoLine + "\n");
}

// Deploy a new token and auto-verify it
async function deployToken() {
  console.clear();
  console.log(`${boldBlue}\n🚀 Deploy New Token\n${reset}`);

  // Prompt for token details without defaults for name and symbol.
  const { name, symbol, supply } = await inquirer.prompt([
    { type: "input", name: "name", message: "Enter token name:" },
    { type: "input", name: "symbol", message: "Enter token symbol:" },
    { type: "input", name: "supply", message: "Enter total supply (default: 100M):", default: "1000000000" },
  ]);

  // If no private keys stored, prompt for one.
  if (privateKeys.length === 0) {
    const { newKey } = await inquirer.prompt([
      { type: "input", name: "newKey", message: "Enter a private key to use for deployment:" }
    ]);
    privateKeys.push(newKey.trim());
    fs.writeFileSync(privateKeysFile, JSON.stringify(privateKeys, null, 2));
  }

  // Allow user to select a private key.
  const { selectedKey } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedKey",
      message: "Choose a wallet for deployment:",
      choices: privateKeys.map((key, index) =>
        `Wallet ${index + 1}: ${key.slice(0, 10)}...`
      )
    }
  ]);

  const selectedIndex = Number(selectedKey.match(/\d+/)[0]) - 1;
  const deployerKey = privateKeys[selectedIndex];

  console.log(`\n${yellow}📜 Deployment Summary:${reset}`);
  console.log(`${green}Token Name:   ${name}${reset}`);
  console.log(`${green}Token Symbol: ${symbol}${reset}`);
  console.log(`${green}Total Supply: ${supply} tokens${reset}`);
  const maskedKey = deployerKey.substring(0, 4) + "****" + deployerKey.slice(-4);
  console.log(`${green}Using Wallet: Wallet ${selectedIndex + 1}: ${maskedKey}${reset}\n`);

  const { confirm } = await inquirer.prompt([
    { type: "confirm", name: "confirm", message: "Proceed with deployment?", default: true }
  ]);

  if (!confirm) {
    console.log(`${red}\n❌ Deployment canceled.${reset}`);
    return;
  }

  console.log(`${cyan}\n⏳ Deploying...${reset}`);

  // Set PRIVATE_KEY in process.env for Hardhat.
  process.env.PRIVATE_KEY = deployerKey;

  // Create provider and wallet.
  const provider = new hre.ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz/");
  const wallet = new hre.ethers.Wallet(deployerKey, provider);

  // Get contract factory.
  const Token = await hre.ethers.getContractFactory("MyToken", wallet);
  const token = await Token.deploy(name, symbol, supply);
  await token.waitForDeployment();
  const contractAddress = await token.getAddress();

  console.log(`${green}✅ Token deployed at: ${contractAddress}${reset}`);

  // Automatically attempt verification.
  await verifyContract(contractAddress, name, symbol, supply);
}

// Verify a deployed contract; if verified, log it in verified_token.txt.
async function verifyContract(contractAddress, name, symbol, supply) {
  console.log(`${cyan}\n⏳ Verifying contract at ${contractAddress}...${reset}`);
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [name, symbol, supply],
    });
    console.log(`${green}✅ Contract verified successfully!${reset}`);

    // Append verified token details.
    const verifiedRecord = `CA: ${contractAddress} - Token: ${name} - Symbol: ${symbol} - Supply: ${supply} - Timestamp: ${new Date().toISOString()}`;
    appendVerifiedToken(verifiedRecord);
    console.log(`${blue}\n📁 Verified token details saved in ${verifiedTokensFile}${reset}`);
  } catch (error) {
    console.error(`${red}\n❌ Verification failed for ${contractAddress}:${reset}`, error);
    console.error(`${red}Please try verifying manually using:${reset}`);
    console.error(`${red}npx hardhat verify --network monad ${contractAddress} "${name}" "${symbol}" ${supply}${reset}`);
  }
}

// Main menu: continuous loop with only deploy or exit.
async function mainMenu() {
  while (true) {
    console.log(`\n${boldBlue}===== Main Menu =====${reset}`);
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Select an action:",
        choices: ["Deploy a new token", "Exit"]
      }
    ]);

    if (action === "Deploy a new token") {
      await deployToken();
    } else {
      console.log(`${cyan}\nGoodbye!${reset}`);
      break;
    }
  }
}

mainMenu().catch((error) => {
  console.error(`${red}\n❌ Error:`, error, `${reset}`);
  process.exit(1);
});