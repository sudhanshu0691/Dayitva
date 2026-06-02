// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DecentralizedTenderChain
 * @notice Real blockchain tender management system
 * @dev Deploy via Remix IDE with MetaMask on Sepolia testnet
 */
contract DecentralizedTenderChain {
    address public owner;
    uint256 public tenderCounter;

    struct Tender {
        uint256 id;
        address officer;
        string title;
        string ipfsHash;
        uint256 budget;
        uint256 deadline;
        uint256 minScore;
        bool msmeQuota;
        address winner;
        uint256 winnerScore;
        uint256 createdAt;
        bool exists;
    }

    struct Bid {
        address bidder;
        uint256 tenderId;
        bytes32 encryptedBidHash;
        uint256 price;
        uint256[6] scores;
        uint256 totalScore;
        uint256 submittedAt;
        bool revealed;
        bool exists;
    }

    mapping(uint256 => Tender) public tenders;
    mapping(uint256 => address[]) public tenderBidders;
    mapping(uint256 => mapping(address => Bid)) public bids;

    // Events
    event TenderCreated(
        uint256 indexed tenderId,
        address indexed officer,
        string title,
        string ipfsHash,
        uint256 budget,
        uint256 deadline,
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

    event WinnerDeclared(
        uint256 indexed tenderId,
        address indexed winner,
        uint256 price,
        uint256 totalScore,
        uint256 timestamp
    );

    event TenderClosed(
        uint256 indexed tenderId,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier tenderExists(uint256 _tenderId) {
        require(tenders[_tenderId].exists, "Tender does not exist");
        _;
    }

    modifier onlyOfficer(uint256 _tenderId) {
        require(tenders[_tenderId].officer == msg.sender, "Not tender officer");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createTender(
        string memory _title,
        string memory _ipfsHash,
        uint256 _budget,
        uint256 _deadline,
        uint256 _minScore,
        bool _msmeQuota
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(_budget > 0, "Budget required");
        require(_deadline > block.timestamp, "Deadline must be in future");
        require(_minScore > 0, "Min score required");

        tenderCounter++;
        uint256 newId = tenderCounter;

        tenders[newId] = Tender({
            id: newId,
            officer: msg.sender,
            title: _title,
            ipfsHash: _ipfsHash,
            budget: _budget,
            deadline: _deadline,
            minScore: _minScore,
            msmeQuota: _msmeQuota,
            winner: address(0),
            winnerScore: 0,
            createdAt: block.timestamp,
            exists: true
        });

        emit TenderCreated(newId, msg.sender, _title, _ipfsHash, _budget, _deadline, block.timestamp);
        return newId;
    }

    function submitBid(uint256 _tenderId, bytes32 _encryptedBidHash) external tenderExists(_tenderId) {
        Tender storage tender = tenders[_tenderId];
        require(block.timestamp <= tender.deadline, "Tender deadline passed");
        require(!bids[_tenderId][msg.sender].exists, "Already bid");

        bids[_tenderId][msg.sender] = Bid({
            bidder: msg.sender,
            tenderId: _tenderId,
            encryptedBidHash: _encryptedBidHash,
            price: 0,
            scores: [uint256(0), 0, 0, 0, 0, 0],
            totalScore: 0,
            submittedAt: block.timestamp,
            revealed: false,
            exists: true
        });

        tenderBidders[_tenderId].push(msg.sender);

        emit BidSubmitted(_tenderId, msg.sender, _encryptedBidHash, block.timestamp);
    }

    function revealBid(
        uint256 _tenderId,
        uint256 _price,
        uint256[6] calldata _scores
    ) external tenderExists(_tenderId) {
        Bid storage bid = bids[_tenderId][msg.sender];
        require(bid.exists, "Bid not found");
        require(!bid.revealed, "Already revealed");
        require(_price > 0, "Price required");

        bid.price = _price;
        bid.scores = _scores;
        bid.revealed = true;

        uint256 totalScore;
        for (uint256 i = 0; i < 6; i++) {
            totalScore += _scores[i];
        }
        bid.totalScore = totalScore;

        emit BidRevealed(_tenderId, msg.sender, _price, totalScore, block.timestamp);
    }

    function declareWinner(uint256 _tenderId, address _winner, uint256 _winnerScore) external tenderExists(_tenderId) onlyOfficer(_tenderId) {
        Tender storage tender = tenders[_tenderId];
        require(tender.winner == address(0), "Winner already declared");
        require(_winner != address(0), "Invalid winner address");
        require(bids[_tenderId][_winner].exists, "Winner must have bid");

        tender.winner = _winner;
        tender.winnerScore = _winnerScore;

        Bid storage winningBid = bids[_tenderId][_winner];

        emit WinnerDeclared(_tenderId, _winner, winningBid.price, _winnerScore, block.timestamp);
    }

    function closeTender(uint256 _tenderId) external tenderExists(_tenderId) onlyOfficer(_tenderId) {
        Tender storage tender = tenders[_tenderId];
        require(block.timestamp > tender.deadline, "Deadline not passed");
        require(tender.winner == address(0), "Winner already declared");

        emit TenderClosed(_tenderId, block.timestamp);
    }

    function getTender(uint256 _tenderId) external view returns (Tender memory) {
        return tenders[_tenderId];
    }

    function getBid(uint256 _tenderId, address _bidder) external view returns (Bid memory) {
        return bids[_tenderId][_bidder];
    }

    function getBiddersCount(uint256 _tenderId) external view returns (uint256) {
        return tenderBidders[_tenderId].length;
    }

    function getBidders(uint256 _tenderId) external view returns (address[] memory) {
        return tenderBidders[_tenderId];
    }
}