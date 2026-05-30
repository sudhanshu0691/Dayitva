"use strict";
// ============================================================
// Deployment Script for DecentralizedTenderChain
// Run: npx hardhat run scripts/deploy.ts --network ganache
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    console.log("🚀 Deploying DecentralizedTenderChain...");
    const [deployer] = await hardhat_1.ethers.getSigners();
    console.log(`📡 Deploying with account: ${deployer.address}`);
    // Deploy the contract
    const TenderChain = await hardhat_1.ethers.getContractFactory("DecentralizedTenderChain");
    const tenderChain = await TenderChain.deploy();
    await tenderChain.waitForDeployment();
    const contractAddress = await tenderChain.getAddress();
    console.log(`✅ DecentralizedTenderChain deployed to: ${contractAddress}`);
    console.log(`   Deployer is owner and first authorized officer`);
    // Log deployment info
    console.log("\n📋 Deployment Summary:");
    console.log(`   Network: ${process.env.HARDHAT_NETWORK || "hardhat"}`);
    console.log(`   Contract: ${contractAddress}`);
    console.log(`   Owner: ${deployer.address}`);
    console.log("\n🔧 Local Ganache deployments do not use explorer verification.");
    // Write deployment info to a JSON file
    const fs = require("fs");
    const deploymentInfo = {
        network: process.env.HARDHAT_NETWORK || "hardhat",
        contractAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        abi: await tenderChain.abi,
    };
    fs.writeFileSync("deployment.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to deployment.json");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
});
//# sourceMappingURL=deploy.js.map