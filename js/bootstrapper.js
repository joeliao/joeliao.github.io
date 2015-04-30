﻿/*global define,document,dojo,window,alert,setTimeout,$ */
/*jslint browser:true,sloppy:true,nomen:true,unparam:true,plusplus:true,indent:4 */
/*
| Copyright 2014 Esri
|
| Licensed under the Apache License, Version 2.0 (the "License");
| you may not use this file except in compliance with the License.
| You may obtain a copy of the License at
|
|    http://www.apache.org/licenses/LICENSE-2.0
|
| Unless required by applicable law or agreed to in writing, software
| distributed under the License is distributed on an "AS IS" BASIS,
| WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
| See the License for the specific language governing permissions and
| limitations under the License.
*/
define(["dojo/_base/declare",
     "config/template-config",
     "application/template",
     "widgets/sign-in/sign-in",
     "application/utils/utils",
     "dojo/_base/lang",
      "dojo/window", "dojo/dom-style"
    ], function (
    declare,
    TemplateConfig,
    Template,
    ApplicationSignIn,
    ApplicationUtils,
    lang,
    dojowindow, dojoStyle
) {
        return declare(null, {
            boilerPlateTemplateObject: null,

            /**
            * This function is called when user needs to start operation of widget
            * @memberOf js/bootstrapper
            */
            startup: function () {
                // create the template. This will take care of all the logic required for template applications
                this.boilerPlateTemplateObject = new Template(TemplateConfig);
                this.boilerPlateTemplateObject.startup().then(lang.hitch(this,function (config) {
                    // The config object contains the following properties: helper services, (optionally)
                    // i18n, appid, webmap and any custom values defined by the application.

                    // Load Application if valid group-id is configured, if not show error message.
                    if (lang.trim(config.group) !== "") {
                        this.initApplication();
                    } else {
                        ApplicationUtils.showErrorScreen(this.boilerPlateTemplateObject.config.i18n.main.noGroup);
                        ApplicationUtils.hideLoadingIndicator();
                    }
                }), function (error) {
                    var message = error.message;
                    // handle error when group is not configured
                    if (message.toLowerCase() === "group undefined.") {
                        message = this.boilerPlateTemplateObject.config.i18n.main.noGroup;
                    }
                    ApplicationUtils.showErrorScreen(message);
                    ApplicationUtils.hideLoadingIndicator();
                });

                //adjust the instruction dialog according to the window size
                dojo.connect(instructionDialog, "onShow", function () {
                    if (dojowindow.getBox().w < 500) {
                        dojoStyle.set("instructionDestopDiv", "display", "none");
                        dojoStyle.set("instructionMobileDiv", "display", "block");
                    } else {
                        dojoStyle.set("instructionDestopDiv", "display", "block");
                        dojoStyle.set("instructionMobileDiv", "display", "none");
                    }
                });
            },

            /**
            * This function is used to initiate the main application
            * @memberOf js/bootstrapper
            */
            initApplication: function () {
                var citizenApp;
                // create citizenApp and pass the boiler plate instance to it
                citizenApp = new ApplicationSignIn();
                citizenApp.startup(this.boilerPlateTemplateObject);
            }
        });
    });