sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel) {
        "use strict";
        var thisControler;
        return BaseController.extend("com.softtek.aca2024er.controller.Main", {
            //Private Methods
            //Public Methods for actions
            onInit: function () {
                thisControler = this;
                this.loadViewModel("Home", false, false, false);
            },
           
        });
    });
