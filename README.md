# Taxes Calculator

Script to help calculate taxes for Moonbeam | Moonriver | Polkadot | Kusama.

## Getting Started

### Get CSVs of Prices
(Some token prices are already available in the `priceJSONs` folder, feel free to use those, read the [disclaimer](#disclaimer)).

You'll need the Price info for each token in the currency you want it to calculate it. Best to do it daily. The field that it will read will be a `Close` field in the CSV.

For example: `https://coincodex.com/crypto/kusama/historical-data/`

### Get Subscan Staking Data

Next, you need to also get the Staking related data from Subscan for each account. For example, for the demo account (Binance) in Polkadot, this would be the URL:

[https://polkadot.subscan.io/reward?address=16ZL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD&role=account&category=reward](https://polkadot.subscan.io/reward?address=16ZL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD&role=account&category=reward)

You need to save the CSV file in the  `./CSVs` directory.

### Generate JSON Price File

The first time you run the script, it will generate a Price JSON File if it does it find it, from a CSV file located in `./CSVs`.

CSVs need to be saved in the `CSVs` folder while the JSONs will be generated in the `priceJSON` folder.

## Example

Getting Staking reward data for `16ZL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD` which is one of Binance accounts in Polkadot.

First you run (to get the Price JSON):

```
ts-node getTaxes.ts --n polkadot --a 16ZL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD --y 2022
No Price Data for DOT on date 2021-12-31
JSON Price File Generated for 2022_DOT_Price
```

Once the Price JSON file is generated, run it again:

```
ts-node getTaxes.ts --n polkadot --a 16ZL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD --y 2022
Staking Rewards for DOT in 2022 is 129271.77 EUR
```

You can also provide multiple addresses in multiple networks (for a fixed year). For example:

```
ts-node getTaxes.ts --n polkadot,moonbeam,moonriver,kusama --a DOT_ADDRESS,GLMR_ADDRESS,MOVR_ADDRESS,KSM_ADDRESS --y 2022
```


## Disclaimer
**This code is a tool that you can use at your own risk!**
