/*
* @author Christian Warmuth
*/


/* Node libraries  */
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
/* ---------------- */

/* SAP libraries    */
const db = require('../lib/db');
/* ---------------- */

/* Configuration settings    */
var projectSettings = require('../config/ProjectSettings'); // project settings including usernames & passwords for HANA DB of RoSe
/* ---------------- */

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
    var DB_USER = projectSettings.dbUser;
    var DB_PASSWORD = projectSettings.dbPassword;
    var SQL_QUERY_ALL_VALUES = 'select * from "ROBOTICS"."SAP.ROBOT.INVENTORY"';
    db.connection(DB_USER, DB_PASSWORD, SQL_QUERY_ALL_VALUES, function (rst) {
        var keys = Object.getOwnPropertyNames(rst[1]);        
            res.render('tableHTMLContent', { data: rst, fields: keys });
    });
})

app.post('/', function (req, res) {
    var id = req.body.id, name = req.body.name, vendor = req.body.vendor, model = req.body.model, type = req.body.type, status = req.body.status, flag = req.body.flag;
    //console.log('ID: ' + id, " name: " + name, "vendor: " + vendor, "model: " + model, "type: " + type, "status: " + status, "flag: " + flag)
    var SQL_QUERY_INSERT_NEW_ENTRY = 'insert into "ROBOTICS"."SAP.ROBOT.INVENTORY" values(\'' + id + '\',\'' + name + '\',\'' + vendor + '\',\'' + model + '\',\'' + type + '\',\'' + status + '\',\'' + flag + '\')'
    var DB_USER = projectSettings.dbUser;
    var DB_PASSWORD = projectSettings.dbPassword;
    db.connection(DB_USER, DB_PASSWORD, SQL_QUERY_INSERT_NEW_ENTRY, function (rst) {
        var SQL_QUERY_ALL_VALUES = 'select * from "ROBOTICS"."SAP.ROBOT.INVENTORY"';

        db.connection(DB_USER, DB_PASSWORD, SQL_QUERY_ALL_VALUES, function (rst) {
            var keys = Object.getOwnPropertyNames(rst[1])
            let data = rst;
            res.render('tableHTMLContent', { data: rst , fields: keys });

        });
    });
})

 app.listen(3000, function () {
    console.log('Server listening on port 3000!')
})