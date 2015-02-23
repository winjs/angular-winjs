// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("ToolBar control directive tests", function () {
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

    it("should initialize a simple ToolBar", function () {
        var compiledControl = initControl("<win-tool-bar></win-tool-bar>");

        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.ToolBar);
        expect(compiledControl.className).toContain("win-toolbar");
    });

    it("should use child ToolBarCommands", function () {
        var compiledControl = initControl("<win-tool-bar>" +
                                              "<win-tool-bar-command></win-tool-bar-command>" +
                                              "<win-tool-bar-command></win-tool-bar-command>" +
                                          "</win-tool-bar>");

        expect(compiledControl.querySelectorAll(".win-command").length).toEqual(2);
    });

    it("should use the shownDisplayMode attribute", function () {
        var compiledControl = initControl("<win-tool-bar shown-display-mode=\"'reduced'\"></win-tool-bar>");
        expect(compiledControl.winControl.shownDisplayMode).toEqual("reduced");
    });

    it("should use the extraClass attribute", function () {
        var compiledControl = initControl("<win-tool-bar extra-class=\"'ExtraClass'\"></win-tool-bar>");
        expect(compiledControl.className).toContain("ExtraClass");
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-toolbar");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
