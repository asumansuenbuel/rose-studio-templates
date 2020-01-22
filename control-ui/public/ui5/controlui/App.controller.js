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
    _getRandomImage(oldImage) {
      let images = $${JSON.stringify(images, null, 2)};
      let attempts = images.length ===1 ? 1 : 100;
      try {
        for(let i = 0; i < attempts; i++) {
	  let index = Math.trunc(Math.random() * images.length);
          let img = images[index];
          if (img !== oldImage || i === attempts - 1) {
	    return img;
          }
        }
      } catch (err) {
      }
      return '';
    },
    on_take_a_picture() {
      console.log(`taking a picture...`);
      const view = this.getView();
      const elem = view.byId(view.createId("picture-taken"));
      console.log(elem);
      elem.setSrc(this._getRandomImage(elem.getSrc()));
    }
  });
});
