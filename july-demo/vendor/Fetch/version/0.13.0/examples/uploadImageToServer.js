const FetchcoreClient = require('../src/FetchcoreClient');
const FormData        = require('form-data');
const FileSystem      = require('fs');

const hostname = 'localhost';
const port = 8000;

const imagePath = '../util/base_image.png';

const client = FetchcoreClient.defaultClient();
client.configure(hostname, port);

const DataURI = require('datauri').promise;

// Start with authentication, log into your Fetchcore account
client.authenticate('fetch', 'robotics')
    .then(() => {
        console.log('Authenticated');
    })
    .catch((clientError) => {
        console.log(clientError.toString);
    });

const readStream = FileSystem.createReadStream(imagePath);
const file = FileSystem.readFileSync(imagePath);

// readStream.on('data', (chunk) => {
//     const form = new FormData();
//     form.append('name', 'Nadir');
//     form.append('resolution', 0.05);
//     form.append('in_progress', false);
//     form.append('image', chunk);
//
//     const config = {
//         headers: {
//             'content-type': 'multipart/form-data'
//         }
//     };
//
//     client.post('/api/v1/maps/', form, config)
//     .then((image) => {
//         console.log(image);
//     })
//     .catch((clientError) => {
//         console.log('Something went wrong');
//     });
// });

setTimeout(() => {
    DataURI(imagePath).then((content) => {
        // const data = {
        //     name: 'Nadir',
        //     resolution: 0.05,
        //     in_progress: false
        // };

        const form = new FormData();
        form.append('name', 'Test Map');
        form.append('resolution', 0.05);
        form.append('in_progress', false);
        form.append('image', content);


        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        };

        client.post('/api/v1/maps/', form, config)
            .then((map) => {
                console.log(map);
            })
            .catch((clientError) => {
                console.log('Something went wrong', clientError.toString());
            });
    })
    .catch(() => {
        // Error
    });
}, 1000);
