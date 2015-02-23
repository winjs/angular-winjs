// Copyright (c) Microsoft Corp.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

describe("NavBarCommand control directive tests", function () {
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

    it("should use initialize a NavBar containing two child NavBarCommands", function () {
        var compiledControl = initControl("<win-nav-container>" +
                                              "<win-nav-bar-command></win-nav-bar-command>" +
                                              "<win-nav-bar-command></win-nav-bar-command>" +
                                          "</win-nav-container>");

        expect(compiledControl.querySelectorAll(".win-navbarcommand").length).toEqual(2);
    });

    it("should use the label attribute on NavBarCommands", function () {
        var compiledControl = initControl("<win-nav-container>" +
                                              "<win-nav-bar-command label=\"'command1'\"></win-nav-bar-command>" +
                                              "<win-nav-bar-command label=\"'command2'\"></win-nav-bar-command>" +
                                          "</win-nav-container>");

        var commands = compiledControl.querySelectorAll(".win-navbarcommand");
        expect(commands[0].querySelector(".win-navbarcommand-label").innerHTML).toEqual("command1");
        expect(commands[1].querySelector(".win-navbarcommand-label").innerHTML).toEqual("command2");
    });

    it("should use the location attribute on NavBarCommands", function () {
        var compiledControl = initControl("<win-nav-container>" +
                                              "<win-nav-bar-command location=\"'someLocation'\"></win-nav-bar-command>" +
                                          "</win-nav-container>");

        var commands = compiledControl.querySelectorAll(".win-navbarcommand");
        expect(commands[0].winControl.location).toEqual("someLocation");
    });

    afterEach(function () {
        var controls = document.querySelectorAll(".win-navbarcontainer");
        for (var i = 0; i < controls.length; i++) {
            controls[i].parentNode.removeChild(controls[i]);
        }
    });
});
