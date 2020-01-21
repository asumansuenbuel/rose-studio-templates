sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel"
], function (UIComponent, JSONModel, ResourceModel) {
    "use strict";
    return UIComponent.extend("controlui.Component", {
	metadata: {
	    manifest: "json"
	},
	init : function () {
	    console.log("in controlui/Component.init()...");
	    // call the init function of the parent
	    // create the views based on the url/hash
	    /*
	    const m = new JSONModel();
	    sap.ui.getCore().setModel(m,"robot");
	    const url = '/robot/0'
	    m.loadData(url)
	    m.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay)
	    m.attachRequestCompleted(function() {
		var data = m.getData();
		console.log("robot data:")
		console.log(data)
	    });
	    */
	    UIComponent.prototype.init.apply(this, arguments);
	    //this.getRouter().initialize();
	    //console.log(JSON.stringify(this.getManifest(), null, 2));
	}
    });
});
