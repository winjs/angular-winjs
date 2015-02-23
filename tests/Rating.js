// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("Rating control directive tests", function () {
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

    it("should initialize a simple Rating control", function () {
        var compiledControl = initControl("<win-rating></win-rating>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.Rating);
        expect(compiledControl.className).toContain("win-rating");
    });

    it("should use rating attributes", function () {
        var compiledControl = initControl("<win-rating max-rating='10' user-rating='9' average-rating='3'></win-rating>");

        var winControl = compiledControl.winControl;
        expect(winControl.maxRating).toEqual(10);
        expect(winControl.userRating).toEqual(9);
        expect(winControl.averageRating).toEqual(3);
    });

    it("should use the diabled attribute", function () {
        var compiledControl = initControl("<win-rating disabled='true'></win-rating>");

        expect(compiledControl.winControl.disabled).toBeTruthy();
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-rating");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
