// Token addresses
TETHER_ADDRESS= '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d'
USDC_ADDRESS= '0x59b670e9fA9D0A427751Af201D676719a970857b'
WRAPPED_BITCOIN_ADDRESS= '0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1'

// Uniswap contract address
WETH_ADDRESS= '0x9A676e781A523b5d0C0e43731313A708CB607508'
FACTORY_ADDRESS= '0x0B306BF915C4d645ff596e518fAf3F9669b97016'
SWAP_ROUTER_ADDRESS= '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1'
NFT_DESCRIPTOR_ADDRESS= '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE'
POSITION_DESCRIPTOR_ADDRESS= '0x68B1D87F95878fE05B998F19b66F4baba5De1aed'
POSITION_MANAGER_ADDRESS= '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c'

const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

const { Contract, BigNumber } = require("ethers")
const bn = require('bignumber.js')
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })

const provider = waffle.provider;

function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  )
}

const nonfungiblePositionManager = new Contract(
  POSITION_MANAGER_ADDRESS,
  artifacts.NonfungiblePositionManager.abi,
  provider
)
const factory = new Contract(
  FACTORY_ADDRESS,
  artifacts.UniswapV3Factory.abi,
  provider
)

async function deployPool(token0, token1, fee, price) {
  const [owner] = await ethers.getSigners();
  await nonfungiblePositionManager.connect(owner).createAndInitializePoolIfNecessary(
    token0,
    token1,
    fee,
    price,
    { gasLimit: 5000000 }
  )
  const poolAddress = await factory.connect(owner).getPool(
    token0,
    token1,
    fee,
  )
  return poolAddress
}


async function main() {
  const usdtUsdc500 = await deployPool(TETHER_ADDRESS, USDC_ADDRESS, 500, encodePriceSqrt(1, 1))
  console.log('USDT_USDC_500=', `'${usdtUsdc500}'`)
}

/*
npx hardhat run --network localhost scripts/03_deployPools.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
