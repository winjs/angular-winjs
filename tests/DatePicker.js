// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("DatePicker control directive tests", function () {
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

    it("should initialize a simple DatePicker", function () {
        var compiledControl = initControl("<win-date-picker></win-date-picker>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.DatePicker);
        expect(compiledControl.className).toContain("win-datepicker");
    });

    it("should use the min and max year attributes", function () {
        var compiledControl = initControl("<win-date-picker min-year='2013' max-year='2014'></win-date-picker>");

        var winControl = compiledControl.winControl;
        expect(winControl.minYear).toBe(2013);
        expect(winControl.maxYear).toBe(2014);
    });

    it("should use the disabled attribute", function () {
        var compiledControl = initControl("<win-date-picker disabled='true'></win-date-picker>");

        expect(compiledControl.winControl.disabled).toBeTruthy();
    });

    it("should use the current attribute", function () {
        scope.testDate = new Date(2013, 3, 7);
        var compiledControl = initControl("<win-date-picker current='testDate'></win-date-picker>");

        var winControl = compiledControl.winControl;
        expect(winControl.current.getYear()).toBe(113);
        expect(winControl.current.getMonth()).toBe(3);
        expect(winControl.current.getDate()).toBe(7);
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-datepicker");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
