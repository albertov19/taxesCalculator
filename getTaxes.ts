import * as fs from 'fs';
import * as path from 'path';
import csv from 'csvtojson';
import yargs from 'yargs';

// Price data can be obtained as a CSV with the following URL (Changing Token Name):
//https://coincodex.com/crypto/kusama/historical-data/

// Interafaces, Types & Definitions
interface PriceData {
  [date: string]: number;
}
type Network = 'moonbeam' | 'moonriver' | 'polkadot' | 'kusama';
const networkTokenTags: Record<Network, string> = {
  moonbeam: 'GLMR',
  moonriver: 'MOVR',
  polkadot: 'DOT',
  kusama: 'KSM',
};

// Inputs
const args = yargs.options({
  networks: { type: 'string', demandOption: false, alias: 'n' },
  addresses: {
    type: 'string',
    demandOption: false,
    alias: 'a',
  },
  year: { type: 'number', demandOption: false, alias: 'y' },
}).argv;

// Networks and Addresses Array
const networks = args['networks'] ? args['networks'].split(',') : [];
const addresses = args['addresses'] ? args['addresses'].split(',') : [];

// Dates
const startDate = new Date(Date.UTC(args['year'], 0, 1));
const endDate = new Date(Date.UTC(args['year'] + 1, 0, 1));

async function main(): Promise<void> {
  if (networks.length != addresses.length) {
    console.error('Address and network length must be the same!');
  }

  for (let i = 0; i < networks.length; i++) {
    await calculateForNetwork(networks[i], addresses[i]);
  }
}

async function calculateForNetwork(network: string, address: string): Promise<void> {
  // Check if Token is Supported
  const tokenTag = networkTokenTags[(network as Network).toLowerCase()];

  if (!tokenTag) {
    console.error('Only supports polkadot, kusama, moonbeam, and moonriver as input networks');
  }

  // Price File
  const priceFile = `${args['year']}_${tokenTag}_Price`;

  if (fs.existsSync(path.resolve(`./priceJSONs/${priceFile}.json`))) {
    await calculateData(priceFile, tokenTag, address);
  } else {
    await generateJSON(priceFile, tokenTag);
  }
}

async function generateJSON(priceFile: string, tokenTag: string): Promise<void> {
  // Load CSV Files
  const priceData = await csv().fromFile(`./CSVs/${priceFile}.csv`);

  const priceJSON: PriceData = {};
  priceData.forEach((priceDateData) => {
    const date = new Date(`${priceDateData['Date']}Z`);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    if (date >= startDate && date <= endDate) {
      priceJSON[`${year}-${month}-${day}`] = parseFloat(priceDateData['Close']);
    } else {
      console.log(`No Price Data for ${tokenTag} on date ${year}-${month}-${day}`);
    }
  });

  // Save
  fs.writeFileSync(`./priceJSONs/${priceFile}.json`, JSON.stringify(priceJSON));

  console.log(`JSON Price File Generated for ${priceFile}`);
}

async function calculateData(priceFile: string, tokenTag: string, address: string): Promise<void> {
  // Read JSON Price Data
  const priceDataBuffer = fs.readFileSync(path.resolve(`./priceJSONs/${priceFile}.json`));
  const priceDataJSONString = priceDataBuffer.toString();
  const priceData: PriceData = JSON.parse(priceDataJSONString);

  // Read Staking Data
  const stakingData = await csv().fromFile(path.resolve(`./CSVs/${tokenTag}_${address}.csv`));

  let totalAmount: number = 0;
  stakingData.forEach((staking) => {
    let stakingDate = new Date(staking['Date']);
    const year = stakingDate.getFullYear();
    const month = (stakingDate.getMonth() + 1).toString().padStart(2, '0');
    const day = stakingDate.getDate().toString().padStart(2, '0');
    if (stakingDate >= startDate && stakingDate <= endDate) {
      priceData[`${year}-${month}-${day}`]
        ? (totalAmount += parseFloat(staking.Value) * priceData[`${year}-${month}-${day}`])
        : console.log(`No price matching for ${`${year}-${month}-${day}`}`);
    }
  });

  console.log(`Staking Rewards for ${tokenTag} in ${startDate.getFullYear()} is ${totalAmount.toFixed(2)} EUR`);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
