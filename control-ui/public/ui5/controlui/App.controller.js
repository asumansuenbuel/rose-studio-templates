sap.ui.define([
    'jquery.sap.global',
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
], function (jQuery, JSONModel, Controller, MessageToast) {
    "use strict";
    return Controller.extend("controlui.App", {
	onInit: function() {
	    //console.log(this);
	    const m = new JSONModel();
	    this.getView().setModel(m, "robot");
	    const url = '/robot/0'
	    m.loadData(url)
	    m.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay)
	    m.attachRequestCompleted(() => {
		var data = m.getData();
		console.log("robot data:")
		console.log(`in App controller: ${JSON.stringify(m.getData(), null, 2)}`);
		console.log(data)
	    });
	},
	on_take_a_picture() {
	    console.log(`taking a picture...`);
	    const view = this.getView();
	    const elem = view.byId(view.createId("picture-taken"));
	    console.log(elem);
	    elem.setSrc("https://www.joc.com/sites/default/files/field_feature_image/warehouse%2040.jpg");
	}
    });
});
