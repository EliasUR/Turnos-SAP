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
                    if (window.innerWidth <= 900) {
                        toolPage.setSideExpanded(false);
                        thisControler.getView().getModel("viewModel").setProperty("/menuBtn", false);
                    } else {
                        toolPage.setSideExpanded(true);
                        thisControler.getView().getModel("viewModel").setProperty("/menuBtn", true);
                    }
                }
                showSideBar();
                window.addEventListener("resize", showSideBar);
                this._setEditMedic();
            },
            _oBindingChange: function () {
                
            },
            _loadFilters: function () {
                let oViewModel = new JSONModel({
                    Dni: "",
                    Fecha: "",
                    Hora: "",
                })
                this.getView().setModel(oViewModel,"filters")
            },
            _setEditMedic: function (sPath) {
                this.edited = {
                    HoraDeIngreso: "",
                    HoraDeEgreso: ""
                }
            },       
            _afterCloseDialog: function (oEvent) {
                oEvent.getSource().destroy();
                thisControler.oEditFragment = null;
            },
            
            onInit: function () {
                thisControler = this;
                this.getRouter().getRoute("Turnos").attachPatternMatched(this._onPatternMatched, this);
                this.loadViewModel(false, true);
            },
            //CREATE
            onCreate: function (oEvent) {
                let oContext = oEvent.getSource().getBindingContext()
                let sEsp = oContext.getProperty("IdEspecialidad");
                let sMed = oContext.getProperty("Legajo");
                this.onNuevoTurno(sMed, sEsp);
            },
            //DELETE
            onDelete: function (oEvent) {
                let oContext = oEvent.getSource().getBindingContext();
                let sPath = oContext.getPath();
                var oDataModel = this.getOwnerComponent().getModel();
                MessageBox.warning("Esta seguro que desea eliminar este turno", {
                    title: "Cuidado",
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
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

            //UPDATE MEDICO
            onInputChange: function (oEvent) {
                let oContext = oEvent.getSource().getBindingContext();
                let timeId = oEvent.getParameter('id');
                let timeNewValue = this.formatTime(oEvent.getParameter('newValue'));

                if(timeId.includes("ingreso")){
                    this.edited.HoraDeIngreso = timeNewValue;
                    this.edited.HoraDeEgreso = oContext.getProperty("HoraDeEgreso");
                }
                else{
                    this.edited.HoraDeEgreso = timeNewValue;
                    this.edited.HoraDeIngreso = oContext.getProperty("HoraDeIngreso");
                }

                this.getView().byId("SaveEdit").setEnabled(true)
                this.getView().byId("CancelEdit").setEnabled(true)
            },
            onSaveChanges: function (oEvent) {
                let path = oEvent.getSource().getBindingContext().getPath();
                let oModel = this.getView().getModel();
                let fnSuccess = (oResponse) => {
                    MessageToast.show("Cambios guardados correctamente");
                    thisControler.getOwnerComponent().getModel().refresh(true, true);
                }
                let fnError = (error) => {
                    MessageBox.error("No se ha podido cambiar la jornada laboral.");
                    thisControler.onCancelChanges();
                }
                oModel.update(path, this.edited, {
                    success: fnSuccess,
                    error: fnError 
                });

                this.getView().byId("SaveEdit").setEnabled(false);
                this.getView().byId("CancelEdit").setEnabled(false);
                
            },
            onCancelChanges: function (oEvent) {
                thisControler.getOwnerComponent().getModel().refresh(true, true);

                this.getView().byId("SaveEdit").setEnabled(false);
                this.getView().byId("CancelEdit").setEnabled(false);
                this._setEditMedic(oEvent.getSource().getBindingContext().getPath());
            },

            //UPDATE TURNO
            onEdit: function (oEvent) {
                let path = oEvent.getSource().getBindingContext().getPath();
                let hora = oEvent.getSource().getBindingContext().getProperty("HoraTurno");
                let fecha = oEvent.getSource().getBindingContext().getProperty("FechaTurno");
                if (!this.oEditFragment) {
                    this.oEditFragment =
                        sap.ui.core.Fragment.load({
                            name: "com.softtek.aca2024er.view.fragments.EditarTurno",
                            controller: thisControler
                        }).then(function (oDialog) {
                            thisControler.getView().addDependent(oDialog);
                            let oModel = new JSONModel({
                                path: path,
                                HoraTurno: hora,
                                FechaTurno: fecha
                            });
                            oModel.setDefaultBindingMode("TwoWay");
                            oDialog.setModel(oModel, "Turno");
                            oDialog.attachAfterClose(thisControler._afterCloseDialog);
                            return oDialog;
                        }.bind(thisControler));
                }
                this.oEditFragment.then(function (oDialog) {
                    oDialog.open();
                }.bind(thisControler));
            },
            onSaveTurno: function (oEvent) {
                var oDataModel = this.getView().getModel();
                let oEntry = oEvent.getSource().getModel("Turno").getData();
                let path = oEntry.path;
                let oData = {
                    FechaTurno: this.formatDate(oEntry.FechaTurno),
                    HoraTurno: oEntry.HoraDeEgreso
                }
                oDataModel.update(path, oData, {
                    success: function (oResponse) {
                        var result = oResponse?.results;
                        MessageToast.show("Se ha postergado el turno correctamente");
                        thisControler.getOwnerComponent().getModel().refresh(true, true);
                        thisControler.onCerrarEdit();
                    },
                    error: function (oError) {
                        MessageBox.error("El horario elegido no está disponible");
                    }
                });
            },
            onCerrarEdit: function (oEvent) {
                this.oEditFragment.then(function (oDialog) {
                    oDialog.close();
                }.bind(this));
            },
            
        });
    });
