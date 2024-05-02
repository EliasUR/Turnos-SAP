sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History, JSONModel) {
        "use strict";
        var that;
        return Controller.extend("com.softtek.aca2024er.controller.BaseController", {
            loadViewModel: function (page, back, menu, expanded) {
                const oViewModel = new JSONModel({
                    page: page,
                    backBtn: back,
                    menuBtn: menu,
                    expanded: expanded
                });
                this.getView().setModel(oViewModel,"viewModel");
            },
            formatDate: function (date) {
                return date + "T00:00:00"
            },
            formatTime: function (time) {
                let hhmm = time.split(":");
                return "PT" + hhmm[0] + "H" + hhmm[1] + "M00S";
            },
            getRouter: function () {
                return this.getOwnerComponent().getRouter();
            },
            /**
             * Navigates back in browser history or to the home screen
             */
            onBack: function () {
                var oHistory = History.getInstance();
                var oPrevHash = oHistory.getPreviousHash();
                if (oPrevHash !== undefined) {
                    window.history.go(-1);
                } else {
                    this.getRouter().navTo("RouteMain");
                }
            },
            onNavToHome: function () {
                this.getRouter().navTo("RouteMain");
            },
            onVerMedicos: function () {
                this.getRouter().navTo("Medicos");
            },
            onVerMedicos: function () {
                this.getRouter().navTo("Medicos");
            },
            onSacarTurno: function () {
                this.getRouter().navTo("SacarTurno", {LegajoMedico: "Nuevo", IdEspecialidad: "Nuevo"});
            },
            onItemSelect: function(oEvent) {
                var item = oEvent.getParameter('item').getKey();
                switch(item){
                    case "Back":
                        this.onBack();
                        break;
                    case "Home":
                        this.onNavToHome();
                        break;
                    case "Nuevo Turno":
                        this.onSacarTurno();
                        break;
                    case "Medicos": 
                        this.onVerMedicos();
                        break;
                    default:
                        // this.byId("pageContainer").to(this.getView().createId(item));
                        // Aca debo implementar los filtros
                        break;
                }
            },
            onMenuButtonPress: function() {
                var oModel = this.getView().getModel("viewModel")
                var expanded = oModel.getProperty("/expanded")
                oModel.setProperty("/expanded", !expanded)
            }
        });
    });
