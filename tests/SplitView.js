// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("SplitView control directive tests", function () {
    var testTimeout = 5000;

    var scope,
        compile;

    beforeEach(angular.mock.module("winjs"));
    beforeEach(angular.mock.inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();
        compile = $compile;
    }));
    beforeEach(function () {
        WinJS.Utilities._fastAnimations = true;
    });

    function initControl(markup) {
        var element = angular.element(markup)[0];
        document.body.appendChild(element);
        var compiledControl = compile(element)(scope)[0];
        scope.$digest();
        return compiledControl;
    }

    it("should initialize a simple SplitView", function () {
        var compiledControl = initControl("<win-split-view></win-split-view>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.SplitView);
        expect(compiledControl.className).toContain("win-splitview");
    });

    it("should use the closedDisplayMode attribute", function () {
        var compiledControl = initControl("<win-split-view closed-display-mode=\"'inline'\"></win-split-view>");
        expect(compiledControl.winControl.closedDisplayMode).toEqual("inline");
    });

    it("should use the openedDisplayMode attribute", function () {
        var compiledControl = initControl("<win-split-view opened-display-mode=\"'inline'\"></win-split-view>");
        expect(compiledControl.winControl.openedDisplayMode).toEqual("inline");
    });

    it("should use the panePlacement attribute", function () {
        var compiledControl = initControl("<win-split-view pane-placement=\"'top'\"></win-split-view>");
        expect(compiledControl.winControl.panePlacement).toEqual("top");
    });

    it("should use inline content and pane nodes", function () {
        var compiledControl = initControl("<win-split-view>" +
                                              "<win-split-view-pane class='paneShouldBeInDom'></win-split-view-pane>" +
                                              "<win-split-view-content class='contentShouldBeInDom'></win-split-view-content>" +
                                          "</win-split-view>");

        var splitview = compiledControl.winControl;
        expect(splitview.paneElement.querySelectorAll(".paneShouldBeInDom").length).toEqual(1);
        expect(splitview.contentElement.querySelectorAll(".contentShouldBeInDom").length).toEqual(1);
    });

    it("should use inline content and pane nodes regardless of the order they are defined in", function () {
        var compiledControl = initControl("<win-split-view>" +
                                              "<win-split-view-content class='contentShouldBeInDom'></win-split-view-content>" +
                                              "<win-split-view-pane class='paneShouldBeInDom'></win-split-view-pane>" +
                                          "</win-split-view>");

        var splitview = compiledControl.winControl;
        expect(splitview.paneElement.querySelectorAll(".paneShouldBeInDom").length).toEqual(1);
        expect(splitview.contentElement.querySelectorAll(".contentShouldBeInDom").length).toEqual(1);
    });

    it("should accept multiple splitview content nodes", function () {
        var compiledControl = initControl("<win-split-view>" +
                                              "<win-split-view-content class='shouldBeInDom'></win-split-view-content>" +
                                              "<win-split-view-content class='shouldBeInDom'></win-split-view-content>" +
                                              "<win-split-view-content class='shouldBeInDom'></win-split-view-content>" +
                                          "</win-split-view>");

        var splitview = compiledControl.winControl;
        expect(splitview.contentElement.querySelectorAll(".shouldBeInDom").length).toEqual(3);
        expect(splitview.paneElement.querySelectorAll(".shouldBeInDom").length).toEqual(0);
    });

    it("should ignore additional inline panes", function () {
        var compiledControl = initControl("<win-split-view>" +
                                              "<win-split-view-pane class='shouldBeInDom'></win-split-view-pane>" +
                                              "<win-split-view-pane class='shouldNotBeInDom'></win-split-view-pane>" +
                                          "</win-split-view>");
        expect(compiledControl.querySelectorAll(".shouldBeInDom").length).toEqual(1);
        expect(compiledControl.querySelectorAll(".shouldNotBeInDom").length).toEqual(0);
    });

    it("should use the open and close event handlers and paneOpened attribute", function () {
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
        scope.paneOpened = false;
        var compiledControl = initControl("<win-split-view on-before-open='beforeOpenEventHandler($event)' on-after-open='afterOpenEventHandler($event)' " +
                                           "on-before-close='beforeCloseEventHandler($event)' on-after-close='afterCloseEventHandler($event)' pane-opened='paneOpened'></win-split-view>");

        runs(function () {
            compiledControl.winControl.openPane();
        });

        waitsFor(function () {
            return (gotBeforeOpenEvent && gotAfterOpenEvent);
        }, "the SplitView's before+aftershow events", testTimeout);

        runs(function () {
            expect(scope.paneOpened).toBeTruthy();
            scope.paneOpened = false;
            scope.$digest();
        });

        waitsFor(function () {
            return (gotBeforeCloseEvent && gotAfterCloseEvent);
        }, "the SplitView's before+afterhide events", testTimeout);
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-splitview");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
        WinJS.Utilities._fastAnimations = false;
    });
});
