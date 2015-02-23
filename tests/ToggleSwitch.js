// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("ToggleSwitch control directive tests", function () {
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

    it("should initialize a simple toggle switch", function () {
        var compiledControl = initControl("<win-toggle-switch></win-toggle-switch>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.ToggleSwitch);
        expect(compiledControl.className).toContain("win-toggleswitch");
    });

    it("should use the checked attribute", function () {
        var compiledControl = initControl("<win-toggle-switch checked='true'></win-toggle-switch>");

        var winControl = compiledControl.winControl;
        expect(winControl.checked).toBeTruthy();
    });

    it("should use label attributes", function () {
        var compiledControl = initControl("<win-toggle-switch label-on=\"'onLabel'\" label-off=\"'offLabel'\"></win-toggle-switch>");

        expect(compiledControl.querySelector(".win-toggleswitch-value-on").innerHTML).toBe("onLabel");
        expect(compiledControl.querySelector(".win-toggleswitch-value-off").innerHTML).toBe("offLabel");
    });

    it("should use the title attribute", function () {
        var compiledControl = initControl("<win-toggle-switch title=\"'toggleTitle'\"></win-toggle-switch>");

        expect(compiledControl.querySelector(".win-toggleswitch-header").innerHTML).toBe("toggleTitle");
    });

    it("should use the disabled attribute", function () {
        var compiledControl = initControl("<win-toggle-switch disabled='true'></win-toggle-switch>");

        expect(compiledControl.winControl.disabled).toBeTruthy();
    });

    it("should allow event handlers to be set up in markup", function () {
        var eventHandlerCalled = false;
        scope.changedEventHandler = function (e) {
            eventHandlerCalled = true;
        };
        scope.isChecked = false;
        var compiledControl = initControl("<win-toggle-switch checked='isChecked' on-change='changedEventHandler($event)'></win-toggle-switch>");

        var winControl = compiledControl.winControl;
        expect(winControl.checked).toBeFalsy();
        scope.isChecked = true;
        scope.$digest();
        expect(winControl.checked).toBeTruthy();
        expect(eventHandlerCalled).toBeTruthy();
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-toggleswitch");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
