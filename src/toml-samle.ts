import * as toml from 'toml';
import * as fs from 'fs';

const sample = fs.readFileSync('./sample.toml', 'utf8');
const data = toml.parse(sample);
console.log(data.title);