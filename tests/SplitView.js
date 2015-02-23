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

    it("should use the shownDisplayMode attribute", function () {
        var compiledControl = initControl("<win-split-view shown-display-mode=\"'inline'\"></win-split-view>");
        expect(compiledControl.winControl.shownDisplayMode).toEqual("inline");
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

    it("should use the show and hide event handlers attribute", function () {
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

        var compiledControl = initControl("<win-split-view on-before-show='beforeShowEventHandler($event)' on-after-show='afterShowEventHandler($event)' " +
                                           "on-before-hide='beforeHideEventHandler($event)' on-after-hide='afterHideEventHandler($event)'></win-split-view>");

        runs(function () {
            compiledControl.winControl.showPane();
        });

        waitsFor(function () {
            return (gotBeforeShowEvent && gotAfterShowEvent);
        }, "the SplitView's before+aftershow events", testTimeout);

        runs(function () {
            compiledControl.winControl.hidePane();
        });

        waitsFor(function () {
            return (gotBeforeHideEvent && gotAfterHideEvent);
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
