// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {
    Transaction,
    SnarkProof,
    G1Point,
    G2Point,
    BoundParams,
    CommitmentCiphertext,
    CommitmentPreimage,
    TokenData,
    TokenType,
    UnshieldType
} from "@railgun/logic/Globals.sol";

interface IRailgunRelay {
    function transact(Transaction[] calldata transactions) external;
}

// Reference tx: 0x9691b06aeb81ae709ad478942a5307c5e5cc4597074f5b60e11b2033c1584580
// Gas cost: cast receipt 0x9691b06aeb81ae709ad478942a5307c5e5cc4597074f5b60e11b2033c1584580 gasUsed --rpc-url $ETH_RPC_URL
contract RailgunSendBenchmark is Test {
    IRailgunRelay constant RELAY = IRailgunRelay(0xFA7093CDD9EE6932B4eb2c9e1cde7CE00B1FA4b9);

    address constant SENDER = 0x03CbE58799c0EB9AABAB3212886bfcA10A418299;

    // Fork at block before the reference tx so nullifiers are unspent.
    // TODO: fork at latest once we have proof generation logic.
    uint256 constant FORK_BLOCK = 24_421_959;

    // The reference tx's gas price
    uint256 constant TX_GAS_PRICE = 283_628_746;

    function test_send() public {
        string memory rpcUrl = vm.envOr("ETH_RPC_URL", string("https://eth.llamarpc.com"));
        vm.createSelectFork(rpcUrl, FORK_BLOCK);
        vm.txGasPrice(TX_GAS_PRICE);

        Transaction[] memory txs = new Transaction[](1);
        txs[0] = _buildTransaction();

        vm.prank(SENDER);
        vm.startSnapshotGas("railgun_send");
        RELAY.transact(txs);
        uint256 gasUsed = vm.stopSnapshotGas("railgun_send");

        console.log("scenario:  railgun_send");
        console.log("forkBlock:", block.number);
        console.log("gasUsed:  ", gasUsed);
    }

    function _buildTransaction() internal pure returns (Transaction memory) {
        SnarkProof memory proof = SnarkProof({
            a: G1Point({
                x: 0x03d6861e17bf2babb298bb06b69a003f55252b756eab01614acdc89217f5c232,
                y: 0x26e0db51c595e77a7041450e8034484976a5ef1509543ba63a3c10f541be3ae0
            }),
            b: G2Point({
                x: [
                    uint256(0x2b286954d2cc7d4cea7b50450d5c7c072c2a8bd2c76bd8c921ada087d84d26e1),
                    uint256(0x1091cd885152612e830fb275301648d5f0f0f891a9b0bbd39b3cf390fd907f4c)
                ],
                y: [
                    uint256(0x11dc536a27865e54c3ec085a532814663448a8ff79b20a7824b949574c8bd9fd),
                    uint256(0x1ac326f30e8798a39f48bc894f1fc94f644ef3b0089bf41eed564ee6e96cff6b)
                ]
            }),
            c: G1Point({
                x: 0x2fa47504b90d2920e69465871244194d196550355551b9c5b23117e0e31c56b3,
                y: 0x1d024b5ac8dd75a6f5f27c34e7c9c4c568bca186ddd6c64c4eeae051a7acf048
            })
        });

        bytes32[] memory nullifiers = new bytes32[](2);
        nullifiers[0] = 0x13c9423325c5d638bf183d242aa9f9b864e4b42b749b00a19950d13d10529ef8;
        nullifiers[1] = 0x2a7eb0332c12e3fb1920e62ee6bff72c53c9ac036b340f7003ba978a4b497855;

        bytes32[] memory commitments = new bytes32[](2);
        commitments[0] = 0x088699b561e26726c43c482201168a153e623d4dc91c70d5ea15959dbe4aa370;
        commitments[1] = 0x06e8dcbb2b237226f4cd2da22acde99d63bd75997a68d89ea660a90ad789d679;

        CommitmentCiphertext[] memory ciphertexts = new CommitmentCiphertext[](2);
        ciphertexts[0] = CommitmentCiphertext({
            ciphertext: [
                bytes32(0x7d429023249ead0df72b6fbcbc26fa7264033426d5b5934b89ae41e9088def76),
                bytes32(0xb4b58e502443c2f79e8891d8c21653dcdc9af33b1af0b2fd662a260450075cbf),
                bytes32(0xdc07ad6a7167345f0e798825786d2324f24505cadb6cea1602263dd146febb35),
                bytes32(0x83d9085ce23ef4e52372dc68599853274ff383f05d4209cfd62dc10e41192226)
            ],
            blindedSenderViewingKey: 0x67c7c4f4bf7d695c49508d9341db62f258656cbd3680caa0524f6ceccf8dcfdb,
            blindedReceiverViewingKey: 0x70db540142462d9f2e494928c8f473cba28c05a46c279b34c546042ad7e98209,
            annotationData: hex"33f172f5005e9a92310ecc740c389523b147fc7e09d0f5df198a7496fae843ad2aaa3dba091c93c8716570c64ce04bcc711cc689c10bec659d28ffb487fa",
            memo: hex""
        });
        ciphertexts[1] = CommitmentCiphertext({
            ciphertext: [
                bytes32(0xbbd1240440d6679e22bb11eec05057373e8e1ef31a6ab0a964a4667517ca108e),
                bytes32(0x35aaa5137133d43350b5f99a21dc97a793c638f3fc1207c3670cd73712fd6dd5),
                bytes32(0x1c81ab00cd19b2d5db398f3140e2d2f2b95f4cf2d0475fc2bedbf3171aaa0654),
                bytes32(0x2ac5a7eb3d337aaa488f172eb86c8a5e8eeca5883e38f7824baa9f9d09e39852)
            ],
            blindedSenderViewingKey: 0xc422f463519d3ec701d9d763b477d580070f2d5d76feb3a55d6634de3064c8ba,
            blindedReceiverViewingKey: 0x94e9d2e6d6507c9446062d750396c37d901f3a7d65517a74f66adecc11514539,
            annotationData: hex"a5d946a5411a0f3c697ae08bf3f44f64b27f52be7491faaa7797d0ae9c88e193c5f5f5d180ceb044f9cc62bc9d8c46dc50d803f98237d304c9d3604f47a1",
            memo: hex""
        });

        BoundParams memory boundParams = BoundParams({
            treeNumber: 2,
            minGasPrice: 283_628_746,
            unshield: UnshieldType.NONE,
            chainID: 1,
            adaptContract: address(0),
            adaptParams: bytes32(0),
            commitmentCiphertext: ciphertexts
        });

        CommitmentPreimage memory unshieldPreimage = CommitmentPreimage({
            npk: bytes32(0),
            token: TokenData({tokenType: TokenType.ERC20, tokenAddress: address(0), tokenSubID: 0}),
            value: 0
        });

        return Transaction({
            proof: proof,
            merkleRoot: 0x03309f5fdc4b5c0d38e7c1fbe75be39758dfe5fa63982bf1663ee9ccf3471dc5,
            nullifiers: nullifiers,
            commitments: commitments,
            boundParams: boundParams,
            unshieldPreimage: unshieldPreimage
        });
    }
}
