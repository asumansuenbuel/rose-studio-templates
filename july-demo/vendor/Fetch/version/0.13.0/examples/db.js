'use strict';

/*
* @author xshao created 6/25/17
* this module is to connect to HANA DB on CF environment
*/

const hdb = require('hdb');


module.exports = {
  hello: function(name) {
    console.log("hello" + name);
  },

  connection : function(DB_USER, DB_PASSWORD, SQL_QUERY, cb) {

       if(process.env.VCAP_SERVICES){
        //app is running in the cloud
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
            // database : credentials.name
          };
        }
        else{
          //local setup - credentials used if app is runnig local
          console.log('App is running locally and accessing HANA via a Tunnel');
          var options = {
            host     : 'localhost',
            port     : 30015,
            user     : 'TESTUSER',
            password : 'Sap12345',
            database : 'ROBOTICS'
           };
        }  
        
        var clienthana = hdb.createClient(options);

        clienthana.on('error', function (err) {
            console.error('Network connection error', err);
        });

        clienthana.connect(function (err) {
            if (err) {
                return console.error('i028948 Connect error', err);
            }

            clienthana.exec(SQL_QUERY, function (err, rows) {
                clienthana.end();
                if (err) {
                    return console.error('Execute error:', err);
                }

                console.log('SQL query executed, now returning the 1st row values');
                cb(rows);
                           

            });
        });

  }

    

}
