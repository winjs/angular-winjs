// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("HubSection control directive tests", function () {
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

    it("should initialize a simple Hub with a single HubSection", function () {
        var compiledControl = initControl("<win-hub>" +
                                              "<win-hub-section>Simple Section</win-hub-section>" +
                                          "</win-hub>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.Hub);
        expect(compiledControl.className).toContain("win-hub");
        expect(compiledControl.querySelectorAll(".win-hub-section").length).toEqual(1);
    });

    it("should use the header attribute", function () {
        var compiledControl = initControl("<win-hub>" +
                                              "<win-hub-section header=\"'SimpleHeader'\">Simple Section</win-hub-section>" +
                                          "</win-hub>");

        waitsFor(function () {
            return (compiledControl.winControl.loadingState === "complete");
        }, "the Hub to load", testTimeout);

        runs(function () {
            var headers = compiledControl.querySelectorAll(".win-hub-section-header");
            expect(headers.length).toEqual(1);
            var headerContent = headers[0].querySelectorAll(".win-hub-section-header-content");
            expect(headerContent.length).toEqual(1);
            expect(headerContent[0].innerHTML).toEqual("SimpleHeader");
        });
    });

    it("should use the isHeaderStatic attribute", function () {
        var compiledControl = initControl("<win-hub>" +
                                              "<win-hub-section is-header-static='true'>Simple Section</win-hub-section>" +
                                          "</win-hub>");
        var headers = compiledControl.querySelectorAll(".win-hub-section");
        expect(headers.length).toEqual(1);
        expect(headers[0].winControl.isHeaderStatic).toBeTruthy();
    });

    /* TODO: Uncomment this test when bug is fixed
    it("should use the existing CSS classes provided via markup", function () {
        var compiledControl = initControl("<win-hub>" +
                                              "<win-hub-section class='HubSectionClass'>Simple Section</win-hub-section>" +
                                          "</win-hub>");
        var headers = compiledControl.querySelectorAll(".win-hub-section");
        expect(headers[0].className).toContain("HubSectionClass");
    });
    */

    it("should allow ng-repeat to be used in conjunction with the Hub to create HubSections", function () {
        var compiledControl = initControl("<win-hub>" +
                                              "<win-hub-section ng-repeat='item in testDataSource' header='item.title'></win-hub-section>" +
                                          "</win-hub>");

        waitsFor(function () {
            return (compiledControl.winControl.loadingState === "complete");
        }, "the Hub to load", testTimeout);

        runs(function () {
            var headers = compiledControl.querySelectorAll(".win-hub-section-header");
            var headerContent = compiledControl.querySelectorAll(".win-hub-section-header-content");
            expect(headers.length).toEqual(testDataSourceLength);
            expect(headerContent.length).toEqual(testDataSourceLength);
            for (var i = 0; i < testDataSourceLength; i++) {
                expect(headerContent[i].innerHTML).toEqual("Item" + i);
            }
        });
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-hub");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
