// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("ListView control directive tests", function () {
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

    function waitForLoadingComplete(listView) {
        var loadingComplete = false;
        listView.addEventListener("loadingstatechanged", function (e) {
            if (listView.loadingState === "complete") {
                loadingComplete = true;
            }
        });

        return function () {
            return loadingComplete;
        };
    }

    it("should initialize a simple ListView", function () {
        var compiledControl = initControl("<win-list-view></win-list-view>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.ListView);
        expect(compiledControl.className).toContain("win-listview");
    });

    it("should use the itemDataSource attribute", function () {
        var compiledControl = initControl("<win-list-view item-data-source='testDataSource'></win-list-view>");
        var loadingComplete = waitForLoadingComplete(compiledControl.winControl);
        
        waitsFor(function () {
            return loadingComplete();
        }, "the ListView's loadingStateChanged=complete event", testTimeout);

        runs(function () {
            expect(compiledControl.querySelectorAll(".win-container").length).toEqual(testDataSourceLength);
        });
    });

    it("should use the inline item template", function () {
        var compiledControl = initControl("<win-list-view item-data-source='testDataSource'>" +
                                              "<win-item-template>{{item.data.title}}</win-item-template>" +
                                          "</win-list-view>");
        var loadingComplete = waitForLoadingComplete(compiledControl.winControl);

        waitsFor(function () {
            return loadingComplete();
        }, "the ListView's loadingStateChanged=complete event", testTimeout);

        runs(function () {
            var renderedItems = compiledControl.querySelectorAll(".win-item");
            expect(renderedItems.length).toEqual(testDataSourceLength);
            for (var i = 0; i < renderedItems.length; i++) {
                expect(renderedItems[i].firstElementChild.innerHTML).toEqual(scope.testDataSource[i].title);
            }
        });
    });

    it("should use the inline group header template", function () {
        function simpleGroupingFunction(data) {
            return data.title;
        }
        scope.groupedDataSource = new WinJS.Binding.List(scope.testDataSource).createGrouped(simpleGroupingFunction, simpleGroupingFunction);

        var compiledControl = initControl("<win-list-view item-data-source='groupedDataSource' group-data-source='groupedDataSource.groups'>" +
                                              "<win-group-header-template>{{item.data}}</win-group-header-template>" +
                                              "<win-item-template>{{item.data.title}}</win-item-template>" +
                                          "</win-list-view>");
        var loadingComplete = waitForLoadingComplete(compiledControl.winControl);

        waitsFor(function () {
            return loadingComplete();
        }, "the ListView's loadingStateChanged=complete event", testTimeout);

        runs(function () {
            var renderedItems = compiledControl.querySelectorAll(".win-item");
            expect(renderedItems.length).toEqual(testDataSourceLength);
            for (var i = 0; i < renderedItems.length; i++) {
                expect(renderedItems[i].firstElementChild.innerHTML).toEqual(scope.testDataSource[i].title);
            }

            var renderedHeaders = compiledControl.querySelectorAll(".win-groupheader");
            expect(renderedHeaders.length).toEqual(testDataSourceLength);
            for (var i = 0; i < renderedHeaders.length; i++) {
                expect(renderedHeaders[i].firstElementChild.innerHTML).toEqual(scope.testDataSource[i].title);
            }
        });
    });

    it("should use the itemsReorderable attribute", function () {
        var compiledControl = initControl("<win-list-view items-reorderable='true' item-data-source='testDataSource'></win-list-view>");
        var loadingComplete = waitForLoadingComplete(compiledControl.winControl);

        waitsFor(function () {
            return loadingComplete();
        }, "the ListView's loadingStateChanged=complete event", testTimeout);

        runs(function () {
            expect(compiledControl.winControl.itemsReorderable).toBeTruthy();
            var itemBoxes = compiledControl.querySelectorAll(".win-itembox");
            for (var i = 0; i < itemBoxes.length; i++) {
                expect(itemBoxes[i].draggable).toBeTruthy();
            }
        });
    });

    it("should use the itemsDraggable attribute", function () {
        var compiledControl = initControl("<win-list-view items-draggable='true' item-data-source='testDataSource'></win-list-view>");
        var loadingComplete = waitForLoadingComplete(compiledControl.winControl);

        waitsFor(function () {
            return loadingComplete();
        }, "the ListView's loadingStateChanged=complete event", testTimeout);

        runs(function () {
            expect(compiledControl.winControl.itemsDraggable).toBeTruthy();
            var itemBoxes = compiledControl.querySelectorAll(".win-itembox");
            for (var i = 0; i < itemBoxes.length; i++) {
                expect(itemBoxes[i].draggable).toBeTruthy();
            }
        });
    });

    it("should use the loadingStateChanged event handler", function () {
        var expectedEventsInOrder = ["itemsLoading", "viewPortLoaded", "itemsLoaded", "complete"],
            currentEvent = 0;
        scope.loadingStateChangedHandler = function (e) {
            expect(e.srcElement.winControl.loadingState).toEqual(expectedEventsInOrder[currentEvent++]);
        };
        var compiledControl = initControl("<win-list-view item-data-source='testDataSource' on-loading-state-changed='loadingStateChangedHandler($event)'>" +
                                              "<win-item-template>{{item.data.title}}</win-item-template>" +
                                          "</win-list-view>");
        waitsFor(function () {
            return (currentEvent === expectedEventsInOrder.length);
        }, "the ListView's loadingStateChanged events", testTimeout);
    });

    it("should use the maxDeferredItemCleanup attribute", function () {
        var compiledControl = initControl("<win-list-view max-deferred-item-cleanup='10'></win-list-view>");
        expect(compiledControl.winControl.maxDeferredItemCleanup).toEqual(10);
    });

    it("should use the currentItem attribute", function () {
        scope.testCurrentItem = {
            index: 2
        };
        var compiledControl = initControl("<win-list-view current-item='testCurrentItem'></win-list-view>");
        expect(compiledControl.winControl.currentItem.index).toEqual(2);
    });

    it("should use the tapBehavior attribute", function () {
        var compiledControl = initControl("<win-list-view tap-behavior=\"'toggleSelect'\"></win-list-view>");
        expect(compiledControl.winControl.tapBehavior).toEqual("toggleSelect");
    });

    it("should use the groupHeaderTapBehavior attribute", function () {
        var compiledControl = initControl("<win-list-view group-header-tap-behavior=\"'none'\"></win-list-view>");
        expect(compiledControl.winControl.groupHeaderTapBehavior).toEqual("none");
    });

    it("should use the selectionMode attribute", function () {
        var compiledControl = initControl("<win-list-view selection-mode=\"'none'\"></win-list-view>");
        expect(compiledControl.winControl.selectionMode).toEqual("none");
    });

    it("should use the layout attribute", function () {
        scope.layout = new WinJS.UI.ListLayout();
        var compiledControl = initControl("<win-list-view items-reorderable='true' item-data-source='testDataSource' layout='layout'></win-list-view>");
        var loadingComplete = waitForLoadingComplete(compiledControl.winControl);

        waitsFor(function () {
            return loadingComplete();
        }, "the ListView's loadingStateChanged=complete event", testTimeout);

        runs(function () {
            expect(compiledControl.winControl.layout instanceof WinJS.UI.ListLayout).toBeTruthy();
        });
    });

    it("should use the onContentAnimating event", function () {
        var gotAnimatingEvent = false;
        scope.contentAnimatingEventHandler = function (e) {
            expect(e.detail.type).toEqual("entrance");
            gotAnimatingEvent = true;
        };
        var compiledControl = initControl("<win-list-view item-data-source='testDataSource' on-content-animating='contentAnimatingEventHandler($event)'>" +
                                              "<win-item-template>{{item.data.title}}</win-item-template>" +
                                          "</win-list-view>");
        waitsFor(function () {
            return gotAnimatingEvent;
        }, "the ListView's onContentAnimating event", testTimeout);
    });

    it("should use the selection attribute", function () {
        scope.selection = [];
        var gotAnimatingEvent = false;
        var compiledControl = initControl("<win-list-view item-data-source='testDataSource' selection='selection'>" +
                                              "<win-item-template>{{item.data.title}}</win-item-template>" +
                                          "</win-list-view>");
        var loadingComplete = waitForLoadingComplete(compiledControl.winControl);

        waitsFor(function () {
            return loadingComplete();
        }, "the ListView's loadingStateChanged=complete event", testTimeout);

        runs(function () {
            var control = compiledControl.winControl;
            expect(control.selection.count()).toEqual(0);
            scope.selection.push(2);
            scope.$digest();
            expect(control.selection.count()).toEqual(1);
            expect(control.selection.getIndices()[0]).toEqual(2);
        });
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-listview");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
        WinJS.Utilities._fastAnimations = false;
    });
});
