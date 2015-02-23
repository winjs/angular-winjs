// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("NavBarContainer control directive tests", function () {
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

    it("should use the fixedSize attribute", function () {
        var compiledControl = initControl("<win-nav-bar-container fixed-size='true'></win-nav-bar-container>");

        expect(compiledControl.winControl.fixedSize).toBeTruthy();
    });

    it("should use the maxRows attribute", function () {
        var compiledControl = initControl("<win-nav-bar-container max-rows='3'></win-nav-bar-container>");

        expect(compiledControl.winControl.maxRows).toEqual(3);
    });

    it("should use the layout attribute", function () {
        var compiledControl = initControl("<win-nav-bar-container layout=\"'vertical'\"></win-nav-bar-container>");

        expect(compiledControl.winControl.layout).toEqual("vertical");
    });

    // TODO: Tests for data and template once bug in data property is fixed
    afterEach(function () {
        var controls = document.querySelectorAll(".win-navbarcontainer");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
