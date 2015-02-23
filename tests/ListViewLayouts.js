// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("ListView Layout control directive tests", function () {
    var testTimeout = 5000,
        testDatasourceLength = 5;

    var scope,
        compile;

    beforeEach(angular.mock.module("winjs"));
    beforeEach(angular.mock.inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();
        compile = $compile;
        scope.testDataSource = [];
        for (var i = 0; i < testDatasourceLength; i++) {
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

    it("should use the ListLayout defined inline", function () {
        var compiledControl = initControl("<win-list-view item-data-source='testDataSource'>" +
                                              "<win-item-template>{{item.data.title}}</win-item-template>" +
                                              "<win-list-layout></win-list-layout>" +
                                          "</win-list-view>");
        var loadingComplete = waitForLoadingComplete(compiledControl.winControl);

        waitsFor(function () {
            return loadingComplete();
        }, "the ListView's loadingStateChanged=complete event", testTimeout);

        runs(function () {
            expect(compiledControl.winControl.layout instanceof WinJS.UI.ListLayout).toBeTruthy();
        });
    });

    it("should use the orientation attribute on the ListLayout element", function () {
        var compiledControl = initControl("<win-list-view item-data-source='testDataSource'>" +
                                              "<win-item-template>{{item.data.title}}</win-item-template>" +
                                              "<win-list-layout orientation=\"'horizontal'\"></win-list-layout>" +
                                          "</win-list-view>");
        var loadingComplete = waitForLoadingComplete(compiledControl.winControl);

        waitsFor(function () {
            return loadingComplete();
        }, "the ListView's loadingStateChanged=complete event", testTimeout);

        runs(function () {
            expect(compiledControl.winControl.layout.orientation).toEqual("horizontal");
        });
    });

    it("should use the groupHeaderPosition attribute on the ListLayout element", function () {
        var compiledControl = initControl("<win-list-view item-data-source='testDataSource'>" +
                                              "<win-item-template>{{item.data.title}}</win-item-template>" +
                                              "<win-list-layout group-header-position=\"'left'\"></win-list-layout>" +
                                          "</win-list-view>");
        var loadingComplete = waitForLoadingComplete(compiledControl.winControl);

        waitsFor(function () {
            return loadingComplete();
        }, "the ListView's loadingStateChanged=complete event", testTimeout);

        runs(function () {
            expect(compiledControl.winControl.layout.groupHeaderPosition).toEqual("left");
        });
    });

    it("should use the GridLayout defined inline", function () {
        var compiledControl = initControl("<win-list-view item-data-source='testDataSource'>" +
                                              "<win-item-template>{{item.data.title}}</win-item-template>" +
                                              "<win-grid-layout></win-grid-layout>" +
                                          "</win-list-view>");
        var loadingComplete = waitForLoadingComplete(compiledControl.winControl);

        waitsFor(function () {
            return loadingComplete();
        }, "the ListView's loadingStateChanged=complete event", testTimeout);

        runs(function () {
            expect(compiledControl.winControl.layout instanceof WinJS.UI.GridLayout).toBeTruthy();
        });
    });

    it("should use the orientation attribute on the GridLayout element", function () {
        var compiledControl = initControl("<win-list-view item-data-source='testDataSource'>" +
                                              "<win-item-template>{{item.data.title}}</win-item-template>" +
                                              "<win-grid-layout orientation=\"'vertical'\"></win-grid-layout>" +
                                          "</win-list-view>");
        var loadingComplete = waitForLoadingComplete(compiledControl.winControl);

        waitsFor(function () {
            return loadingComplete();
        }, "the ListView's loadingStateChanged=complete event", testTimeout);

        runs(function () {
            expect(compiledControl.winControl.layout.orientation).toEqual("vertical");
        });
    });

    it("should use the groupHeaderPosition attribute on the GridLayout element", function () {
        var compiledControl = initControl("<win-list-view item-data-source='testDataSource'>" +
                                              "<win-item-template>{{item.data.title}}</win-item-template>" +
                                              "<win-grid-layout group-header-position=\"'left'\"></win-grid-layout>" +
                                          "</win-list-view>");
        var loadingComplete = waitForLoadingComplete(compiledControl.winControl);

        waitsFor(function () {
            return loadingComplete();
        }, "the ListView's loadingStateChanged=complete event", testTimeout);

        runs(function () {
            expect(compiledControl.winControl.layout.groupHeaderPosition).toEqual("left");
        });
    });

    it("should use the maximumRowsOrColumns attribute on the GridLayout element", function () {
        var compiledControl = initControl("<win-list-view item-data-source='testDataSource'>" +
                                              "<win-item-template>{{item.data.title}}</win-item-template>" +
                                              "<win-grid-layout maximum-rows-or-columns='3'></win-grid-layout>" +
                                          "</win-list-view>");
        var loadingComplete = waitForLoadingComplete(compiledControl.winControl);

        waitsFor(function () {
            return loadingComplete();
        }, "the ListView's loadingStateChanged=complete event", testTimeout);

        runs(function () {
            expect(compiledControl.winControl.layout.maximumRowsOrColumns).toEqual(3);
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
