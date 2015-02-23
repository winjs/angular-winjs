// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("Tooltip control directive tests", function () {
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

    it("should initialize a simple Tooltip", function () {
        var compiledControl = initControl("<win-tooltip></win-tooltip>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.Tooltip);
        compiledControl.parentNode.removeChild(compiledControl);
    });

    it("should initialize the infotip attribute", function () {
        var compiledControl = initControl("<win-tooltip infotip='true'></win-tooltip>");
        expect(compiledControl.winControl.infotip).toBeTruthy();
        compiledControl.parentNode.removeChild(compiledControl);
    });

    it("should initialize the placement attribute", function () {
        var compiledControl = initControl("<win-tooltip placement=\"'right'\"></win-tooltip>");
        expect(compiledControl.winControl.placement).toEqual("right");
        compiledControl.parentNode.removeChild(compiledControl);
    });
});
