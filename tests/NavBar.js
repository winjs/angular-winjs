// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("NavBar control directive tests", function () {
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

    it("should initialize a simple NavBar", function () {
        var compiledControl = initControl("<win-nav-bar></win-nav-bar>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.NavBar);
        expect(compiledControl.className).toContain("win-navbar");
    });

    it("should use child NavBarCommands", function () {
        var compiledControl = initControl("<win-nav-bar>" +
                                              "<win-nav-bar-container>" +
                                                  "<win-nav-bar-command></win-nav-bar-command>" +
                                                  "<win-nav-bar-command></win-nav-bar-command>" +
                                              "</win-nav-bar-container>" +
                                          "</win-nav-bar>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.NavBar);
        expect(compiledControl.className).toContain("win-navbar");
        expect(compiledControl.querySelectorAll(".win-navbarcommand").length).toEqual(2);
    });

    it("should use the closedDisplayMode attribute", function () {
        var compiledControl = initControl("<win-nav-bar closed-display-mode=\"'minimal'\"></win-nav-bar>");
        expect(compiledControl.winControl.closedDisplayMode).toEqual("minimal");
    });
    
    it("should use the disabled attribute", function () {
        var compiledControl = initControl("<win-nav-bar disabled='true'></win-nav-bar>");
        expect(compiledControl.winControl.disabled).toBeTruthy();
    });

    it("should use the placement attribute", function () {
        var compiledControl = initControl("<win-nav-bar placement=\"'top'\"></win-nav-bar>");
        expect(compiledControl.winControl.placement).toEqual("top");
    });

    it("should use the sticky attribute", function () {
        var compiledControl = initControl("<win-nav-bar sticky='true'></win-nav-bar>");
        expect(compiledControl.winControl.sticky).toBeTruthy();
    });

    it("should use the onChildrenProcessed event handler", function () {
        var gotProcessedEvent = false;
        scope.processedEventHandler = function (e) {
            gotProcessedEvent = true;
        };
        var compiledControl = initControl("<win-nav-bar on-children-processed='processedEventHandler($event)'>" +
                                              "<win-nav-bar-container>" +
                                                  "<win-nav-bar-command></win-nav-bar-command>" +
                                              "</win-nav-bar-container>" +
                                          "</win-nav-bar>");
        waitsFor(function () {
            return gotProcessedEvent;
        }, "the NavBar's onChildrenProcessed event", testTimeout);
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
        var compiledControl = initControl("<win-nav-bar on-before-show='beforeShowEventHandler($event)' on-after-show='afterShowEventHandler($event)' " +
                                           "on-before-hide='beforeHideEventHandler($event)' on-after-hide='afterHideEventHandler($event)'></win-nav-bar>");
        runs(function () {
            compiledControl.winControl.show();
        });

        waitsFor(function () {
            return (gotBeforeShowEvent && gotAfterShowEvent);
        }, "the NavBar's before+aftershow events", testTimeout);

        runs(function () {
            compiledControl.winControl.hide();
        });

        waitsFor(function () {
            return (gotBeforeHideEvent && gotAfterHideEvent);
        }, "the NavBar's before+afterhide events", testTimeout);
    });
    
    afterEach(function () {
        var controls = document.querySelectorAll(".win-navbar");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
