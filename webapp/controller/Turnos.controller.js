sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) {
        "use strict";
        var thisControler;
        return BaseController.extend("com.softtek.aca2024er.controller.Turnos", {
            //Private Methods
            _onPatternMatched: function (oEvent) {
                let sMedico = oEvent.getParameter("arguments").LegajoMedico;
                let sEsp = oEvent.getParameter("arguments").IdEspecialidad;
                let sPath = "/MedicoSet(Legajo='" + sMedico + "',IdEspecialidad='" + sEsp + "')";
                let oModel = this.getOwnerComponent().getModel();
                oModel.metadataLoaded().then(function () {
                    this.getView().bindElement({
                        path: sPath,
                        events: {
                            change: this._oBindingChange.bind(this),
                            dataRequested: function () {
                                thisControler.getView().setBusy(true);
                            },
                            dataReceived: function () {
                                thisControler.getView().setBusy(false);
                            }
                        }
                    });
                }.bind(this));
                var toolPage = this.byId("page");
                var showSideBar = function() {
                    if (window.innerWidth <= 800) {
                        toolPage.setSideExpanded(false);
                        thisControler.getView().getModel("viewModel").setProperty("/menuBtn", false);
                    } else {
                        toolPage.setSideExpanded(true);
                        thisControler.getView().getModel("viewModel").setProperty("/menuBtn", true);
                    }
                }
                showSideBar();
                window.addEventListener("resize", showSideBar);
            },
            _oBindingChange: function (oEvent) {
                // debugger
            },
            _loadFilters: function () {
                let oViewModel = new JSONModel({
                    Dni: "",
                    Fecha: "",
                    Hora: "",
                })
                this.getView().setModel(oViewModel,"filters")
            },

             //Public Methods for actions
            onInit: function () {
                thisControler = this;
                this.getRouter().getRoute("Turnos").attachPatternMatched(this._onPatternMatched, this);
                this.loadViewModel(false, true);
                this._loadFilters();
            },
            //FILTERS
            onSearch: function () {
                let aFilters = [];
                let oModel = this.getView().getModel("filters");
                let fDni = oModel.getProperty("/Dni");
                let fFecha = this.formatDate(oModel.getProperty("/Fecha"));
                let fHora = this.formatTime(oModel.getProperty("/Hora"));  

                if(fDni) {
                    aFilters.push(new Filter("DniPaciente", FilterOperator.Contains, fDni))
                }
                if(fFecha) {
                    aFilters.push(new Filter("FechaTurno", FilterOperator.EQ, fFecha))
                }
                if(fHora) {
                    aFilters.push(new Filter("HoraTurno", FilterOperator.EQ, fHora))
                }
                this.getView().byId("turnos").getBinding("items").filter(aFilters);
            },
            onClearFilters: function () {
                this.getView().byId("turnos").getBinding("items").filter([]);
                this._loadFilters();
            },
            onCreate: function (oEvent) {
                let oContext = oEvent.getSource().getBindingContext()
                let sEsp = oContext.getProperty("IdEspecialidad");
                let sMed = oContext.getProperty("Legajo");
                this.onNuevoTurno(sMed, sEsp);
            },
            onDelete: function (oEvent) {
                let oContext = oEvent.getSource().getBindingContext();
                let sPath = oContext.getPath();
                var oDataModel = this.getOwnerComponent().getModel();
                MessageBox.warning("Esta seguro que desea eliminar este turno", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if(sAction == "OK") {  
                            oDataModel.remove(`${sPath}`, {
                                success: function (oResponse) {
                                    MessageToast.show("Se ha eliminado correctamente");
                                    thisControler.getOwnerComponent().getModel().refresh(true, true);
                                },
                                error: function (oError) {
                                    MessageBox.error("No puede eliminar este turno.");
                                }
                            });
                        } else {
                            MessageToast.show("Eliminacion abortada");
                        }
                    }
                });
            },
        });
    });
