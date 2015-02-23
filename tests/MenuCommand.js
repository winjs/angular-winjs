// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("MenuCommand control directive tests", function () {
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

    it("should use initialize a Menu containing two child MenuCommands", function () {
        var compiledControl = initControl("<win-menu>" +
                                              "<win-menu-command></win-menu-command>" +
                                              "<win-menu-command></win-menu-command>" +
                                          "</win-menu>");

        var winControl = compiledControl.winControl;
        expect(compiledControl.winControl).toBeDefined();
        expect(compiledControl.winControl instanceof WinJS.UI.Menu);
        expect(compiledControl.className).toContain("win-menu");
        expect(compiledControl.querySelectorAll(".win-command").length).toEqual(2);
    });

    it("should use the id attribute on MenuCommands", function () {
        var compiledControl = initControl("<win-menu>" +
                                              "<win-menu-command id=\"'command1'\"></win-menu-command>" +
                                              "<win-menu-command id=\"'command2'\"></win-menu-command>" +
                                          "</win-menu>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands[0].id).toEqual("command1");
        expect(commands[1].id).toEqual("command2");
    });

    it("should use the label attribute on MenuCommands", function () {
        var compiledControl = initControl("<win-menu>" +
                                              "<win-menu-command label=\"'command1'\"></win-menu-command>" +
                                              "<win-menu-command label=\"'command2'\"></win-menu-command>" +
                                          "</win-menu>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands[0].querySelector(".win-label").innerHTML).toEqual("command1");
        expect(commands[1].querySelector(".win-label").innerHTML).toEqual("command2");
    });

    it("should use the disabled attribute on MenuCommands", function () {
        var compiledControl = initControl("<win-menu>" +
                                              "<win-menu-command disabled='true'></win-menu-command>" +
                                              "<win-menu-command disabled='false'></win-menu-command>" +
                                          "</win-menu>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands[0].winControl.disabled).toBeTruthy();
        expect(commands[1].winControl.disabled).toBeFalsy();
    });

    it("should use the extraClass attribute on MenuCommands", function () {
        var compiledControl = initControl("<win-menu>" +
                                              "<win-menu-command extra-class=\"'extraClass1'\"></win-menu-command>" +
                                          "</win-menu>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands[0].className).toContain("extraClass1");
    });

    it("should use the section attribute on MenuCommands", function () {
        var compiledControl = initControl("<win-menu>" +
                                              "<win-menu-command section=\"'global'\"></win-menu-command>" +
                                              "<win-menu-command section=\"'selection'\"></win-menu-command>" +
                                          "</win-menu>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands[0].winControl.section).toEqual("global");
        expect(commands[1].winControl.section).toEqual("selection");
    });

    it("should use the type attribute on MenuCommands", function () {
        var compiledControl = initControl("<win-menu>" +
                                              "<win-menu-command type=\"'button'\"></win-menu-command>" +
                                              "<win-menu-command type=\"'toggle'\"></win-menu-command>" +
                                          "</win-menu>");

        var commands = compiledControl.querySelectorAll(".win-command");
        expect(commands[0].winControl.type).toEqual("button");
        expect(commands[1].winControl.type).toEqual("toggle");

    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-menu");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
