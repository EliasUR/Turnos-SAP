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
        return BaseController.extend("com.softtek.aca2024er.controller.SacarTurno", {
            //Private Methods
            //Public Methods for actions
            _onPatternMatched: function () {
                let sideBar = this.getView().byId("sideBar");
                sideBar.removeSelections();
                debugger
                let nav = this.getView().byId("iconTabHeader");
                nav.removeSelections();

            },

            onInit: function () {
                thisControler = this;
                this.loadViewModel("Nuevo Turno",true, false, false);
            },
            
            routeMached: function () {
                this.loadViewModel("Nuevo Turno",true, false, false);
            }
        });
    });
