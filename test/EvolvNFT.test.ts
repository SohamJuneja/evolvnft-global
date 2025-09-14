import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("EvolvNFT Contract", function () {
  let EvolvNFTFactory: any;
  let evolvNft: Contract;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let oracle: HardhatEthersSigner;

  beforeEach(async function () {
    EvolvNFTFactory = await ethers.getContractFactory("contracts/EvolvNFT.sol:EvolvNFT");
    [owner, addr1, oracle] = await ethers.getSigners();

    evolvNft = await EvolvNFTFactory.deploy();
    await evolvNft.waitForDeployment();

    // Set the oracle address for tests
    await (evolvNft as any).connect(owner).setOracleAddress(oracle.address);
  });

  describe("Deployment", function () {
    it("Should assign the deployer as the owner", async function () {
      expect(await (evolvNft as any).owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should allow anyone to mint an NFT", async function () {
      const mintTx = await (evolvNft as any).connect(addr1).mint(addr1.address);
      await mintTx.wait();
      expect(await (evolvNft as any).ownerOf(0)).to.equal(addr1.address);
      expect(await (evolvNft as any).balanceOf(addr1.address)).to.equal(1);
    });

    it("Should correctly generate on-chain tokenURI after minting", async function () {
      await (evolvNft as any).connect(addr1).mint(addr1.address);
      const tokenURI = await (evolvNft as any).tokenURI(0);

      // Fixed: Use proper Chai string assertion
      expect(tokenURI).to.be.a('string').that.includes("data:application/json;base64,");
      
      const jsonString = Buffer.from(tokenURI.split(',')[1], 'base64').toString('utf8');
      const metadata = JSON.parse(jsonString);

      expect(metadata.name).to.equal("EvolvNFT #0");
      expect(metadata.attributes[0].trait_type).to.equal("Level");
      expect(metadata.attributes[0].value).to.equal(1);
      
      // --- ADDED CHECKS START HERE ---
      // Verify all initial attributes from the contract
      expect(metadata.attributes[1].trait_type).to.equal("Power");
      expect(metadata.attributes[1].value).to.equal(10); // Check initial power
      expect(metadata.attributes[2].trait_type).to.equal("Brightness");
      expect(metadata.attributes[2].value).to.equal(50); // Check initial brightness

      // Fixed: Use proper Chai string assertion for image check
      expect(metadata.image).to.be.a('string').that.includes("data:image/svg+xml;base64,");
      // --- ADDED CHECKS END HERE ---
    });
  });

  describe("Evolution", function () {
    beforeEach(async function() {
      await (evolvNft as any).connect(addr1).mint(addr1.address);
    });

    it("Should allow the oracle to evolve an NFT", async function () {
      // Provide all parameters required by the current contract signature
      await (evolvNft as any).connect(oracle).evolve(0, 500, 80, 0, 50, 5, 1, 0);
      const tokenURI = await (evolvNft as any).tokenURI(0);
      const jsonString = Buffer.from(tokenURI.split(',')[1], 'base64').toString('utf8');
      const metadata = JSON.parse(jsonString);

      expect(metadata.attributes[1].value).to.equal(500); // Power
      expect(metadata.attributes[2].value).to.equal(80);  // Brightness
      expect(metadata.attributes[0].value).to.equal(2);  // Level should increment
    });

    it("Should fail if a non-oracle account tries to evolve an NFT", async function () {
      await expect(
        // Pass full param list so the call matches the contract
        (evolvNft as any).connect(addr1).evolve(0, 500, 80, 0, 50, 5, 1, 0)
      ).to.be.revertedWith("EvolvNFT: Caller is not the oracle");
    });
  });
});