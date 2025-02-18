const { expect } = require("chai");
const hre = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("MultiSig", function () {
  async function deployTwoOfThreeMultiSigFixture() {
    const [owner1, owner2, owner3, nonOwner] = await hre.ethers.getSigners();
    const owners = [owner1.address, owner2.address, owner3.address];
    const required = 2;
    
    const multiSig = await hre.ethers.deployContract("MultiSig", [
      owners,
      required,
    ]);

    return { multiSig, owners, required, nonOwner };
  }

  it("Should not deploy with zero address as owner", async function () {
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    
    await expect(hre.ethers.deployContract("MultiSig", [
      [zeroAddress],
      1,
    ])
  ).to.be.revertedWith("Address is null");
  });

  it("Should not deploy with duplicate owners", async function () {
    const { required } = await loadFixture(deployTwoOfThreeMultiSigFixture);
    const duplicate_owners = [
      "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
      "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
      "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
    ];

    await expect(hre.ethers.deployContract("MultiSig", [
      duplicate_owners,
      required,
    ])
  ).to.be.revertedWith("Owner already exists");
  });

  it("Should not deploy with 0 owners", async function () {
    const { required } = await loadFixture(deployTwoOfThreeMultiSigFixture);

    await expect(hre.ethers.deployContract("MultiSig", [
      [],
      required,
    ])
  ).to.be.revertedWith("Invalid requirement");
  });

  it("Should not deploy with 0 required confirmations", async function () {
    const { owners } = await loadFixture(deployTwoOfThreeMultiSigFixture);
    await expect(hre.ethers.deployContract("MultiSig", [
      owners,
      0,
    ])
  ).to.be.revertedWith("Invalid requirement");
  });

  it("Should not deploy with greater required confirmations than owners", async function () {
    const { owners } = await loadFixture(deployTwoOfThreeMultiSigFixture);
    await expect(hre.ethers.deployContract("MultiSig", [
      owners,
      owners.length + 1,
    ])
  ).to.be.revertedWith("Invalid requirement");
  });

  it("Should deploy with equal required confirmations and owners", async function () {
    const { owners } = await loadFixture(deployTwoOfThreeMultiSigFixture);
    const multiSig = await hre.ethers.deployContract("MultiSig", [
      owners,
      owners.length,
    ]);

    expect(await multiSig.numOwners()).to.equal(owners.length);
    expect(await multiSig.required()).to.equal(owners.length);
  });

  it("Should set the correct owners", async function () {
    const { multiSig, owners } = await loadFixture(deployTwoOfThreeMultiSigFixture);

    expect(await multiSig.numOwners()).to.equal(owners.length);
    expect(await multiSig.getOwners()).to.deep.equal(owners);
  });

  it("Should set the correct required confirmations", async function () {
    const { multiSig, required } = await loadFixture(deployTwoOfThreeMultiSigFixture);

    expect(await multiSig.required()).to.equal(required);
  });

  it("Should revert if not an owner", async function () {
    const { multiSig, nonOwner } = await loadFixture(deployTwoOfThreeMultiSigFixture);
    const value = hre.ethers.parseEther("1");
    const data = "0x";

    // _to address can be any address for this test
    await expect(multiSig.connect(nonOwner).submitTxn(
      nonOwner.address,
      value,
      data
    )
    ).to.be.revertedWith("Not an owner");

    await expect(multiSig.connect(nonOwner).confirmTxn(0)).to.be.revertedWith("Not an owner");

    await expect(multiSig.connect(nonOwner).revokeConfirmation(0)).to.be.revertedWith("Not an owner");
    
    await expect(multiSig.connect(nonOwner).executeTxn(0)).to.be.revertedWith("Not an owner");
  });
});
