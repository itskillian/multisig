const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DeployMultiSig", (m) => {
  const TEST_OWNERS = [m.getAccount(0), m.getAccount(1), m.getAccount(2)];
  const TEST_REQUIRED = 2;
  // const owners = m.getParameter("owners");
  // const required = m.getParameter("required");
  
  const multiSig = m.contract("MultiSig", [TEST_OWNERS, TEST_REQUIRED]);

  return { multiSig };
});