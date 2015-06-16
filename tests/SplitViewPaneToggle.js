// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("SplitViewPaneToggle control directive tests", function () {
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

    it("should initialize a simple SplitViewPaneToggle", function () {
        var compiledControl = initControl("<win-split-view-pane-toggle></win-split-view-pane-toggle>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.SplitViewPaneToggle);
        expect(compiledControl.className).toContain("win-splitviewpanetoggle");
    });

    it("should use the splitView attribute", function () {
        scope.splitView = new WinJS.UI.SplitView().element;
        var control = initControl("<win-split-view-pane-toggle split-view='splitView'></win-split-view-pane-toggle>").winControl;

        expect(control.splitView).toEqual(scope.splitView);
    });

    it("should use the onInvoked attribute", function () {
        var gotInvokedEvent = false;
        scope.onInvoked = function () {
            gotInvokedEvent = true;
        };
        var compiledControl = initControl("<win-split-view-pane-toggle on-invoked='onInvoked($event)'></win-split-view-pane-toggle>");
        expect(gotInvokedEvent).toBeFalsy();
        compiledControl.click();
        expect(gotInvokedEvent).toBeTruthy();
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-splitviewpanetoggle");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
