// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("ContentDialog control directive tests", function () {
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

    it("should initialize a simple ContentDialog control", function () {
        var compiledControl = initControl("<win-content-dialog></win-content-dialog>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.ContentDialog);
        expect(compiledControl.className).toContain("win-contentdialog");
    });

    it("should use the title attribute", function () {
        var compiledControl = initControl("<win-content-dialog title=\"'ContentDialogTitle'\"></win-content-dialog>");
        expect(compiledControl.winControl.title).toEqual("ContentDialogTitle");
    });

    it("should use the primaryCommandText attribute", function () {
        var compiledControl = initControl("<win-content-dialog primary-command-text=\"'PrimaryCommandText'\"></win-content-dialog>");
        var primaryCommand = compiledControl.querySelector(".win-contentdialog-primarycommand");
        expect(primaryCommand.innerHTML).toEqual("PrimaryCommandText");
    });

    it("should use the primaryCommandDisabled attribute", function () {
        var compiledControl = initControl("<win-content-dialog primary-command-text=\"'PrimaryCommandText'\" primary-command-disabled='true'></win-content-dialog>");
        var primaryCommand = compiledControl.querySelector(".win-contentdialog-primarycommand");
        expect(primaryCommand.disabled).toBeTruthy();
    });

    it("should use the secondaryCommandText attribute", function () {
        var compiledControl = initControl("<win-content-dialog secondary-command-text=\"'SecondaryCommandText'\"></win-content-dialog>");
        var secondaryCommand = compiledControl.querySelector(".win-contentdialog-secondarycommand");
        expect(secondaryCommand.innerHTML).toEqual("SecondaryCommandText");
    });

    it("should use the secondaryCommandDisabled attribute", function () {
        var compiledControl = initControl("<win-content-dialog secondary-command-text=\"'SecondaryCommandText'\" secondary-command-disabled='true'></win-content-dialog>");
        var secondaryCommand = compiledControl.querySelector(".win-contentdialog-secondarycommand");
        expect(secondaryCommand.disabled).toBeTruthy();
    });

    it("should use the onshow and onhide event handlers", function () {
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
        scope.dialogHidden = true;
        var compiledControl = initControl("<win-content-dialog on-before-show='beforeShowEventHandler($event)' on-after-show='afterShowEventHandler($event)' " +
                                           "on-before-hide='beforeHideEventHandler($event)' on-after-hide='afterHideEventHandler($event)' hidden='dialogHidden'></win-content-dialog>");
        runs(function () {
            compiledControl.winControl.show();
        });

        waitsFor(function () {
            return (gotBeforeShowEvent && gotAfterShowEvent);
        }, "the ContentDialog's before+aftershow events", testTimeout);

        runs(function () {
            expect(compiledControl.winControl.hidden).toBeFalsy();
            // TODO: Uncomment this assertion when wrapper issue is fixed (right now wrapper doesn't propogate change in visibility back up to scope)
            // expect(scope.dialogHidden).toBeFalsy();
            compiledControl.winControl.hide();
        });

        waitsFor(function () {
            return (gotBeforeHideEvent && gotAfterHideEvent);
        }, "the ContentDialog's before+afterhide events", testTimeout);

        runs(function () {
            expect(compiledControl.winControl.hidden).toBeTruthy();
            // TODO: Uncomment this assertion when wrapper issue is fixed (right now wrapper doesn't propogate change in visibility back up to scope)
            // expect(scope.dialogHidden).toBeTruthy();
        });
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-contentdialog");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
