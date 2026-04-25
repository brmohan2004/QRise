const dns = require('dns');

const hostname = 'ajmtpvxpwerhrlxhrhxs.supabase.co';

dns.lookup(hostname, (err, address, family) => {
  if (err) {
    console.error('DNS Lookup Failed:', err);
  } else {
    console.log('Address:', address);
    console.log('Family: IPv', family);
  }
});
