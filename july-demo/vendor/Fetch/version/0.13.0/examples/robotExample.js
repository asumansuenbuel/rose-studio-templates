'use strict';

/*  eslint no-console: 0*/
const FetchcoreClient = require('../src/FetchcoreClient');
const Robot           = require('../src/resources/robots/Robot');
const request         = require('request');
const rp              = require('request-promise');

const hostname = 'sap.fetchcore-cloud.com';
const port = 443;
const enableSSL = true;
const proxy = 'http://proxy.wdf.sap.corp:8080';

const client = FetchcoreClient.defaultClient();
client.configure(hostname, port, enableSSL, proxy);

const username = 'sap@demo.com';
const password = 'robotslikesap';


// Start with authentication, log into your Fetchcore account
client.SAPAuthenticate(username, password)
.then(() => {
  console.log('Authenticated');
})
.catch((clientError) => {
  console.log(clientError.toString());
});

setTimeout(() => {
  console.log(FetchcoreClient.defaultClient()._token);
  Robot.get('freight60').then((robot) => {
      console.log(robot.name);
  })
  .catch((clientError) => {
      console.log(clientError.toString());
  })
}, 2000);

// request.post(hostname, {
//     form: {
//       username,
//       password
//     }
//   })
//   .on('response', (res) => {
//     console.log('received response...');
//   })
//   .on('data', (d) => {
//     console.log('receiving data...');
//     console.log(d.toString('utf8'));
//   })
//   .on('error', (err) => {
//     console.log(err);
//   });

// const options = {
//   method: 'POST',
//   uri: hostname,
//   port,
//   form: {
//     username,
//     password
//   }
// }
// rp(options).then((res) => {
//   console.log(res);
// }).catch((err) => {
//   console.log(err);
// })


// Authentication is an asychronous process, we need to use setTimeout to give
// time for server to respond back with a login success

// setTimeout(() => {
//     // const freight55 = new Robot({
//     //     name: 'freight55',
//     //     footprint: 'HMI15',
//     //     configurations: ['MOBILE', 'HMI']
//     // });
//     //
//     // freight55.save('robotics').catch((clientError) => {
//     //     console.log(clientError.toString());
//     // });
//
//     Robot.get('freight55').then((robot) => {
//         console.log(robot.name);
//     }).catch((clientError) => {
//         console.log(clientError.toString());
//     });
//
//     Robot.all().then((robotList) => {
//         robotList.forEach((robot) => {
//             console.log(robot.name);
//         });
//     }).catch((clientError) => {
//         console.log(clientError.toString());
//     });
// }, 1000);
