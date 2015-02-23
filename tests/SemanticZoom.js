// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("SemanticZoom control directive tests", function () {
    var testTimeout = 5000,
        testDatasourceLength = 5;

    var scope,
        compile;

    beforeEach(angular.mock.module("winjs"));
    beforeEach(angular.mock.inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();
        compile = $compile;
        scope.rawData = [];
        for (var i = 0; i < testDatasourceLength; i++) {
            scope.rawData.push({ title: "Item" + i });
        }
        function simpleGroupingFunction(data) {
            return data.title;
        }
        scope.zoomedInSource = new WinJS.Binding.List(scope.rawData).createGrouped(simpleGroupingFunction, simpleGroupingFunction);
        scope.zoomedOutSource = scope.zoomedInSource.groups;
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

    it("should initialize a simple SemanticZoom", function () {
        var compiledControl = initControl("<win-semantic-zoom>" +
                                              "<win-list-view item-data-source='zoomedInSource' group-data-source='zoomedInSource.groups'></win-list-view>" +
                                              "<win-list-view item-data-source='zoomedOutSource'></win-list-view>" +
                                          "</win-semantic-zoom>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.SemanticZoom);
        expect(compiledControl.className).toContain("win-semanticzoom");
    });

    it("should use the enableButton attribute", function () {
        var compiledControl = initControl("<win-semantic-zoom enable-button='false'>" +
                                              "<win-list-view item-data-source='zoomedInSource' group-data-source='zoomedInSource.groups'></win-list-view>" +
                                              "<win-list-view item-data-source='zoomedOutSource'></win-list-view>" +
                                          "</win-semantic-zoom>");

        expect(compiledControl.winControl.enableButton).toBeFalsy();
    });

    it("should use the zoomFactor attribute", function () {
        var compiledControl = initControl("<win-semantic-zoom zoom-factor='0.25'>" +
                                              "<win-list-view item-data-source='zoomedInSource' group-data-source='zoomedInSource.groups'></win-list-view>" +
                                              "<win-list-view item-data-source='zoomedOutSource'></win-list-view>" +
                                          "</win-semantic-zoom>");

        expect(compiledControl.winControl.zoomFactor).toEqual(0.25);
    });

    it("should use the onZoomChanged event handler", function () {
        var gotZoomChangedEvent = false;
        scope.zoomChangedHandler = function (e) {
            gotZoomChangedEvent = true;
        };
        var compiledControl = initControl("<win-semantic-zoom on-zoom-changed='zoomChangedHandler($event)'>" +
                                              "<win-list-view item-data-source='zoomedInSource' group-data-source='zoomedInSource.groups'></win-list-view>" +
                                              "<win-list-view item-data-source='zoomedOutSource'></win-list-view>" +
                                          "</win-semantic-zoom>");

        compiledControl.winControl.zoomedOut = true;
        waitsFor(function () {
            return gotZoomChangedEvent;
        }, "SemanticZoom's onZoomChanged event")
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-semanticzoom");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
        WinJS.Utilities._fastAnimations = false;
    });
});
