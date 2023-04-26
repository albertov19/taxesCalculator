# Taxes Calculator

To get started you need to find the Price info for each token in the currency you want it to calculate it. Best to do it daily. The field that it will read will be a `Close` field in the CSV.

For 2022, I used `https://coincodex.com/crypto/kusama/historical-data/`

Next, you need to also get the Staking related data from Subscan for each account.

The script will generate a Price JSON File if it does it find it, from a CSV.

CSVs need to be saved in the `CSVs` folder while the JSONs will be generated in the `priceJSON` folder.
