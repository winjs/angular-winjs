// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("ItemContainer control directive tests", function () {
    var scope,
        compile;

    beforeEach(angular.mock.module("winjs"));
    beforeEach(angular.mock.inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();
        compile = $compile;
    }));

    function initControl(markup) {
        var element = angular.element(markup)[0];
        document.body.appendChild(element);
        var compiledControl = compile(element)(scope)[0];
        scope.$digest();
        return compiledControl;
    }

    it("should initialize a simple ItemContainer", function () {
        var compiledControl = initControl("<win-item-container></win-item-container>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.ItemContainer);
        expect(compiledControl.className).toContain("win-itemcontainer");
    });

    it("should use the draggable attribute", function () {
        var compiledControl = initControl("<win-item-container draggable='true'></win-item-container>");

        var winControl = compiledControl.winControl;
        expect(winControl.draggable).toBeTruthy();
    });

    it("should use the selected attribute", function () {
        var compiledControl = initControl("<win-item-container selected='true'></win-item-container>");

        var winControl = compiledControl.winControl;
        expect(winControl.selected).toBeTruthy();
    });

    it("should use the selectionDisabled attribute", function () {
        var compiledControl = initControl("<win-item-container selection-disabled='true'></win-item-container>");

        var winControl = compiledControl.winControl;
        expect(winControl.selectionDisabled).toBeTruthy();
    });

    it("should use the tapBehavior attribute", function () {
        var compiledControl = initControl("<win-item-container tap-behavior='\"toggleSelect\"'></win-item-container>");

        var winControl = compiledControl.winControl;
        expect(winControl.tapBehavior).toBe(WinJS.UI.TapBehavior.toggleSelect);
    });

    it("should receive selection events", function () {
        var gotChangingEvent = false,
            gotChangedEvent = false;
        scope.changingEventHandler = function (e) {
            gotChangingEvent = true;
        };
        scope.changedEventHandler = function (e) {
            gotChangedEvent = true;
        };
        var compiledControl = initControl("<win-item-container on-selection-changing='changingEventHandler($event)' on-selection-changed='changedEventHandler($event)'></win-item-container>");

        var winControl = compiledControl.winControl;
        expect(winControl.selected).toBeFalsy();
        expect(gotChangingEvent).toBeFalsy();
        expect(gotChangedEvent).toBeFalsy();
        winControl.selected = true;
        scope.$digest();
        expect(winControl.selected).toBeTruthy();
        expect(gotChangingEvent).toBeTruthy();
        expect(gotChangedEvent).toBeTruthy();
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-itemcontainer");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
