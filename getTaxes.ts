import * as fs from 'fs';
import * as path from 'path';
import csv from 'csvtojson';
import yargs from 'yargs';

// Price data can be obtained as a CSV with the following URL (Changing Token Name):
//https://coincodex.com/crypto/kusama/historical-data/

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

// Networks and Addresses
const networks = args['networks'] ? args['networks'].split(',') : [];
const addresses = args['addresses'] ? args['addresses'].split(',') : [];

// Dates
const startDate = new Date(Date.UTC(args['year'], 0, 1));
const endDate = new Date(Date.UTC(args['year'] + 1, 0, 1));

async function main() {
  if (networks.length != addresses.length) {
    console.error('Address and network length must be the same!');
  }

  for (let i = 0; i < networks.length; i++) {
    await calculateForNetwork(networks[i], addresses[i]);
  }
}

async function calculateForNetwork(network, address) {
  // Fetch Price Data
  let tokenTag;
  switch (network.toLowerCase()) {
    case 'moonbeam':
      tokenTag = 'GLMR';
      break;
    case 'moonriver':
      tokenTag = 'MOVR';
      break;
    case 'polkadot':
      tokenTag = 'DOT';
      break;
    case 'kusama':
      tokenTag = 'KSM';
      break;
    default:
      console.error('Only supports polkadot, kusama, moonbeam and moonriver as input networks');
  }

  // Price File
  const priceFile = `2022_${tokenTag}_Price`;

  if (fs.existsSync(path.resolve(`./priceJSONs/${priceFile}.json`))) {
    await calculateData(priceFile, tokenTag, address);
  } else {
    await generateJSON(priceFile, tokenTag);
  }
}

async function generateJSON(priceFile, tokenTag) {
  // Load CSV Files
  const priceData = await csv().fromFile(`./CSVs/${priceFile}.csv`);

  const priceJSON = [];
  priceData.forEach((priceDateData) => {
    const date = new Date(`${priceDateData['Date']}z`);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    if (date >= startDate && date <= endDate) {
      priceJSON.push({
        date: `${year}-${month}-${day}`,
        price: parseFloat(priceDateData['Close']),
      });
    } else {
      console.log(`No Price Data for ${tokenTag} on date ${year}-${month}-${day}`);
    }
  });

  // Sort and Save
  priceJSON.sort((a, b) => (a.Date > b.Date ? 1 : -1));
  fs.writeFileSync(`./priceJSONs/${priceFile}.json`, JSON.stringify(priceJSON));

  console.log(`JSON Price File Generated for ${priceFile}`);
}

async function calculateData(priceFile, tokenTag, address) {
  // Get File Names
  const stakingFile = `2022_${tokenTag}_${address}`;

  // Read JSON Price Data
  const priceDataBuffer = fs.readFileSync(path.resolve(`./priceJSONs/${priceFile}.json`));
  const priceDataJSONString = priceDataBuffer.toString();
  const priceData = JSON.parse(priceDataJSONString);

  // Read Staking Data
  const stakingData = await csv().fromFile(path.resolve(`./CSVs/${stakingFile}.csv`));

  let totalAmount: number = 0;
  stakingData.forEach((staking) => {
    let stakingDate = new Date(`${staking['Date']}z`);
    if (stakingDate >= startDate && stakingDate <= endDate) {
      const matchingData = priceData.find((priceDataDate) =>
        priceDataDate['date'].startsWith(staking['Date'].slice(0, 10))
      );
      if (matchingData && !isNaN(matchingData.price)) {
        totalAmount += parseFloat(staking.Value) * matchingData.price;
      } else {
        console.log(`No price matching for ${staking['Date']}`);
      }
    }
  });

  console.log(`Staking Rewards for ${tokenTag} in ${startDate.getFullYear()} is ${totalAmount.toFixed(2)} EUR`);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
