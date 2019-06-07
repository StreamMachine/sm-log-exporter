#!/usr/bin/env/node
moment = require('moment');
exec = require('child_process').exec;

d = moment().format("YYYY-MM-DD");
y = moment().subtract(1, 'days').format("YYYY-MM-DD");

//format of fileame should look like: kpcc-w3c-2019-06-01.log
filename = `kpcc-w3c-${y}.log`;

cmd = `
./runner-cmd \
--server ${process.env.ELASTICSEARCH_SERVER} \
--zone America/Los_Angeles \
--index ${process.env.ELASTICSEARCH_INDEX} \
--start ${y} \
--end ${d} \
> /reports/${filename}
`;

console.log(`Preparing to write log file: ${filename}`);

exec(cmd, (err, stdout, stderr) => {
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
  if (err !== null) {
    console.log(`exec error: ${err}`);
  }
});

