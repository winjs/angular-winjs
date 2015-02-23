// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("Menu control directive tests", function () {
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

    it("should initialize a simple Menu", function () {
        var compiledControl = initControl("<win-menu></win-menu>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.Menu);
        expect(compiledControl.className).toContain("win-menu");
    });

    it("should use child MenuCommands", function () {
        var compiledControl = initControl("<win-menu>" +
                                              "<win-menu-command></win-menu-command>" +
                                              "<win-menu-command></win-menu-command>" +
                                          "</win-menu>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.Menu);
        expect(compiledControl.className).toContain("win-menu");
        expect(compiledControl.querySelectorAll(".win-command").length).toEqual(2);
    });

    it("should use the alignment attribute", function () {
        var compiledControl = initControl("<win-menu alignment=\"'right'\"></win-menu>");
        expect(compiledControl.winControl.alignment).toEqual("right");
    });

    it("should use the disabled attribute", function () {
        var compiledControl = initControl("<win-menu disabled='true'></win-menu>");
        expect(compiledControl.winControl.disabled).toBeTruthy();
    });

    it("should use the placement attribute", function () {
        var compiledControl = initControl("<win-menu placement=\"'top'\"></win-menu>");
        expect(compiledControl.winControl.placement).toEqual("top");
    });

    it("should use the onshow and onhide event handlers", function () {
        var gotBeforeShowEvent = false,
            gotAfterShowEvent = false,
            gotBeforeHideEvent = false,
            gotAfterHideEvent = false;
        scope.beforeShowEventHandler = function (e) {
            gotBeforeShowEvent = true;
        };
        scope.afterShowEventHandler = function (e) {
            gotAfterShowEvent = true;
        };
        scope.beforeHideEventHandler = function (e) {
            gotBeforeHideEvent = true;
        };
        scope.afterHideEventHandler = function (e) {
            gotAfterHideEvent = true;
        };
        var compiledControl = initControl("<win-menu on-before-show='beforeShowEventHandler($event)' on-after-show='afterShowEventHandler($event)' " +
                                           "on-before-hide='beforeHideEventHandler($event)' on-after-hide='afterHideEventHandler($event)'></win-menu>");
        runs(function () {
            compiledControl.winControl.show(document.body);
        });

        waitsFor(function () {
            return (gotBeforeShowEvent && gotAfterShowEvent);
        }, "the Menu's before+aftershow events", testTimeout);

        runs(function () {
            compiledControl.winControl.hide();
        });

        waitsFor(function () {
            return (gotBeforeHideEvent && gotAfterHideEvent);
        }, "the Menu's before+afterhide events", testTimeout);
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-menu");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
