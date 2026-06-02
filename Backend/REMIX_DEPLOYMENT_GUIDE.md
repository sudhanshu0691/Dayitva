# Deploy Smart Contract using Remix IDE + MetaMask + Ganache

## Prerequisites
1. Install [MetaMask](https://metamask.io/) browser extension
2. Install [Ganache](https://trufflesuite.com/ganache/) (desktop app or CLI)
3. Open [Remix IDE](https://remix.ethereum.org/)

## Step 1: Start Ganache
1. Open Ganache application
2. Click "Quickstart Ethereum"
3. Copy one of the private keys (to import into MetaMask later)
4. Note the RPC URL (default: `http://127.0.0.1:7545`)
5. Note the Chain ID (default: `1337`)

## Step 2: Connect MetaMask to Ganache
1. Open MetaMask browser extension
2. Click network dropdown → "Add Network"
3. Fill in:
   - **Network Name**: Ganache Local
   - **RPC URL**: `http://127.0.0.1:7545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: ETH
4. Click "Save"
5. Import a Ganache account:
   - Click account icon → "Import Account"
   - Paste private key from Ganache
6. You should see 100 ETH (test) balance

## Step 3: Open Remix IDE
1. Go to https://remix.ethereum.org/
2. Close any workspace popups

## Step 4: Create Contract File
1. In Remix File Explorer (left sidebar), right-click `contracts` folder
2. Click "New File" → name it `DecentralizedTenderChain.sol`
3. Copy/paste the entire contents from `Backend/contracts/DecentralizedTenderChain.sol`

## Step 5: Compile Contract
1. Click Solidity Compiler tab (2nd icon)
2. Set compiler to `0.8.20` or higher
3. Click "Compile DecentralizedTenderChain.sol"
4. ✅ Green checkmark = success

## Step 6: Deploy Contract
1. Click Deploy & Run tab (3rd icon)
2. Set **Environment** to **"Injected Provider - MetaMask"**
3. MetaMask will ask to connect → click "Connect"
4. Ensure MetaMask is on **Ganache Local** network
5. Select `DecentralizedTenderChain` contract
6. Click **"Deploy"**
7. MetaMask opens confirmation → click **"Confirm"**
8. Wait a few seconds for Ganache to mine

## Step 7: Get Contract Address
1. In Remix, under "Deployed Contracts", copy the address (starts with `0x...`)
2. Also copy the transaction hash from MetaMask

## Step 8: Configure Backend
1. Open `Backend/.env`
2. Set:
   ```env
   BLOCKCHAIN_RPC_URL=http://127.0.0.1:7545
   BLOCKCHAIN_CHAIN_ID=1337
   CONTRACT_ADDRESS=0xYourDeployedContractAddress
   BLOCKCHAIN_EXPLORER_URL=
   ```
3. Save

## Step 9: Configure Frontend
1. Open `Frontend/.env.local`
2. Set:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
   NEXT_PUBLIC_GANACHE_CHAIN_ID=1337
   NEXT_PUBLIC_GANACHE_RPC_URL=http://127.0.0.1:7545
   NEXT_PUBLIC_EXPLORER_URL=
   ```
3. Save

## Step 10: Restart Backend
```bash
cd Backend
npm run dev
```

## Verify Setup
1. Backend should log: `⛓️ Ganache reachable at block X`
2. Frontend MetaMask button should show Ganache account
3. Creating a tender will trigger a real MetaMask transaction

## Troubleshooting

### "Ganache not reachable"
- Ensure Ganache is running
- Check RPC URL matches (`http://127.0.0.1:7545`)

### MetaMask shows "Wrong Network"
- Switch MetaMask to "Ganache Local" network

### "Nonce too high"
- In MetaMask: Settings → Advanced → Clear Activity Tab Data

### Ganache accounts have 0 balance
- Import accounts using private keys from Ganache
- All Ganache accounts start with 100 ETH

### Contract not found
- Verify contract address in `.env` files matches deployed address
- Ensure you selected the correct contract in Remix before deploying