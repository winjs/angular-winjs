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

    it("should use the commands attribute", function () {
        scope.testCommands = [
            new WinJS.UI.AppBarCommand(null, { label: "TestCommand0" }),
            new WinJS.UI.AppBarCommand(null, { label: "TestCommand1" })
        ];
        var compiledControl = initControl("<win-app-bar commands='testCommands'></win-app-bar>");
        
        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands.length).toEqual(2);
        expect(commands[0].querySelector(".win-label").innerHTML).toEqual("TestCommand0");
        expect(commands[1].querySelector(".win-label").innerHTML).toEqual("TestCommand1");
    });

    it("should use the closedDisplayMode attribute", function () {
        var compiledControl = initControl("<win-app-bar closed-display-mode=\"'minimal'\"></win-app-bar>");
        expect(compiledControl.winControl.closedDisplayMode).toEqual("minimal");
    });

    it("should use the disabled attribute", function () {
        var compiledControl = initControl("<win-app-bar disabled='true'></win-app-bar>");
        expect(compiledControl.winControl.disabled).toBeTruthy();
    });

    it("should use the placement attribute", function () {
        var compiledControl = initControl("<win-app-bar placement=\"'top'\"></win-app-bar>");
        expect(compiledControl.winControl.placement).toEqual("top");
    });

    it("should use the layout attribute", function () {
        var compiledControl = initControl("<win-app-bar layout=\"'menu'\"></win-app-bar>");
        expect(compiledControl.winControl.layout).toEqual("menu");
    });

    it("should use the sticky attribute", function () {
        var compiledControl = initControl("<win-app-bar sticky='true'></win-app-bar>");
        expect(compiledControl.winControl.sticky).toBeTruthy();
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
        var compiledControl = initControl("<win-app-bar on-before-show='beforeShowEventHandler($event)' on-after-show='afterShowEventHandler($event)' " +
                                           "on-before-hide='beforeHideEventHandler($event)' on-after-hide='afterHideEventHandler($event)'></win-app-bar>");
        runs(function () {
            compiledControl.winControl.show();
        });

        waitsFor(function () {
            return (gotBeforeShowEvent && gotAfterShowEvent);
        }, "the AppBar's before+aftershow events", testTimeout);

        runs(function () {
            compiledControl.winControl.hide();
        });

        waitsFor(function () {
            return (gotBeforeHideEvent && gotAfterHideEvent);
        }, "the AppBar's before+afterhide events", testTimeout);
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-appbar");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
