/*
* @author Naomi Shao created 6/19/17, modified 6/25/17
* abstracing this module for db connection to HANA
* using hdb - client for nodejs
*/

'use strict';

const hdb = require('hdb');

module.exports = {

  connection : function(DB_USER, DB_PASSWORD, SQL_QUERY, cb) {

       if(process.env.VCAP_SERVICES){
        // for app running in the cloud
        // parse the environement variabels to get the credentials
          console.log('App is running in the Cloud and accessing HANA on the cloud');
          var svcs = JSON.parse(process.env.VCAP_SERVICES);
          var credentials = svcs['hana'][0].credentials;

          console.log('credentials.host: ' + credentials.host);
          console.log('credentials.port: ' + credentials.port);
          console.log('credentials.user: ' + credentials.user);
          console.log('credentials.password: ' + credentials.password);

          var options = {
            host     : credentials.host,
            port     : credentials.port,
            user     : DB_USER,
            password : DB_PASSWORD,
          };
        }
        else{
          // for local setup - credentials used if app is runnig localhost
          console.log('App is running locally and accessing HANA via a Tunnel');
          var options = {
            host     : 'localhost',
            port     : 30015,
            user     : DB_USER,
            password : DB_PASSWORD,
            
           };
        }  
        
        var clienthana = hdb.createClient(options);

        clienthana.on('error', function (err) {
            console.error('Network connection error', err);
        });

        clienthana.connect(function (err) {
            if (err) {
                return console.error('Error in connecting to the HANA DB', err);
            }

            clienthana.exec(SQL_QUERY, function (err, rows) {
                clienthana.end();
                if (err) {
                    return console.error('Execute error:', err);
                }

                console.log('SQL query executed, now returning the row values');
                cb(rows);
                           

            });
        });

  }
}
