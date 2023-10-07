import fs from 'fs';

const fileData = fs.readFileSync('./src/scripts/quakedata.csv', 'utf-8');

const splitLines = fileData.split('\n');

const jsonArray = [];

for (let i = 1; i < splitLines.length; i++) {
  const splitEntry = splitLines[i].split(',');
  const newDate = new Date(parseInt(splitEntry[4].slice(0,2)),
  parseInt(splitEntry[4].slice(2,4)),
  parseInt(splitEntry[4].slice(4,6)),)
  newDate.setHours(parseInt(splitEntry[4].slice(6,8)))
  newDate.setMinutes(parseInt(splitEntry[4].slice(8,10)))
  const quakeData = {
    type: splitEntry[0],
    long: parseFloat(splitEntry[2]),
    lat: parseFloat(splitEntry[1]),
    date: newDate.getTime(),
  };
  
  jsonArray.push(quakeData);
}

fs.writeFileSync('./static/quakedata.json', JSON.stringify(jsonArray));
