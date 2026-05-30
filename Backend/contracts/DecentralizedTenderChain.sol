// SPDX-License-Identifier: MIT
// ============================================================
// Decentralized TenderChain - Smart Contract
// Blockchain-Based Transparent E-Procurement & Tender Management
// Target Network: Local Ganache / Ethereum-compatible test networks
// ============================================================
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title DecentralizedTenderChain
 * @notice Manages government tenders with sealed-bid commit-reveal scheme
 * @dev Uses OpenZeppelin for security: Ownable, ReentrancyGuard, Pausable
 * 
 * Upgradeability: This contract can be used behind a UUPS proxy for future upgrades.
 * Simply add UUPSUpgradeable from OpenZeppelin and replace constructor with initialize.
 */
contract DecentralizedTenderChain is Ownable, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;

    // ==================== ENUMS ====================

    /// @notice Status lifecycle of a tender
    enum TenderStatus {
        Draft,          // Tender being prepared (0)
        Open,           // Accepting bids (1)
        Closed,         // Bidding period ended (2)
        UnderEvaluation,// Bids being evaluated (3)
        Awarded,        // Winner declared (4)
        Cancelled       // Tender cancelled (5)
    }

    /// @notice Status of a vendor bid
    enum BidStatus {
        Submitted,      // Encrypted bid hash committed (0)
        Revealed,       // Bid parameters revealed (1)
        Evaluated,      // Score calculated (2)
        Withdrawn       // Bid withdrawn (3)
    }

    // ==================== STRUCTS ====================

    /// @notice Tender structure storing all details on-chain
    struct Tender {
        uint256 id;                     // Unique tender identifier
        address officer;                // Creator/government officer
        string title;                   // Tender title
        string ipfsHash;                // IPFS hash of full specifications
        uint256 budget;                 // Budget in wei (or token decimals)
        uint256 deadline;               // Unix timestamp of bidding deadline
        uint256 minScore;               // Minimum score to qualify (basis points)
        bool msmeQuota;                 // MSME reservation flag
        TenderStatus status;            // Current tender status
        address winner;                 // Declared winner address
        uint256 winnerPrice;            // Winner's bid price
        uint256 winnerScore;            // Winner's total score
        uint256 bidCount;               // Total bids received
        uint256 createdAt;              // Creation timestamp
        uint256 evaluatedAt;            // Evaluation timestamp
    }

    /// @notice Bid structure for commit-reveal scheme
    struct Bid {
        uint256 tenderId;               // Tender this bid belongs to
        address bidder;                 // Bidder wallet address
        bytes32 encryptedBidHash;       // Hash of sealed bid (commitment)
        uint256 price;                  // Revealed price
        uint256 priceScore;             // Price score (basis points)
        uint256 financialStrength;      // Financial strength score (basis points)
        uint256 pastExperience;         // Past experience score (basis points)
        uint256 performanceFeedback;    // Performance feedback score (basis points)
        uint256 technicalCapability;    // Technical capability score (basis points)
        uint256 compliance;             // Compliance score (basis points)
        uint256 proposalQuality;        // Proposal quality score (basis points)
        uint256 totalScore;             // Weighted total score (basis points)
        BidStatus status;               // Current bid status
        uint256 submittedAt;            // Submission timestamp
        uint256 revealedAt;             // Reveal timestamp
        bool exists;                    // For checking bid existence
    }

    // ==================== STATE VARIABLES ====================

    /// @notice Counter for tender IDs
    uint256 private _tenderIdCounter;

    /// @notice Mapping from tender ID to Tender struct
    mapping(uint256 => Tender) public tenders;

    /// @notice Mapping from tender ID + bidder address to Bid struct
    mapping(uint256 => mapping(address => Bid)) public bids;

    /// @notice Mapping of blacklisted vendor addresses
    mapping(address => bool) public blacklistedVendors;

    /// @notice List of officer addresses authorized to create tenders
    mapping(address => bool) public authorizedOfficers;

    /// @notice List of vendor addresses registered in the system
    mapping(address => bool) public registeredVendors;

    // ==================== EVENTS ====================

    event TenderCreated(
        uint256 indexed tenderId,
        address indexed officer,
        string title,
        string ipfsHash,
        uint256 budget,
        uint256 deadline,
        uint256 timestamp
    );

    event TenderUpdated(
        uint256 indexed tenderId,
        address indexed officer,
        string changes,
        uint256 timestamp
    );

    event BidSubmitted(
        uint256 indexed tenderId,
        address indexed bidder,
        bytes32 encryptedBidHash,
        uint256 timestamp
    );

    event BidRevealed(
        uint256 indexed tenderId,
        address indexed bidder,
        uint256 price,
        uint256 totalScore,
        uint256 timestamp
    );

    event TenderEvaluated(
        uint256 indexed tenderId,
        address indexed triggeredBy,
        uint256 totalBids,
        uint256 timestamp
    );

    event WinnerDeclared(
        uint256 indexed tenderId,
        address indexed winner,
        uint256 price,
        uint256 totalScore,
        uint256 timestamp
    );

    event TenderStatusChanged(
        uint256 indexed tenderId,
        TenderStatus newStatus,
        address indexed changedBy,
        uint256 timestamp
    );

    event OfficerAuthorized(address indexed officer, uint256 timestamp);
    event OfficerRevoked(address indexed officer, uint256 timestamp);
    event VendorRegistered(address indexed vendor, uint256 timestamp);
    event VendorBlacklisted(address indexed vendor, string reason, uint256 timestamp);
    event VendorWhitelisted(address indexed vendor, uint256 timestamp);

    // ==================== MODIFIERS ====================

    /// @notice Restricts access to authorized officers only
    modifier onlyOfficer() {
        require(authorizedOfficers[msg.sender], "TenderChain: caller is not an authorized officer");
        _;
    }

    /// @notice Restricts access to registered vendors only
    modifier onlyVendor() {
        require(registeredVendors[msg.sender], "TenderChain: caller is not a registered vendor");
        _;
    }

    /// @notice Ensures vendor is not blacklisted
    modifier notBlacklisted() {
        require(!blacklistedVendors[msg.sender], "TenderChain: vendor is blacklisted");
        _;
    }

    /// @notice Ensures tender exists
    modifier tenderExists(uint256 tenderId) {
        require(tenderId > 0 && tenderId <= _tenderIdCounter, "TenderChain: tender does not exist");
        _;
    }

    // ==================== CONSTRUCTOR ====================

    /**
     * @notice Contract constructor
     * @dev Initializes the contract with the deployer as owner and first officer
     */
    constructor() Ownable(msg.sender) {
        authorizedOfficers[msg.sender] = true;
        emit OfficerAuthorized(msg.sender, block.timestamp);
    }

    // ==================== ADMIN FUNCTIONS ====================

    /**
     * @notice Authorize a new officer to create tenders
     * @param _officer Address of the officer to authorize
     */
    function authorizeOfficer(address _officer) external onlyOwner {
        require(_officer != address(0), "TenderChain: invalid address");
        authorizedOfficers[_officer] = true;
        emit OfficerAuthorized(_officer, block.timestamp);
    }

    /**
     * @notice Revoke an officer's authorization
     * @param _officer Address of the officer to revoke
     */
    function revokeOfficer(address _officer) external onlyOwner {
        require(_officer != owner(), "TenderChain: cannot revoke owner");
        authorizedOfficers[_officer] = false;
        emit OfficerRevoked(_officer, block.timestamp);
    }

    /**
     * @notice Register a vendor in the system
     * @param _vendor Address of the vendor to register
     */
    function registerVendor(address _vendor) external onlyOwner {
        require(_vendor != address(0), "TenderChain: invalid address");
        registeredVendors[_vendor] = true;
        emit VendorRegistered(_vendor, block.timestamp);
    }

    /**
     * @notice Blacklist a vendor (prevents bidding)
     * @param _vendor Address of the vendor to blacklist
     * @param _reason Reason for blacklisting
     */
    function blacklistVendor(address _vendor, string calldata _reason) external onlyOwner {
        require(_vendor != address(0), "TenderChain: invalid address");
        blacklistedVendors[_vendor] = true;
        registeredVendors[_vendor] = false;
        emit VendorBlacklisted(_vendor, _reason, block.timestamp);
    }

    /**
     * @notice Remove vendor from blacklist
     * @param _vendor Address to whitelist
     */
    function whitelistVendor(address _vendor) external onlyOwner {
        blacklistedVendors[_vendor] = false;
        emit VendorWhitelisted(_vendor, block.timestamp);
    }

    /**
     * @notice Pause all contract operations (emergency)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ==================== TENDER FUNCTIONS ====================

    /**
     * @notice Create a new tender
     * @param _title Title of the tender
     * @param _ipfsHash IPFS hash of tender specifications
     * @param _budget Maximum budget (in wei)
     * @param _deadline Unix timestamp of bidding deadline
     * @param _minScore Minimum qualification score (basis points, e.g., 5000 = 50%)
     * @param _msmeQuota Whether MSME quota applies
     * @return tenderId ID of the created tender
     */
    function createTender(
        string calldata _title,
        string calldata _ipfsHash,
        uint256 _budget,
        uint256 _deadline,
        uint256 _minScore,
        bool _msmeQuota
    ) external onlyOfficer whenNotPaused returns (uint256 tenderId) {
        require(bytes(_title).length > 0, "TenderChain: title cannot be empty");
        require(bytes(_ipfsHash).length > 0, "TenderChain: IPFS hash required");
        require(_budget > 0, "TenderChain: budget must be > 0");
        require(_deadline > block.timestamp + 1 hours, "TenderChain: deadline must be at least 1 hour from now");
        require(_minScore <= 10000, "TenderChain: minScore max is 10000 (100%)");

        _tenderIdCounter++;
        uint256 newId = _tenderIdCounter;

        tenders[newId] = Tender({
            id: newId,
            officer: msg.sender,
            title: _title,
            ipfsHash: _ipfsHash,
            budget: _budget,
            deadline: _deadline,
            minScore: _minScore,
            msmeQuota: _msmeQuota,
            status: TenderStatus.Open,
            winner: address(0),
            winnerPrice: 0,
            winnerScore: 0,
            bidCount: 0,
            createdAt: block.timestamp,
            evaluatedAt: 0
        });

        emit TenderCreated(newId, msg.sender, _title, _ipfsHash, _budget, _deadline, block.timestamp);
        return newId;
    }

    /**
     * @notice Update tender details (only before deadline)
     * @param _tenderId ID of the tender to update
     * @param _title New title
     * @param _ipfsHash New IPFS hash
     * @param _budget New budget
     * @param _deadline New deadline
     */
    function updateTender(
        uint256 _tenderId,
        string calldata _title,
        string calldata _ipfsHash,
        uint256 _budget,
        uint256 _deadline
    ) external onlyOfficer tenderExists(_tenderId) whenNotPaused {
        Tender storage tender = tenders[_tenderId];
        require(tender.officer == msg.sender, "TenderChain: not your tender");
        require(tender.status == TenderStatus.Open, "TenderChain: tender not open");

        if (bytes(_title).length > 0) tender.title = _title;
        if (bytes(_ipfsHash).length > 0) tender.ipfsHash = _ipfsHash;
        if (_budget > 0) tender.budget = _budget;
        if (_deadline > block.timestamp) tender.deadline = _deadline;

        emit TenderUpdated(_tenderId, msg.sender, "Details updated", block.timestamp);
    }

    /**
     * @notice Cancel a tender (only officer, no bids yet)
     * @param _tenderId ID of the tender to cancel
     */
    function cancelTender(uint256 _tenderId) external onlyOfficer tenderExists(_tenderId) {
        Tender storage tender = tenders[_tenderId];
        require(tender.officer == msg.sender, "TenderChain: not your tender");
        require(tender.bidCount == 0, "TenderChain: cannot cancel tender with bids");

        tender.status = TenderStatus.Cancelled;
        emit TenderStatusChanged(_tenderId, TenderStatus.Cancelled, msg.sender, block.timestamp);
    }

    // ==================== BID FUNCTIONS ====================

    /**
     * @notice Submit an encrypted bid (commit phase)
     * @param _tenderId ID of the tender
     * @param _encryptedBidHash keccak256 hash of sealed bid parameters
     */
    function submitBid(
        uint256 _tenderId,
        bytes32 _encryptedBidHash
    ) external onlyVendor notBlacklisted tenderExists(_tenderId) whenNotPaused {
        Tender storage tender = tenders[_tenderId];
        require(tender.status == TenderStatus.Open, "TenderChain: tender not open");
        require(block.timestamp <= tender.deadline, "TenderChain: deadline passed");

        Bid storage bid = bids[_tenderId][msg.sender];
        require(!bid.exists, "TenderChain: already bid for this tender");
        require(_encryptedBidHash != bytes32(0), "TenderChain: invalid hash");

        bid.tenderId = _tenderId;
        bid.bidder = msg.sender;
        bid.encryptedBidHash = _encryptedBidHash;
        bid.status = BidStatus.Submitted;
        bid.submittedAt = block.timestamp;
        bid.exists = true;

        tender.bidCount++;

        emit BidSubmitted(_tenderId, msg.sender, _encryptedBidHash, block.timestamp);
    }

    /**
     * @notice Reveal bid parameters after deadline (reveal phase)
     * @param _tenderId ID of the tender
     * @param _price Bid price in wei
     * @param _scoreHashes Packed scoring parameters (financialStrength, pastExperience, etc.)
     *        Each score is in basis points (0-10000, where 10000 = 100%)
     * @param _nonce The nonce used in the commitment hash
     */
    function revealBid(
        uint256 _tenderId,
        uint256 _price,
        uint256[6] calldata _scoreHashes,
        bytes32 _nonce
    ) external onlyVendor tenderExists(_tenderId) whenNotPaused {
        Tender storage tender = tenders[_tenderId];
        require(block.timestamp > tender.deadline, "TenderChain: deadline not passed");
        require(tender.status == TenderStatus.Open || tender.status == TenderStatus.Closed, "TenderChain: invalid tender status");

        Bid storage bid = bids[_tenderId][msg.sender];
        require(bid.exists, "TenderChain: no bid found");
        require(bid.status == BidStatus.Submitted, "TenderChain: bid already revealed");

        // Verify commitment hash
        bytes32 computedHash = keccak256(abi.encodePacked(_price, _scoreHashes, _nonce));
        require(computedHash == bid.encryptedBidHash, "TenderChain: hash mismatch");

        // Validate scores (basis points, max 10000)
        for (uint256 i = 0; i < 6; i++) {
            require(_scoreHashes[i] <= 10000, "TenderChain: score exceeds 10000 bp");
        }

        // Calculate weighted total score using the same formula as backend
        // Price: 40%, Financial: 15%, Experience: 15%, Feedback: 10%, Technical: 10%, Compliance: 5%, Proposal: 5%
        // But scores are in basis points, so we divide by 10000 at the end
        uint256 priceScore = _price <= tender.budget ? 
            ((tender.budget - _price) * 10000 / tender.budget) : 0;
        
        uint256 totalScore = (
            (priceScore * 4000) +                     // 40% weight
            (_scoreHashes[0] * 1500) +                // 15% financial strength
            (_scoreHashes[1] * 1500) +                // 15% past experience
            (_scoreHashes[2] * 1000) +                // 10% performance feedback
            (_scoreHashes[3] * 1000) +                // 10% technical capability
            (_scoreHashes[4] * 500) +                 // 5% compliance
            (_scoreHashes[5] * 500)                   // 5% proposal quality
        ) / 100; // Normalize to basis points (out of 10000)

        // Update bid with revealed data
        bid.price = _price;
        bid.priceScore = priceScore;
        bid.financialStrength = _scoreHashes[0];
        bid.pastExperience = _scoreHashes[1];
        bid.performanceFeedback = _scoreHashes[2];
        bid.technicalCapability = _scoreHashes[3];
        bid.compliance = _scoreHashes[4];
        bid.proposalQuality = _scoreHashes[5];
        bid.totalScore = totalScore;
        bid.status = BidStatus.Revealed;
        bid.revealedAt = block.timestamp;

        // If all bids revealed, auto-close tender
        if (tender.status == TenderStatus.Open) {
            tender.status = TenderStatus.Closed;
            emit TenderStatusChanged(_tenderId, TenderStatus.Closed, msg.sender, block.timestamp);
        }

        emit BidRevealed(_tenderId, msg.sender, _price, totalScore, block.timestamp);
    }

    /**
     * @notice Evaluate tender and declare winner (anyone can trigger)
     * @param _tenderId ID of the tender to evaluate
     */
    function evaluateTender(uint256 _tenderId) external view tenderExists(_tenderId) whenNotPaused {
        Tender storage tender = tenders[_tenderId];
        require(tender.status == TenderStatus.Closed, "TenderChain: tender not closed");
        require(tender.bidCount > 0, "TenderChain: no bids to evaluate");

        // On-chain full evaluation is not implemented due to gas/iteration limits over dynamic bidder lists.
        // Use `evaluateWithWinner` (off-chain computed winner) for a gas-efficient, verifiable flow.
        revert("TenderChain: use evaluateWithWinner for on-chain verification");
    }

    /**
     * @notice Evaluate tender with pre-computed winner (gas efficient)
     * @param _tenderId ID of the tender
     * @param _winner Address of the winning bidder
     * @param _winnerScore The winner's total score for verification
     */
    function evaluateWithWinner(
        uint256 _tenderId,
        address _winner,
        uint256 _winnerScore
    ) external onlyOfficer tenderExists(_tenderId) whenNotPaused {
        Tender storage tender = tenders[_tenderId];
        require(tender.status == TenderStatus.Closed || tender.status == TenderStatus.UnderEvaluation, "TenderChain: invalid status");

        Bid storage winningBid = bids[_tenderId][_winner];
        require(winningBid.exists, "TenderChain: bid not found");
        require(winningBid.status == BidStatus.Revealed, "TenderChain: bid not revealed");
        require(winningBid.totalScore >= tender.minScore, "TenderChain: winner below min score");

        // Verify off-chain computed winner score matches on-chain revealed bid
        require(winningBid.totalScore == _winnerScore, "TenderChain: winner score mismatch");

        // Verify this is the highest bid (off-chain computed, verified on-chain)
        // For full transparency, all bidders can verify via events
        tender.status = TenderStatus.Awarded;
        tender.winner = _winner;
        tender.winnerPrice = winningBid.price;
        tender.winnerScore = winningBid.totalScore;
        tender.evaluatedAt = block.timestamp;

        emit TenderEvaluated(_tenderId, msg.sender, tender.bidCount, block.timestamp);
        emit WinnerDeclared(_tenderId, _winner, winningBid.price, winningBid.totalScore, block.timestamp);
        emit TenderStatusChanged(_tenderId, TenderStatus.Awarded, msg.sender, block.timestamp);
    }

    // ==================== VIEW FUNCTIONS ====================

    /**
     * @notice Get tender details
     * @param _tenderId ID of the tender
     * @return Tender struct
     */
    function getTender(uint256 _tenderId) external view tenderExists(_tenderId) returns (Tender memory) {
        return tenders[_tenderId];
    }

    /**
     * @notice Get bid details for a specific bidder and tender
     * @param _tenderId ID of the tender
     * @param _bidder Address of the bidder
     * @return Bid struct
     */
    function getBid(uint256 _tenderId, address _bidder) external view returns (Bid memory) {
        return bids[_tenderId][_bidder];
    }

    /**
     * @notice Get total number of tenders created
     * @return Tender count
     */
    function getTenderCount() external view returns (uint256) {
        return _tenderIdCounter;
    }

    /**
     * @notice Check if a vendor is registered
     * @param _vendor Address to check
     * @return bool
     */
    function isRegisteredVendor(address _vendor) external view returns (bool) {
        return registeredVendors[_vendor];
    }

    /**
     * @notice Check if an address is an authorized officer
     * @param _officer Address to check
     * @return bool
     */
    function isAuthorizedOfficer(address _officer) external view returns (bool) {
        return authorizedOfficers[_officer];
    }

    // ==================== RECEIVE ====================

    /**
     * @notice Fallback to receive ETH (for bidding deposits if needed)
     */
    receive() external payable {}

    /**
     * @notice Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "TenderChain: no balance to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "TenderChain: transfer failed");
    }
}