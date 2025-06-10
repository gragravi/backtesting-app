// ~/backtesting-app/js/utils/csvConverter.js
const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function convertCSV(inputPath, outputPath) {
  const rl = readline.createInterface({
    input: fs.createReadStream(inputPath),
    crlfDelay: Infinity,
  });

  const output = fs.createWriteStream(outputPath);
  output.write("time,open,high,low,close\n");

  let isHeader = true;

  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue;
    }

    const [gmtTime, open, high, low, close] = line.split(',');
    const isoTime = gmtTime.replace(/\./g, '-').replace(' ', 'T');
    const timestamp = new Date(isoTime).getTime();

    if (!timestamp) continue;

    output.write(`${timestamp},${open},${high},${low},${close}\n`);
  }

  output.close();
  console.log("✅ Conversion terminée : ohlcv_data.csv généré !");
}

const inputFile = path.resolve(__dirname, '../../data/bid/eurusd_bid.csv');
const outputFile = path.resolve(__dirname, '../../data/ohlcv_data.csv');

convertCSV(inputFile, outputFile);