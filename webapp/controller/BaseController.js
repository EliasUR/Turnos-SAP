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
            loadViewModel: function (back, menu) {
                const oViewModel = new JSONModel({
                    backBtn: back,
                    menuBtn: menu
                });
                this.getView().setModel(oViewModel,"viewModel");
            },
            formatDate: function (date) {
                return new Date(date + "T00:00:00");
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
                this.getRouter().navTo("Medicos", {IdEspecialidad: "All"});
            },
            onVerMedicosEsp: function (especialidad) {
                this.getRouter().navTo("Medicos", {IdEspecialidad: especialidad});
            },
            onSacarTurno: function () {
                this.getRouter().navTo("SacarTurno", {LegajoMedico: "Nuevo", IdEspecialidad: "Turno"});
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
                    case "NewTurno":
                        this.onSacarTurno();
                        break;
                    case "Medicos": 
                        this.onVerMedicos();
                        break;
                    case "Especialidad": 
                        break;
                    default:
                        this.onVerMedicosEsp(item);
                        // this.getView().byId("tablaDeMedicos").getBinding("items").filter(
                        //     new Filter("IdEspecialidad", FilterOperator.EQ, item)
                        // );
                        break;
                }
            },
            onMenuButtonPress: function() {
                var toolPage = this.byId("page");
    			toolPage.setSideExpanded(!toolPage.getSideExpanded());
            }
        });
    });
