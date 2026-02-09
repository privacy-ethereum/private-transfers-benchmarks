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

// Reference tx: 0x105e408f09685adccb1554a325710e90859efcd488fdb2912c8974e73b803cbd
// Gas cost: cast receipt 0x105e408f09685adccb1554a325710e90859efcd488fdb2912c8974e73b803cbd gasUsed --rpc-url $ETH_RPC_URL
contract RailgunSendBenchmark is Test {
    IRailgunRelay constant RELAY =
        IRailgunRelay(0xFA7093CDD9EE6932B4eb2c9e1cde7CE00B1FA4b9);

    address constant SENDER = 0x0D0Efc24db8fe005e24271c6F823CAC22B0641D8;

    // TODO: fork at latest once we have proof generation logic. We need
    // to fork before the reference tx so nullifiers are unspent
    uint256 constant FORK_BLOCK = 24_419_682;

    // The reference tx's gas price
    uint256 constant TX_GAS_PRICE = 157_243_696;

    function test_send() public {
        vm.createSelectFork(vm.envString("ETH_RPC_URL"), FORK_BLOCK);
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
                x: 0x015725cd8a15be4bf1f7837e7b8c2025d7ca4dbbbdb2f5fa665114e8c6c4c5a1,
                y: 0x1f6fcfa3b23484c94e39f5b9634f30b442537703120465cbea8b4d4da71586b3
            }),
            b: G2Point({
                x: [
                    uint256(
                        0x022de54da17e30e78420c0cc02b0b38dd955562d36e77bbf80b3f7d945f20062
                    ),
                    uint256(
                        0x0937ada831923756d078a862c16c4b8c177952f4e8a588405f1a8b14f8c6f96f
                    )
                ],
                y: [
                    uint256(
                        0x1d796199025622d2b6a16ea9d61db03fbe347c51af8e3d7a5fcb7b10fd713f6a
                    ),
                    uint256(
                        0x1931d5ef9ae87beec74b1f6e68dc41c274f7074954504e7ae61a6b88327fac1e
                    )
                ]
            }),
            c: G1Point({
                x: 0x20bf9f3b7488bca5676eff605108792285b958167f49b2507a5183be926d14f7,
                y: 0x21f070faf2042032eaf837092361dab0ec3da2c12979f05ea3991617c1b326e7
            })
        });

        bytes32[] memory nullifiers = new bytes32[](1);
        nullifiers[
            0
        ] = 0x1859b778ec78a2eb608f2ec51a3c5fe8e9bab7a5f19a21044966227b2de12c6f;

        bytes32[] memory commitments = new bytes32[](3);
        commitments[
            0
        ] = 0x2ff10322d6b36b7b4f0062515c568c00f919a7fc6fbce0e958ba05fa44c73e80;
        commitments[
            1
        ] = 0x2530747fc11a38e51bf951fc9cb6aa2bfd29bd0a9939192a03e1f996520f4b22;
        commitments[
            2
        ] = 0x1ae2ff2f4d3e1dcb52b127193bc2806c7bc7c949936867e121557b1ce6eb7584;

        CommitmentCiphertext[] memory ciphertexts = new CommitmentCiphertext[](
            2
        );
        ciphertexts[0] = CommitmentCiphertext({
            ciphertext: [
                bytes32(
                    0x4f01dc2f8cd4f194d37dc3e81c4c50ed9856e4661d51a8cca19dc1c5f968b559
                ),
                bytes32(
                    0x026c971af7058f3ce0d8e5c780738ef9199bd6985a911380ac07f96f8be3c579
                ),
                bytes32(
                    0xc05d076bdfb5bd2d9723d9a75ac98032a0587551f91caa2482fc8578260a8323
                ),
                bytes32(
                    0x5516c564e7f32556ee2fb8bf74d21412cc637f4e1ea34143f29dbf46207c44c5
                )
            ],
            blindedSenderViewingKey: 0x3bd01f88b170da516e2797b923d13f809713d79666de845bb22e7275a39c4966,
            blindedReceiverViewingKey: 0xae3daf0c538abb6d93da3f0198b3fb1b5bf29df2911fc5cb2e53b23b29ac3759,
            annotationData: hex"2ba4d2403f37a3c5a029128945391232dc324c89390f1270688961ab6021b8de6fc2435172ba598d13c2eb2dc867f34073ac5d703ced936103f062479267",
            memo: hex""
        });
        ciphertexts[1] = CommitmentCiphertext({
            ciphertext: [
                bytes32(
                    0x8739eda54b121b727f3692b482a471bf9b7e8832b9cc4db9f21e8642afe946b4
                ),
                bytes32(
                    0x9b911f2d28388f225d222d55b7e124d872e9ce22eca707ae07bb863df524f074
                ),
                bytes32(
                    0xd1b06bd6aad30e79899071bcd3353065d3fcd14bbcc42313e24a193e2f7fa708
                ),
                bytes32(
                    0x94163ca9bff74ce0f3594f7906d0fd181628ca2ea737d2dde24627087a9eee91
                )
            ],
            blindedSenderViewingKey: 0xbd722e2a55d4d9ddc9dd4925f3d1f1664601fabcd2acb94e62e979e6620c2397,
            blindedReceiverViewingKey: 0xbd722e2a55d4d9ddc9dd4925f3d1f1664601fabcd2acb94e62e979e6620c2397,
            annotationData: hex"12c1bddb767444fc8a477364ce058394b991f989ca27c6895fd7d7290af50f92f6bb3d5e8c5dbd4e6fdfd50cff17b554670d548f8faa6dfcae95bb212f61",
            memo: hex""
        });

        BoundParams memory boundParams = BoundParams({
            treeNumber: 2,
            minGasPrice: 155_686_828,
            unshield: UnshieldType.NORMAL,
            chainID: 1,
            adaptContract: address(0),
            adaptParams: bytes32(0),
            commitmentCiphertext: ciphertexts
        });

        CommitmentPreimage memory unshieldPreimage = CommitmentPreimage({
            npk: bytes32(
                uint256(uint160(0x52CCD390416d0C68A57EBF2b48112F71A8083bDD))
            ),
            token: TokenData({
                tokenType: TokenType.ERC20,
                tokenAddress: 0xdAC17F958D2ee523a2206206994597C13D831ec7,
                tokenSubID: 0
            }),
            value: 31_826_566_416
        });

        return
            Transaction({
                proof: proof,
                merkleRoot: 0x29cee84a6ded1b1a70e3aecc4c98cc7c409e1fe4ae00546139409b08bb8aaede,
                nullifiers: nullifiers,
                commitments: commitments,
                boundParams: boundParams,
                unshieldPreimage: unshieldPreimage
            });
    }
}
