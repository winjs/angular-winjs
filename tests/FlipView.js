// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("FlipView control directive tests", function () {
    var testTimeout = 5000,
        testDataSourceLength = 5;

    var scope,
        compile;

    beforeEach(angular.mock.module("winjs"));
    beforeEach(angular.mock.inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();
        compile = $compile;
        scope.testDataSource = [];
        for (var i = 0; i < testDataSourceLength; i++) {
            scope.testDataSource.push({ title: "Item" + i });
        }
    }));

    function initControl(markup) {
        var element = angular.element(markup)[0];
        document.body.appendChild(element);
        var compiledControl = compile(element)(scope)[0];
        scope.$digest();
        return compiledControl;
    }

    function waitForPageComplete(flipView) {
        var pageComplete = false;
        flipView.addEventListener("pagecompleted", function (e) {
            pageComplete = true;
        });

        return function () {
            return pageComplete;
        };
    }

    it("should initialize a simple FlipView", function () {
        var compiledControl = initControl("<win-flip-view></win-flip-view>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.FlipView);
        expect(compiledControl.className).toContain("win-flipview");
    });

    it("should use an itemDataSource and render content with a win-item-template", function () {
        var compiledControl;
        var pageCompleted;
        runs(function () {
            compiledControl = initControl("<win-flip-view item-data-source='testDataSource'>" +
                                            "<win-item-template>" +
                                            "Rendered{{item.data.title}}" +
                                            "</win-item-template>" +
                                          "</win-flip-view>");
            
            pageCompleted = waitForPageComplete(compiledControl);
        });

        waitsFor(function () {
            return pageCompleted();
        }, "the FlipView's pagecompleted event", testTimeout);

        runs(function () {
            var currentPage = compiledControl.winControl._pageManager._currentPage.element;
            var boundElement = currentPage.querySelector(".ng-binding");
            expect(boundElement.innerHTML).toContain("RenderedItem0");
        });
    });

    it("should receive a page completed event", function () {
        var gotCompletedEvent = false;
        scope.completedEventHandler = function (e) {
            gotCompletedEvent = true;
        };
        var compiledControl;
        runs(function () {
            compiledControl = initControl("<win-flip-view item-data-source='testDataSource' on-page-completed='completedEventHandler($event)'></win-flip-view>");
        });

        waitsFor(function () {
            return gotCompletedEvent;
        }, "the FlipView's pagecompleted event", testTimeout);
    });

    it("should receive an on page selected event", function () {
        var gotSelectedEvent = false;
        scope.selectedEventHandler = function (e) {
            gotSelectedEvent = true;
        };
        var compiledControl;
        runs(function () {
            compiledControl = initControl("<win-flip-view item-data-source='testDataSource' on-page-selected='selectedEventHandler($event)'></win-flip-view>");
        });

        waitsFor(function () {
            return gotSelectedEvent;
        }, "the FlipView's pageselected event", testTimeout);
    });

    it("should receive an on page visibility changed event", function () {
        var gotChangedEvent = false;
        scope.changedEventHandler = function (e) {
            gotChangedEvent = true;
        };
        var compiledControl;
        runs(function () {
            compiledControl = initControl("<win-flip-view item-data-source='testDataSource' on-page-visibility-changed='changedEventHandler($event)'></win-flip-view>");
        });

        waitsFor(function () {
            return gotChangedEvent;
        }, "the FlipView's pagevisibilitychanged event", testTimeout);
    });

    it("should receive a datasource count changed event", function () {
        var compiledControl;
        var pageCompleted;

        runs(function () {
            compiledControl = initControl("<win-flip-view item-data-source='testDataSource' on-data-source-count-changed='countChangedEventHandler($event)'></win-flip-view>");
            pageCompleted = waitForPageComplete(compiledControl);
        });

        waitsFor(function () {
            return pageCompleted();
        }, "the FlipView's pagecompleted event", testTimeout);

        var gotCountChangedEvent = false;
        scope.countChangedEventHandler = function (e) {
            gotCountChangedEvent = true;
        };

        runs(function () {
            scope.testDataSource.push({ title: "NewItem" });
            scope.$digest();
        });

        waitsFor(function () {
            return gotCountChangedEvent;
        }, "the FlipView's datasourcecountchanged event", testTimeout);
    });

    it("should update currentPage on navigation", function () {
        scope.testCurrentPage = 0;
        var compiledControl = initControl("<win-flip-view item-data-source='testDataSource' current-page='testCurrentPage'></win-flip-view>");
        var pageCompleted = waitForPageComplete(compiledControl);

        waitsFor(function () {
            return pageCompleted();
        }, "the FlipView's pagecompleted event", testTimeout);

        runs(function () {
            compiledControl.winControl.currentPage = 2;
        });

        waitsFor(function () {
            return (scope.testCurrentPage === 2);
        }, "the FlipView to update testCurrentPage", testTimeout);
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-flipview");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
