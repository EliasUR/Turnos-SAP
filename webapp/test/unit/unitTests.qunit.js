/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comsofttek/aca2024er/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
