// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("ToolBar control directive tests", function () {
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

    it("should initialize a simple ToolBar", function () {
        var compiledControl = initControl("<win-tool-bar></win-tool-bar>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.ToolBar);
        expect(compiledControl.className).toContain("win-toolbar");
    });

    it("should use child ToolBarCommands", function () {
        var compiledControl = initControl("<win-tool-bar>" +
                                              "<win-tool-bar-command></win-tool-bar-command>" +
                                              "<win-tool-bar-command></win-tool-bar-command>" +
                                          "</win-tool-bar>");

        expect(compiledControl.querySelectorAll(".win-command").length).toEqual(2);
    });

    it("should use the closedDisplayMode attribute", function () {
        var compiledControl = initControl("<win-tool-bar closed-display-mode=\"'full'\"></win-tool-bar>");
        expect(compiledControl.winControl.closedDisplayMode).toEqual("full");
    });

    it("should use the onopen and onclose event handlers and opened attribute", function () {
        var gotBeforeOpenEvent = false,
            gotAfterOpenEvent = false,
            gotBeforeCloseEvent = false,
            gotAfterCloseEvent = false;
        scope.beforeOpenEventHandler = function (e) {
            gotBeforeOpenEvent = true;
        };
        scope.afterOpenEventHandler = function (e) {
            gotAfterOpenEvent = true;
        };
        scope.beforeCloseEventHandler = function (e) {
            gotBeforeCloseEvent = true;
        };
        scope.afterCloseEventHandler = function (e) {
            gotAfterCloseEvent = true;
        };
        scope.toolbarOpened = false;
        var compiledControl = initControl("<win-tool-bar on-before-open='beforeOpenEventHandler($event)' on-after-open='afterOpenEventHandler($event)' " +
                                           "on-before-close='beforeCloseEventHandler($event)' on-after-close='afterCloseEventHandler($event)' opened='toolbarOpened'></win-tool-bar>");
        runs(function () {
            compiledControl.winControl.open();
        });

        waitsFor(function () {
            return (gotBeforeOpenEvent && gotAfterOpenEvent);
        }, "the ToolBar's before+aftershow events", testTimeout);

        runs(function () {
            expect(scope.toolbarOpened).toBeTruthy();
            scope.toolbarOpened = false;
            scope.$digest();
        });

        waitsFor(function () {
            return (gotBeforeCloseEvent && gotAfterCloseEvent);
        }, "the ToolBar's before+afterhide events", testTimeout);
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-toolbar");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
