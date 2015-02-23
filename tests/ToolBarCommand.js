// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("ToolBarCommand control directive tests", function () {
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

    it("should use initialize a ToolBar containing two child ToolBarCommands", function () {
        var compiledControl = initControl("<win-tool-bar>" +
                                              "<win-tool-bar-command></win-tool-bar-command>" +
                                              "<win-tool-bar-command></win-tool-bar-command>" +
                                          "</win-tool-bar>");

        var winControl = compiledControl.winControl;
        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.ToolBar);
        expect(compiledControl.className).toContain("win-toolbar");
        expect(compiledControl.querySelectorAll(".win-command").length).toEqual(2);
    });

    it("should use the id attribute on ToolBarCommands", function () {
        var compiledControl = initControl("<win-tool-bar>" +
                                              "<win-tool-bar-command id=\"'command1'\"></win-tool-bar-command>" +
                                              "<win-tool-bar-command id=\"'command2'\"></win-tool-bar-command>" +
                                          "</win-tool-bar>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands[0].id).toEqual("command1");
        expect(commands[1].id).toEqual("command2");
    });

    it("should use the label attribute on ToolBarCommands", function () {
        var compiledControl = initControl("<win-tool-bar>" +
                                              "<win-tool-bar-command label=\"'command1'\"></win-tool-bar-command>" +
                                              "<win-tool-bar-command label=\"'command2'\"></win-tool-bar-command>" +
                                          "</win-tool-bar>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands[0].querySelector(".win-label").innerHTML).toEqual("command1");
        expect(commands[1].querySelector(".win-label").innerHTML).toEqual("command2");
    });

    it("should use the disabled attribute on ToolBarCommands", function () {
        var compiledControl = initControl("<win-tool-bar>" +
                                              "<win-tool-bar-command disabled='true'></win-tool-bar-command>" +
                                              "<win-tool-bar-command disabled='false'></win-tool-bar-command>" +
                                          "</win-tool-bar>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands[0].winControl.disabled).toBeTruthy();
        expect(commands[1].winControl.disabled).toBeFalsy();
    });

    it("should use the extraClass attribute on ToolBarCommands", function () {
        var compiledControl = initControl("<win-tool-bar>" +
                                              "<win-tool-bar-command extra-class=\"'extraClass1'\"></win-tool-bar-command>" +
                                          "</win-tool-bar>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands[0].className).toContain("extraClass1");
    });

    it("should use the section attribute on ToolBarCommands", function () {
        var compiledControl = initControl("<win-tool-bar>" +
                                              "<win-tool-bar-command section=\"'global'\"></win-tool-bar-command>" +
                                              "<win-tool-bar-command section=\"'selection'\"></win-tool-bar-command>" +
                                          "</win-tool-bar>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands[0].winControl.section).toEqual("global");
        expect(commands[1].winControl.section).toEqual("selection");
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-toolbar");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
