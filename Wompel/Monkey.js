/** demo script
 * 
 */

function startDemo(site, workStation, callback) {
    getAValidSO(site, workStation, function (error, SO) {
        if (error) {
            console.err(error);
            return;
        }
        demoGo(site, "ShopOrderBO:" + site + "," + SO, function (error, resultSFC) {
            //! if (robot1.shortName === 'Mir') {
            mirWrapperServices.moveRobotToBin("Demo Start Position", null, "MIR");
            //! }
            //! if (robot1.shortName === 'Fetch') {
            fetchWrapperServices.moveRobotToBin("Demo Start Position", "freight69")
            //!}
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