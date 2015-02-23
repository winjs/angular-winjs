// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("TimePicker control directive tests", function () {
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

    it("should initialize a simple TimePicker", function () {
        var compiledControl = initControl("<win-time-picker></win-time-picker>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.TimePicker);
        expect(compiledControl.className).toContain("win-timepicker");
    });

    it("should use the clock attribute", function () {
        scope.testClock = "24HourClock";
        var compiledControl = initControl("<win-time-picker clock='testClock'></win-time-picker>");

        expect(compiledControl.winControl.clock).toBe("24HourClock");
    });

    it("should use the disabled attribute", function () {
        var compiledControl = initControl("<win-time-picker disabled='true'></win-time-picker>");

        expect(compiledControl.winControl.disabled).toBeTruthy();
    });

    it("should use the current attribute", function () {
        scope.testDate = new Date(2000, 1, 1, 11, 12);
        var compiledControl = initControl("<win-time-picker current='testDate'></win-time-picker>");

        var winControl = compiledControl.winControl;
        expect(winControl.current.getHours()).toBe(11);
        expect(winControl.current.getMinutes()).toBe(12);
    });

    it("should use the minuteIncrement attribute", function () {
        var compiledControl = initControl("<win-time-picker minute-increment='10'></win-time-picker>");

        expect(compiledControl.winControl.minuteIncrement).toBe(10);
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-timepicker");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
