"use strict";
// ============================================================
// Hardhat Configuration
// Smart contract compilation, testing & local deployment
// Target: Local Ganache Network
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomicfoundation/hardhat-toolbox");
const config = {
    solidity: {
        version: "0.8.25",
        settings: {
            evmVersion: "cancun",
            optimizer: {
                enabled: true,
                runs: 200,
            },
            viaIR: true,
        },
    },
    networks: {
        // Local development network - Hardhat's built-in node
        hardhat: {
            chainId: 31337,
        },
        // Local Ganache network
        ganache: {
            url: "http://127.0.0.1:7545",
            chainId: 1337,
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./abis",
    },
};
exports.default = config;
//# sourceMappingURL=hardhat.config.js.map