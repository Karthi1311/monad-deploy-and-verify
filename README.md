# Monad Token Deployment

This is a Hardhat project that provides an interactive command-line interface (CLI) for deploying ERC‑20 tokens on the Monad testnet. The project allows users to specify token details, select a wallet for deployment, and automatically verify the contract.

## Features

- **Interactive CLI**: Input token name, symbol (both required), and total supply (default: 100M).
- **Wallet Management**: Choose or add a private key for deployment.
- **Automatic Verification**: The contract is automatically verified after deployment.
- **Logging**: Verified token details are saved in `verified_token.txt`.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/)
- A valid private key for deployment on the Monad testnet

### **Fixing npm Errors (if needed)**

If you encounter permission issues while installing dependencies, run the following command in comment promt:

    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

This allows scripts to execute temporarily without changing system-wide security settings.

Installation

1. Clone this repository or download the source code.

2. Navigate to the project directory and install dependencies:

   ```
   npm install
### **Steps for Installation & Run##

Compile Contracts

To compile the ERC‑20 contract, run:

    npm run compile

Deploy & Verify a Token

To start the interactive CLI for deployment and automatic verification, run:

    npm run deploy

You will be prompted to:

Enter Token Name (required)

Enter Token Symbol (required)

Enter Total Supply (defaults to 100M if left empty)

Select a Wallet from stored private keys (or add a new one)

Once confirmed, the token is deployed on the Monad testnet, automatically verified, and saved to verified_token.txt.

Exiting

When finished, select the Exit option from the menu.

Notes

Private Keys: Private keys are stored locally in private_keys.json. Keep this file secure.

Verification: The contract is automatically verified after deployment. If verification fails, a manual command will be provided in the console.

