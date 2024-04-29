sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) {
        "use strict";
        var thisControler;
        return Controller.extend("com.softtek.aca2024er.controller.Main", {
            //Private Methods
            _loadViewModel: function () {
                const oViewModel = new JSONModel({
                    busy: false,
                    hasUIchanges: false,
                });
                this.getView().setModel(oViewModel,"viewModel");
            },
            _loadFilters: function () {
                let oViewModel = new JSONModel({
                    Apellido: "",
                    Nombre: "",
                    Especialidad: "",
                })
                this.getView().setModel(oViewModel,"filters")
            },           
            _afterCloseDialog: function (oEvent) {
                oEvent.getSource().destroy();
                thisControler.oCreateFragment = null;
            },
            _setUIchanges: function (hasChanges) {
                if(hasChanges === undefined){
                    hasChanges = this.getView().getModel().hasPendingChanges();
                }

                this.getView().getModel("viewModel").setProperty("/hasUIchanges", hasChanges);
            },
            _setBussy: function (isBusy) {
                this.getView().getModel("viewModel").setProperty("/busy", isBusy);
            },
            _formatTime: function (time) {
                let hhmm = time.split(":");
                return "PT" + hhmm[0] + "H" + hhmm[1] + "M00S";
            },
            
            //Public Methods for actions
            onInit: function () {
                thisControler = this;
                this._edited = {};
                this._oMedicTable = this.getView().byId("tablaDeMedicos");
                this._loadViewModel();
                this._loadFilters();
            },

            //FILTERS
            onSearch: function () {
                let aFilters = [];
                let oModel = this.getView().getModel("filters");
                let fNombre = oModel.getProperty("/Nombre").toUpperCase();
                let fApellido = oModel.getProperty("/Apellido").toUpperCase();
                let fEspecialidad = oModel.getProperty("/Especialidad");  

                if(fApellido) {
                    aFilters.push(new Filter("Apellido", FilterOperator.Contains, fApellido))
                }
                if(fNombre) {
                    aFilters.push(new Filter("Nombre", FilterOperator.Contains, fNombre))
                }
                if(fEspecialidad) {
                    aFilters.push(new Filter("IdEspecialidad", FilterOperator.EQ, fEspecialidad))
                }
                this._oMedicTable.getBinding("items").filter(aFilters);
            },
            onClearFilters: function () {
                this._oMedicTable.getBinding("items").filter([]);
                this._loadFilters();
            },
           
            //CREATE
            onCreate: function () {
                if (!this.oCreateFragment) {
                    this.oCreateFragment =
                        sap.ui.core.Fragment.load({
                            name: "com.softtek.aca2024er.view.fragments.CreateMedico",
                            controller: thisControler
                        }).then(function (oDialog) {
                            thisControler.getView().addDependent(oDialog);
                            let oModel = new JSONModel({
                                "Legajo": "",
                                "Nombre": "",
                                "Apellido": "",
                                "IdEspecialidad": "",
                                "HoraDeIngreso": "00:00",
                                "HoraDeEgreso": "00:00"
                            });
                            oModel.setDefaultBindingMode("TwoWay");
                            oDialog.setModel(oModel, "Medico");
                            oDialog.attachAfterClose(thisControler._afterCloseDialog);
                            return oDialog;
                        }.bind(thisControler));
                }
                this.oCreateFragment.then(function (oDialog) {
                    oDialog.open();
                }.bind(thisControler));
            },
            onSaveCreate: function (oEvent) {
                // llamada al odata:
                let oEntry = oEvent.getSource().getModel("Medico").getData();
                var oDataModel = this.getView().getModel();
                oDataModel.create("/MedicoSet", oEntry, {
                    success: function (oResponse) {
                        var result = oResponse?.results;
                        MessageToast.show("Se ha añadido un nuevo medico correctamente");
                        thisControler.getOwnerComponent().getModel().refresh(true, true);
                        thisControler.onCerrarCreate();
                    },
                    error: function (oError) {
                        // manejar excepción del servicio
                        MessageBox.error("Rellene todos los campos y seleccione una especialidad existente.");
                    }
                });
            },
            onCerrarCreate: function (oEvent) {
                this.oCreateFragment.then(function (oDialog) {
                    oDialog.close();
                }.bind(this));
            },
            //DELETE
            onDelete: function (oEvent) {
                let sPath = oEvent.getSource().getBindingContext().getPath();
                var oDataModel = this.getOwnerComponent().getModel();
                oDataModel.remove(`${sPath}`, {
                    success: function (oResponse) {
                        MessageToast.show("Medico eliminado correctamente de la lista");
                        thisControler.getOwnerComponent().getModel().refresh(true, true);
                    },
                    error: function (oError) {
                        MessageBox.error("No puede eliminar al Medico porque tiene turnos asignados");
                    }
                });
            },
            //EDIT
            onInputChange: function (oEvent) {
                let sPath = oEvent.getSource().getBindingContext().getPath();
                let timeId = oEvent.getParameter('id');
                let timeNewValue = this._formatTime(oEvent.getParameter('newValue'));
                var oDataModel = this.getOwnerComponent().getModel();
                let oEdited = {};
                let readPath = function (oResponse) {
                    oEdited.HoraDeIngreso = oResponse.HoraDeIngreso;
                    oEdited.HoraDeEgreso = oResponse.HoraDeEgreso;
                    if(thisControler._edited[sPath] == undefined)
                    {
                        if(timeId.includes("ingreso")){
                            oEdited.HoraDeIngreso = timeNewValue;
                        }
                        else{
                            oEdited.HoraDeEgreso = timeNewValue;
                        }
                        thisControler._edited[sPath] = oEdited;
                    }
                    else{
                        if(timeId.includes("ingreso")){
                            thisControler._edited[sPath].HoraDeIngreso = timeNewValue;
                        }
                        else{
                            thisControler._edited[sPath].HoraDeEgreso = timeNewValue;
                        }
                    }
                }
                let readError = function (oError) {
                    MessageBox.error(oError);
                }
                oDataModel.read(`${sPath}`, {
                    success: readPath,
                    error: readError
                });
                this._setUIchanges(true);
            },
            onSaveChanges: function () {
                let paths = Object.keys(this._edited);
                let oModel = this.getView().getModel();
                let fnSuccess = () => {
                    this._setBussy(false);
                    this._setUIchanges(false);
                }
                let fnError = (error) => {
                    this._setBussy(false);
                    this._setUIchanges(false);
                    MessageBox.error(error.message);
                }
                this._setBussy(true);
                for(let i = 0; i < paths.length; i++){
                    oModel.update(`${paths[i]}`, this._edited[paths[i]], fnSuccess, fnError);
                }
                this._edited = {};
                this._setUIchanges(false);
                MessageToast.show("Cambios guardados correctamente");
                thisControler.getOwnerComponent().getModel().refresh(true, true);
            },
            onCancelChanges: function () {
                this._edited = {};
                this._setUIchanges(false);
                thisControler.getOwnerComponent().getModel().refresh();
                debugger;
            }
        });
    });
