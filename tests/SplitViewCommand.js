// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("SplitViewCommand control directive tests", function () {
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

    it("should initialize a simple SplitViewCommand", function () {
        var compiledControl = initControl("<win-split-view-command></win-split-view-command>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.SplitViewCommand);
        expect(compiledControl.className).toContain("win-splitviewcommand");
    });

    it("should use the label attribute", function () {
        var compiledControl = initControl("<win-split-view-command label=\"'add'\"></win-split-view-command>");

        expect(compiledControl.querySelector(".win-splitviewcommand-label").innerHTML).toEqual("add");
    });

    it("should use the onInvoked attribute", function () {
        var gotInvokedEvent = false;
        scope.onInvoked = function () {
            gotInvokedEvent = true;
        };
        var compiledControl = initControl("<win-split-view-command on-invoked='onInvoked($event)'></win-split-view-command>");
        var button = compiledControl.querySelector(".win-splitviewcommand-button");
        expect(gotInvokedEvent).toBeFalsy();
        button.click();
        expect(gotInvokedEvent).toBeTruthy();
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-splitviewcommand");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});

