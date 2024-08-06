const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CCIP Cross Chain Name Service", function () {
  let ccipLocalSimulator, routerAddress;
  let ccnsRegister, ccnsReceiver, ccnsLookup;
  let owner, alice;

  before(async function () {
    [owner, alice] = await ethers.getSigners();

    // Deploy the CCIPLocalSimulator contract
    const CCIPLocalSimulator = await ethers.getContractFactory("CCIPLocalSimulator");
    ccipLocalSimulator = await CCIPLocalSimulator.deploy();
    await ccipLocalSimulator.deployed();

    // Call configuration() function to get Router contract address
    routerAddress = await ccipLocalSimulator.configuration();
    expect(routerAddress).to.not.be.null;

    // Deploy the CrossChainNameServiceRegister contract
    const CrossChainNameServiceRegister = await ethers.getContractFactory("CrossChainNameServiceRegister");
    ccnsRegister = await CrossChainNameServiceRegister.deploy(routerAddress);
    await ccnsRegister.deployed();

    // Deploy the CrossChainNameServiceReceiver contract
    const CrossChainNameServiceReceiver = await ethers.getContractFactory("CrossChainNameServiceReceiver");
    ccnsReceiver = await CrossChainNameServiceReceiver.deploy(routerAddress);
    await ccnsReceiver.deployed();

    // Deploy the CrossChainNameServiceLookup contract
    const CrossChainNameServiceLookup = await ethers.getContractFactory("CrossChainNameServiceLookup");
    ccnsLookup = await CrossChainNameServiceLookup.deploy(routerAddress);
    await ccnsLookup.deployed();

    // Enable chains (replace with actual chain IDs)
    const chainId1 = 1; // Example chain ID
    const chainId2 = 2; // Example chain ID
    await ccnsRegister.enableChain(chainId1);
    await ccnsReceiver.enableChain(chainId2);
  });

  it("should register and lookup a name successfully", async function () {
    const domain = "alice.ccns";
    const aliceAddress = alice.address;

    // Register the domain to Alice's address
    await ccnsRegister.connect(owner).register(domain, aliceAddress);

    // Lookup the domain
    const resolvedAddress = await ccnsLookup.lookup(domain);
    expect(resolvedAddress).to.equal(aliceAddress);
  });
});
