// decode-sui-privkey.js
import { bech32 } from 'bech32';

// 1) Replace with your Bech32 key:
const bech32Key = 'suiprivkey1qpt0vnf6x4qcvq4fadmpues048ajvvvl8ekk9tn9y8kpvqz2ha5h5auz8th';

// 2) Decode the Bech32, extract the data words → bytes
const { words } = bech32.decode(bech32Key);
const data = bech32.fromWords(words);  
// data[0] is the scheme flag; data[1..32] is your private key

// 3) Hex-encode the 32-byte secret
const priv32 = Buffer.from(data.slice(1, 33));
console.log('Private key (hex):', priv32.toString('hex'));
