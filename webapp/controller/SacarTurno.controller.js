sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/core/library'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Filter, FilterOperator, coreLibrary) {
        "use strict";
        var thisControler;
        var ValueState = coreLibrary.ValueState;
        return BaseController.extend("com.softtek.aca2024er.controller.SacarTurno", {
            //Private Methods
            //Public Methods for actions
            _onPatternMatched: function (oEvent) {
                let sMedico = oEvent.getParameter("arguments").LegajoMedico;
                let sEsp = oEvent.getParameter("arguments").IdEspecialidad;
                let navId = this.getView().getDomRef().getElementsByClassName("sapMITH")[0].id
                let iconTabHeader = this.byId(navId);
                iconTabHeader.setSelectedKey("NewTurno");
                let showBackBtn = function() {
                    if (window.innerWidth <= 800) {
                        thisControler.getView().getModel("viewModel").setProperty("/backBtn", false);
                    } else {
                        thisControler.getView().getModel("viewModel").setProperty("/backBtn", true);
                    }
                }
                showBackBtn();
                window.addEventListener("resize", showBackBtn);

                this._setWizard(sMedico, sEsp);
            },
            _setWizard: function (medico, especialidad) {
                var oWizard = this.byId("wizardTurnos");
                if (medico == "Nuevo") {
                    var oFirstStep = oWizard.getSteps()[0];
                    oWizard.discardProgress(oFirstStep);
                    oWizard.goToStep(oFirstStep);
                } else {
                    var oStep3 = oWizard.getSteps()[2];
                    oWizard.discardProgress(oStep3);
                    oWizard.goToStep(oStep3);
                }

                let oModel = new JSONModel({
                    "LegajoMedico": medico == "Nuevo" ? "" : medico,
                    "IdEspecialidad": especialidad == "Turno" ? "" : especialidad,
                    "NombrePaciente": "",
                    "DniPaciente": "",
                    "HoraTurno": "",
                    "FechaTurno": ""
                });
                oModel.setDefaultBindingMode("TwoWay");
                this.getView().setModel(oModel, "Turno");
            },

            onInit: function () {
                thisControler = this;
                this.loadViewModel(true, false);
                this.wizard = this.getView().byId("wizardTurnos");
                this.getRouter().getRoute("SacarTurno").attachPatternMatched(this._onPatternMatched, this);
                // this.setFocusInputTiles();
            },

            onSelectedEsp: function (oEvent) {
                var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

                if (!sSelectedKey && sValue) {
                    oValidatedComboBox.setValueState(ValueState.Error);
                    oValidatedComboBox.setValueStateText("Opción inválida");
                } else {
                    oValidatedComboBox.setValueState(ValueState.None); 
                    let step = this.wizard.mAggregations._progressNavigator.getCurrentStep()
                    let progress = this.wizard.getProgress();
                    if (step == progress) {
                        this.wizard.nextStep();
                    }
                    this.getView().byId("doctores").getBinding("items").filter(new Filter("IdEspecialidad", FilterOperator.EQ, sSelectedKey));
                }
            },
            onSelectedMedico: function (oEvent) {
                var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

                if (!sSelectedKey && sValue) {
                    oValidatedComboBox.setValueState(ValueState.Error);
                    oValidatedComboBox.setValueStateText("Opción inválida");
                } else {
                    oValidatedComboBox.setValueState(ValueState.None); 
                    let step = this.wizard.mAggregations._progressNavigator.getCurrentStep()
                    let progress = this.wizard.getProgress();
                    if (step == progress) {
                        this.wizard.nextStep();
                    }
                    let today = new Date();
                    this.getView().byId("fecha").setMinDate(today);
                }
            },
            onSelectedDateTime: function (oEvent) {
                this.wizard.nextStep();
            },
            onSave: function (oEvent) {
                let oEntry = oEvent.getSource().getModel("Turno").getData();
                var oDataModel = this.getView().getModel();
                oDataModel.create("/TurnoSet", oEntry, {
                    success: function (oResponse) {
                        var result = oResponse?.results;
                        thisControler.getOwnerComponent().getModel().refresh(true, true);
                        thisControler.onBack();
                        MessageToast.show("Turno Asignado Correctamente.");
                    },
                    error: function (oError) {
                        thisControler.wizard.invalidateStep(3);
                        thisControler.wizard.goToStep(3);
                        MessageBox.error("El horario seleccionado no está disponible, elija otro por favor.");
                    }
                });
            },
            setFocusInputTiles: function () {
                var oEspTile = this.byId("EspTile");
                var oEspInput = this.byId("EspInput");
                oEspTile.attachPress(function() {
                    oEspInput.focus();
                });
                var oMedicTile = this.byId("MedicTile");
                var oMedicInput = this.byId("MedicInput");
                oMedicTile.attachPress(function() {
                    oMedicInput.focus();
                });
                var oFechaTile = this.byId("FechaTile");
                var oFechaInput = this.byId("FechaInput");
                oFechaTile.attachPress(function() {
                    oFechaInput.focus();
                });
                var oHoraTile = this.byId("HoraTile");
                var oHoraInput = this.byId("HoraInput");
                oHoraTile.attachPress(function() {
                    oHoraInput.focus();
                });
                var oDniTile= this.byId("DniTile");
                var oDniInput = this.byId("DniInput");
                oDniTile.attachPress(function() {
                    oDniInput.focus();
                });
                var oNombreTile = this.byId("NombreTile");
                var oNombreInput = this.byId("NombreInput");
                oNombreTile.attachPress(function() {
                    oNombreInput.focus();
                });
            }
                
        });
    });
