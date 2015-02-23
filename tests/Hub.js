// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("Hub control directive tests", function () {
    var testTimeout = 5000;

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

    it("should initialize a simple Hub", function () {
        var compiledControl = initControl("<win-hub></win-hub>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.Hub);
        expect(compiledControl.className).toContain("win-hub");
    });

    it("should use the orientation attribute", function () {
        var compiledControl = initControl("<win-hub orientation=\"'vertical'\"></win-hub>");
        expect(compiledControl.winControl.orientation).toEqual("vertical");
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-hub");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
