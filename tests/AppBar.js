// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("AppBar control directive tests", function () {
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

    it("should initialize a simple AppBar", function () {
        var compiledControl = initControl("<win-app-bar></win-app-bar>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.AppBar);
        expect(compiledControl.className).toContain("win-appbar");
    });

    it("should use child AppBarCommands", function () {
        var compiledControl = initControl("<win-app-bar>" +
                                              "<win-app-bar-command></win-app-bar-command>" +
                                              "<win-app-bar-command></win-app-bar-command>" +
                                          "</win-app-bar>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.AppBar);
        expect(compiledControl.className).toContain("win-appbar");
        expect(compiledControl.querySelectorAll(".win-command").length).toEqual(2);
    });

    it("should use the data attribute", function () {
        scope.testCommands = new WinJS.Binding.List([
            new WinJS.UI.AppBarCommand(null, { label: "TestCommand0" }),
            new WinJS.UI.AppBarCommand(null, { label: "TestCommand1" })
        ]);
        var compiledControl = initControl("<win-app-bar data='testCommands'></win-app-bar>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands.length).toEqual(2);
        expect(commands[0].querySelector(".win-label").innerHTML).toEqual("TestCommand0");
        expect(commands[1].querySelector(".win-label").innerHTML).toEqual("TestCommand1");
    });

    it("should use the closedDisplayMode attribute", function () {
        var compiledControl = initControl("<win-app-bar closed-display-mode=\"'minimal'\"></win-app-bar>");
        expect(compiledControl.winControl.closedDisplayMode).toEqual("minimal");
    });

    it("should use the placement attribute", function () {
        var compiledControl = initControl("<win-app-bar placement=\"'top'\"></win-app-bar>");
        expect(compiledControl.winControl.placement).toEqual("top");
    });

    it("should use the opened attribute", function () {
        var compiledControl = initControl("<win-app-bar opened='true'></win-app-bar>");
        expect(compiledControl.winControl.opened).toBeTruthy();
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
        scope.appbarOpened = false;
        var compiledControl = initControl("<win-app-bar on-before-open='beforeOpenEventHandler($event)' on-after-open='afterOpenEventHandler($event)' " +
                                           "on-before-close='beforeCloseEventHandler($event)' on-after-close='afterCloseEventHandler($event)' opened='appbarOpened'></win-app-bar>");
        runs(function () {
            compiledControl.winControl.open();
        });

        waitsFor(function () {
            return (gotBeforeOpenEvent && gotAfterOpenEvent);
        }, "the AppBar's before+aftershow events", testTimeout);

        runs(function () {
            expect(scope.appbarOpened).toBeTruthy();
            scope.appbarOpened = false;
            scope.$digest();
        });

        waitsFor(function () {
            return (gotBeforeCloseEvent && gotAfterCloseEvent);
        }, "the AppBar's before+afterhide events", testTimeout);
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-appbar");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
