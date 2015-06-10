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
        scope.navbarOpened = false;
        var compiledControl = initControl("<win-nav-bar on-before-open='beforeOpenEventHandler($event)' on-after-open='afterOpenEventHandler($event)' " +
                                           "on-before-close='beforeCloseEventHandler($event)' on-after-close='afterCloseEventHandler($event)' opened='navbarOpened'></win-nav-bar>");
        runs(function () {
            compiledControl.winControl.open();
        });

        waitsFor(function () {
            return (gotBeforeOpenEvent && gotAfterOpenEvent);
        }, "the NavBar's before+aftershow events", testTimeout);

        runs(function () {
            expect(scope.navbarOpened).toBeTruthy();
            scope.navbarOpened = false;
            scope.$digest();
        });

        waitsFor(function () {
            return (gotBeforeCloseEvent && gotAfterCloseEvent);
        }, "the NavBar's before+afterhide events", testTimeout);
    });
    
    afterEach(function () {
        var controls = document.querySelectorAll(".win-navbar");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
