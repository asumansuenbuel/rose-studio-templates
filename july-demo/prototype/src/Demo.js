/**
 * @author Christian Warmuth
 * @version 1.0
 */

/* node libraries */
const request = require("request");
const xml2js = require('xml2js');

/* Vendor libraries */
const fetchWrapperServices = require('../lib/vendor/fetch/wrapperServices.js');
const mirWrapperServices = require('../lib/vendor/mir/wrapperServices.js');
const urWrapperServices = require('../lib/vendor/universalRobots/wrapperServices.js');

/** Get all shopOrders related to a site & workstation
 * 
 * @param {String} site 
 * @param {String} workStation 
 * @param {function} callback 
 */
function getShopOrderByWorkStation(site, workStation, callback) {
    let request = require("request");
    let XMLText = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mep="mepapi:com:sap:me:demand" xmlns:dem="http://www.sap.com/me/demand">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <mep:findShopOrderByWorkCenter>\r\n         <!--Optional:-->\r\n         <mep:Site>1710</mep:Site>\r\n         <!--Optional:-->\r\n         <mep:RequestContext>?</mep:RequestContext>\r\n         <!--Optional:-->\r\n         <mep:Request>\r\n            <dem:workCenterMask>WC-FRAME</dem:workCenterMask>\r\n         </mep:Request>\r\n      </mep:findShopOrderByWorkCenter>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>'
    let parser = new xml2js.Parser();
    parser.parseString(XMLText, function (err, result) {
        let str = JSON.stringify(result, null, 2);

        result["soapenv:Envelope"]["soapenv:Body"][0]["mep:findShopOrderByWorkCenter"][0]["mep:Request"][0]["dem:workCenterMask"][0] = workStation; //Modifying the query with the current attributes
        result["soapenv:Envelope"]["soapenv:Body"][0]["mep:findShopOrderByWorkCenter"][0]["mep:Site"][0] = site;
        let builder = new xml2js.Builder();
        let xml = builder.buildObject(result);
        let xmlString = xml.toString();

        let options = {
            method: 'POST',
            url: 'http://vhcalj2eci.dummy.nodomain:50000/manufacturing-papiservices/ShopOrderServiceWSService',
            headers: {
                'Cache-Control': 'no-cache',
                Authorization: 'Basic bWFjaGluZV91c3I6V2VsY29tZTE=',
                Action: 'mepapi:com:sap:me:demand/ShopOrderServiceWS/findShopOrderRequest',
                'User-Agent': 'Apache-HttpClient/4.1.1 (java 1.5)',
                Connection: 'Keep-Alive',
                Host: 'vhcalj2eci.dummy.nodomain:50000',
                SOAPAction: '\\"\\"',
                'Content-Type': 'text/xml',
            },
            body: xmlString
        };
        request(options, function (error, response, body) {
            if (error) {
                callback(new Error, null);
            }
            let parseString = require('xml2js').parseString;
            parseString(body, function (err, result) {

                allSO = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns4:findShopOrderByWorkCenterResponse"][0]["ns4:Response"][0]["ns2:shopOrderList"]


                let listSO = [];
                for (let i = 0; i < allSO.length; i++) {
                    listSO.push(allSO[i]["ns2:shopOrder"][0]);
                }
                callback(null, listSO);
            });
        });
    });
}

/** get the status of a ShopOrder 
 * 
 * @param {String} site 
 * @param {String} shopOrder 
 * @param {function} callback 
 */
function getShopOrderInformationStatus(site, shopOrder, callback) {
    let request = require("request");
    let XMLText = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mep="mepapi:com:sap:me:demand">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <mep:findShopOrder>\r\n         <!--Optional:-->\r\n         <mep:Site>1710</mep:Site>\r\n         <!--Optional:-->\r\n         <mep:RequestContext></mep:RequestContext>\r\n         <!--Optional:-->\r\n         <mep:Request>\r\n            <ref>ShopOrderBO:1710,20180622-000</ref>\r\n         </mep:Request>\r\n      </mep:findShopOrder>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>'
    let parser = new xml2js.Parser();
    let shopOrderRef = "ShopOrderBO:" + site + "," + shopOrder;
    parser.parseString(XMLText, function (err, result) {

        result["soapenv:Envelope"]["soapenv:Body"][0]["mep:findShopOrder"][0]["mep:Request"][0]["ref"][0] = shopOrderRef;
        result["soapenv:Envelope"]["soapenv:Body"][0]["mep:findShopOrder"][0]["mep:Site"][0] = site;
        let builder = new xml2js.Builder();
        let xml = builder.buildObject(result);
        let xmlString = xml.toString();

        let options = {
            method: 'POST',
            url: 'http://vhcalmemii.dummy.nodomain:50000/manufacturing-papiservices/ShopOrderServiceWSService',
            headers: {
                'Cache-Control': 'no-cache',
                Authorization: 'Basic bWFjaGluZV91c3I6V2VsY29tZTE=',
                Action: 'mepapi:com:sap:me:demand/ShopOrderServiceWS/findShopOrderRequest',
                'User-Agent': 'Apache-HttpClient/4.1.1 (java 1.5)',
                Connection: 'Keep-Alive',
                SOAPAction: '\\"\\"',
                'Content-Type': 'text/xml'
            },
            body: xmlString
        };
        request(options, function (error, response, body) {
            if (error) {
                callback(new Error, null);
            }
            let parseString = require('xml2js').parseString;
            parseString(body, function (err, result) {

                status = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns4:findShopOrderResponse"][0]["ns4:Response"][0]["ns2:status"][0]
                callback(null, [status, shopOrder]);
            });
        });
    });
}


/** Get All SFCs by the Shop Order
 * 
 * @param {String} site 
 * @param {String} shopOrder 
 * @param {function} callback
 */
function getSFCByShopOrder(site, shopOrder, callback) {
    let request = require("request");
    let XMLText = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mep="mepapi:com:sap:me:demand">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <mep:findSfcSerialNumberByShopOrder>\r\n         <!--Optional:-->\r\n         <mep:Site></mep:Site>\r\n         <!--Optional:-->\r\n         <mep:RequestContext>?</mep:RequestContext>\r\n         <!--Optional:-->\r\n         <mep:Request>\r\n            <ref></ref>\r\n         </mep:Request>\r\n      </mep:findSfcSerialNumberByShopOrder>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>';
    let parser = new xml2js.Parser();
    parser.parseString(XMLText, function (err, result) {
        let str = JSON.stringify(result, null, 2);

        result["soapenv:Envelope"]["soapenv:Body"][0]["mep:findSfcSerialNumberByShopOrder"][0]["mep:Site"] = site; //Modifying the query with the current attributes
        result["soapenv:Envelope"]["soapenv:Body"][0]["mep:findSfcSerialNumberByShopOrder"][0]["mep:Request"][0]["ref"] = shopOrder;
        let builder = new xml2js.Builder();
        let xml = builder.buildObject(result);
        let xmlString = xml.toString();

        var options = {
            method: 'POST',
            url: 'http://vhcalj2eci.dummy.nodomain:50000/manufacturing-papiservices/ShopOrderServiceWSService',
            headers: {
                'Cache-Control': 'no-cache',
                Authorization: 'Basic bWFjaGluZV91c3I6V2VsY29tZTE=',
                'User-Agent': 'Apache-HttpClient/4.1.1 (java 1.5)',
                Connection: 'Keep-Alive',
                Host: 'vhcalj2eci.dummy.nodomain:50000',
                SOAPAction: '\\"\\"',
                'Content-Type': 'text/xml'
            },
            body: xmlString
        };
        request(options, function (error, response, body) {
            if (error) {
                callback(new Error, null);
            }
            var parseString = require('xml2js').parseString;
            parseString(body, function (err, result) {

                //console.log(JSON.stringify(result, null, 2));
                allSFC = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns4:findSfcSerialNumberByShopOrderResponse"][0]["ns4:Response"]
                // console.log(JSON.stringify(allSFC, null, 2));
                // console.log(allSFC.length)
                let listSFC = [];
                for (var i = 0; i < allSFC.length; i++) {
                    listSFC.push(allSFC[i]["ns2:sfc"][0]);
                }
                callback(null, listSFC);
            });
        });
    });

}

/** Get the status of the SFCs
 * 
 * @param {String} site 
 * @param {String} sfc 
 * @param {function} callback - returns status
 */
function getOperationStatusBySFC(site, sfc, callback) {
    let parser = new xml2js.Parser();
    let XMLText = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:me="http://sap.com/xi/ME" xmlns:gdt="http://sap.com/xi/SAPGlobal/GDT">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <me:SfcStateRequest_sync>\r\n         <!--Optional:-->\r\n         <me:MessageHeader>\r\n            <!--Optional:-->\r\n            <gdt:ID schemeID="?" schemeAgencyID="?" schemeAgencySchemeAgencyID="?">?</gdt:ID>\r\n            <!--Optional:-->\r\n            <gdt:UUID>?</gdt:UUID>\r\n            <!--Optional:-->\r\n            <gdt:ReferenceID schemeID="?" schemeAgencyID="?" schemeAgencySchemeAgencyID="?">?</gdt:ReferenceID>\r\n            <!--Optional:-->\r\n            <gdt:ReferenceUUID>?</gdt:ReferenceUUID>\r\n         </me:MessageHeader>\r\n         <me:SfcStateRequest>\r\n            <me:SiteRef>\r\n               <me:Site>1710</me:Site>\r\n            </me:SiteRef>\r\n            <me:SfcRef>\r\n               <!--You may enter the following 2 items in any order-->\r\n               <me:Sfc>ME-FG-10000000582-0038</me:Sfc>\r\n               <!--Optional:-->\r\n               <me:SiteRef>\r\n                  <me:Site>1710</me:Site>\r\n               </me:SiteRef>\r\n            </me:SfcRef>\r\n            <me:includeSFCStepList>?</me:includeSFCStepList>\r\n         </me:SfcStateRequest>\r\n      </me:SfcStateRequest_sync>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>';
    parser.parseString(XMLText, function (err, result) {
        let str = JSON.stringify(result, null, 2);
        //console.log(str);
        result["soapenv:Envelope"]["soapenv:Body"][0]["me:SfcStateRequest_sync"][0]["me:SfcStateRequest"][0]["me:SiteRef"][0]["me:Site"][0] = site; //Modifying the query with the current attributes
        result["soapenv:Envelope"]["soapenv:Body"][0]["me:SfcStateRequest_sync"][0]["me:SfcStateRequest"][0]["me:SfcRef"][0]["me:Sfc"][0] = sfc;
        result["soapenv:Envelope"]["soapenv:Body"][0]["me:SfcStateRequest_sync"][0]["me:SfcStateRequest"][0]["me:SfcRef"][0]["me:SiteRef"][0] = site;
        let builder = new xml2js.Builder();
        let xml = builder.buildObject(result);
        let xmlString = xml.toString();
        let options = {
            method: 'POST',
            url: 'http://vhcalj2eci.dummy.nodomain:50000/manufacturing-services/SfcService',
            headers: {
                'Cache-Control': 'no-cache',
                Authorization: 'Basic bWFjaGluZV91c3I6V2VsY29tZTE=',
                Action: 'mepapi:com:sap:me:demand/ShopOrderServiceWS/findShopOrderRequest',
                'User-Agent': 'Apache-HttpClient/4.1.1 (java 1.5)',
                Connection: 'Keep-Alive',
                Host: 'vhcalj2eci.dummy.nodomain:50000',
                SOAPAction: '\\"\\"',
                'Content-Type': 'text/xml'
            },
            body: xmlString
        };

        request(options, function (error, response, body) {
            if (error) callback(new Error(error), null);
            let parseString = require('xml2js').parseString;
            parseString(body, function (err, result) {
                //  console.log(JSON.stringify(result, null, 3));
                let status = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns2:SfcStateConfirmation_sync"][0]["ns2:SfcStateResponse"][0]["ns2:SFCStatus"][0]["ns2:Sfc"][0]["ns2:StatusRef"][0]["ns2:Status"][0];

                if (status == "403" || status == "401" || status == "405") {
                    callback(null, status);
                }

            });

        });

    });
}

/** Get the status of the SFCs
 * 
 * @param {String} site 
 * @param {String} sfc 
 * @param {function} callback - returns SFC
 */
function getOperationListBySFC(site, sfc, callback) {
    let parser = new xml2js.Parser();
    let XMLText = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:me="http://sap.com/xi/ME" xmlns:gdt="http://sap.com/xi/SAPGlobal/GDT">\r\n   <soapenv:Header/>\r\n   <soapenv:Body>\r\n      <me:SfcStateRequest_sync>\r\n         <!--Optional:-->\r\n         <me:MessageHeader>\r\n            <!--Optional:-->\r\n            <gdt:ID schemeID="?" schemeAgencyID="?" schemeAgencySchemeAgencyID="?">?</gdt:ID>\r\n            <!--Optional:-->\r\n            <gdt:UUID>?</gdt:UUID>\r\n            <!--Optional:-->\r\n            <gdt:ReferenceID schemeID="?" schemeAgencyID="?" schemeAgencySchemeAgencyID="?">?</gdt:ReferenceID>\r\n            <!--Optional:-->\r\n            <gdt:ReferenceUUID>?</gdt:ReferenceUUID>\r\n         </me:MessageHeader>\r\n         <me:SfcStateRequest>\r\n            <me:SiteRef>\r\n               <me:Site>1710</me:Site>\r\n            </me:SiteRef>\r\n            <me:SfcRef>\r\n               <!--You may enter the following 2 items in any order-->\r\n               <me:Sfc>ME-FG-10000000582-0038</me:Sfc>\r\n               <!--Optional:-->\r\n               <me:SiteRef>\r\n                  <me:Site>1710</me:Site>\r\n               </me:SiteRef>\r\n            </me:SfcRef>\r\n            <me:includeSFCStepList>?</me:includeSFCStepList>\r\n         </me:SfcStateRequest>\r\n      </me:SfcStateRequest_sync>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>';
    parser.parseString(XMLText, function (err, result) {
        let str = JSON.stringify(result, null, 2);

        result["soapenv:Envelope"]["soapenv:Body"][0]["me:SfcStateRequest_sync"][0]["me:SfcStateRequest"][0]["me:SiteRef"][0]["me:Site"][0] = site; //Modifying the query with the current attributes
        result["soapenv:Envelope"]["soapenv:Body"][0]["me:SfcStateRequest_sync"][0]["me:SfcStateRequest"][0]["me:SfcRef"][0]["me:Sfc"][0] = sfc;
        result["soapenv:Envelope"]["soapenv:Body"][0]["me:SfcStateRequest_sync"][0]["me:SfcStateRequest"][0]["me:SfcRef"][0]["me:SiteRef"][0] = site;
        let builder = new xml2js.Builder();
        let xml = builder.buildObject(result);
        let xmlString = xml.toString();
        let options = {
            method: 'POST',
            url: 'http://vhcalj2eci.dummy.nodomain:50000/manufacturing-services/SfcService',
            headers: {

                'Cache-Control': 'no-cache',
                Authorization: 'Basic bWFjaGluZV91c3I6V2VsY29tZTE=',
                Action: 'mepapi:com:sap:me:demand/ShopOrderServiceWS/findShopOrderRequest',
                'User-Agent': 'Apache-HttpClient/4.1.1 (java 1.5)',
                Connection: 'Keep-Alive',
                Host: 'vhcalj2eci.dummy.nodomain:50000',
                SOAPAction: '\\"\\"',
                'Content-Type': 'text/xml'
            },
            body: xmlString
        };

        request(options, function (error, response, body) {
            if (error) callback(new Error(error), null);
            let parseString = require('xml2js').parseString;
            parseString(body, function (err, result) {
                //  console.log(JSON.stringify(result, null, 3));
                let status = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns2:SfcStateConfirmation_sync"][0]["ns2:SfcStateResponse"][0]["ns2:SFCStatus"][0]["ns2:Sfc"][0]["ns2:StatusRef"][0]["ns2:Status"][0];
                let sfc = "";
                if (status == "403" || status == "401") {
                    sfc = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns2:SfcStateConfirmation_sync"][0]["ns2:SfcStateResponse"][0]["ns2:SFCStatus"][0]["ns2:Sfc"][0]["ns2:Sfc"][0];
                }
                callback(null, sfc);
            });

        });

    });
}


/** Function to access all SFCs related to a ShopOrder
 * 
 * @param {String} site 
 * @param {String} shopOrder 
 * @param {function} callback 
 */
function getSFC(site, shopOrder, callback) {
    getSFCByShopOrder(site, shopOrder, function (error, result) {
        if (error) {
            callback(new Error(error), null);
        }
        console.log(result);

        let statusList = [];
        for (let i = 0; i, i < result.length; i++) {
            getOperationListBySFC(site, result[i], function (error, statusResult) {
                statusList.push(statusResult);
                if (statusList.length == result.length) {
                    let sfc = "";
                    for (let d = 0; d < statusList.length; d++) {
                        if (statusList[d] != "") {
                            callback(null, statusList[d]);
                            return;
                        }
                    }
                    callback(null, "");
                }

            });
        }


    });
}

/** GetTheSFC with Status 401 (not started and not finished)
 * 
 * @param {String} site 
 * @param {String} shopOrder 
 * @param {function} callback 
 */
function getInitialSFC(site, shopOrder, callback) {
    let getSFCStatus = setInterval(
        getSFC.bind(null, site, shopOrder, function (error, result) {
            if (error) {
                return console.error(err);
            }
            if (result != "") {
                callback(null, result);
                clearInterval(getSFCStatus);
                return;
            }
        }), 1000);

}



/** Ask periodically if there is a valid shopOrder for the requested workcenter in a specific site
 * 
 * @param {String} site 
 * @param {String} workCenter 
 * @param {function} callback 
 */
function getAValidSO(site, workCenter, callback) {
    let getSO = setInterval(
        getShopOrderByWorkStation.bind(null, site, workCenter, function (error, resultSoList) {
            if (error) {
                return console.error(err);
            }
            for (let i = 0; i < resultSoList.length; i++) {
                getShopOrderInformationStatus(site, resultSoList[i], function (error, resultStatus) {
                    if (error) {
                        return console.err(error);
                    }
                    if (resultStatus[0] === "Releasable") {
                        clearInterval(getSO);
                        callback(null, resultStatus[1]);
                    }
                })
            }
        }),
        1000);



}
/** Part of the demo script (splitted for reading purposes)
 * 
 * @param {String} site 
 * @param {String} shopOrder 
 * @param {function} callback 
 */
function demoGo(site, shopOrder, callback) {
    getInitialSFC(site, shopOrder, function (error, resultSFC) {
        console.log(resultSFC);
        mirWrapperServices.moveRobotToBin("GI-ZONE", null, "MIR");
        let getSFCStatus = setInterval(
            getOperationStatusBySFC.bind(null, "1710", resultSFC, function (error, resultState) {
                if (error) {
                    return console.error(err);
                }
                if (resultState === "403") {
                    clearInterval(getSFCStatus);
                    callback(null, resultSFC);



                }
            }), 1000);


    });
}

/**
 * Start the demo when every prerequesite is set
 * @param {String} site 
 * @param {String} workStation 
 * @param {function} callback 
 */
function startDemo(site, workStation, callback) {
    getAValidSO(site, workStation, function (error, SO) {
        if (error) {
            console.err(error);
            return;
        }
        demoGo(site, "ShopOrderBO:" + site + "," + SO, function (error, resultSFC) {
            mirWrapperServices.moveRobotToBin("Demo Start Position", null, "MIR");
            urWrapperServices.performRobotTask(function (error, result) {
                if (error) {
                    return console.error(error);
                }
                console.log("success");
                fetchWrapperServices.moveRobotToBin("Demo", "freight69");
                let getSFCStatus2 = setInterval(
                    getOperationStatusBySFC.bind(null, "1710", resultSFC, function (error, resultState) {
                        if (error) {
                            return console.error(err);
                        }
                        if (resultState === "405") {
                            fetchWrapperServices.moveRobotToBin("Demo2", "freight69");
                            console.log("Finished");
                            clearInterval(getSFCStatus2);
                            callback(null, "Finished");
                        }
                    }), 1000);
            });
        });
    });
}


startDemo("1710", "WC-FRAME", function (error, result) {
    if (error) {
        console.err(error);
        return;
    }

});


/*
module.exports = {
    startDemo: function (Site, WorkStation) {
        startDemo(Site, WorkStation);
    }
}
*/