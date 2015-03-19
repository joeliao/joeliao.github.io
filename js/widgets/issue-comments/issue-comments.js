﻿/*global define,dojo,dojoConfig,alert,moment */
/*jslint browser:true,sloppy:true,nomen:true,unparam:true,plusplus:true,indent:4 */
/** @license
| Copyright 2013 Esri
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
//============================================================================================================================//
define([
    "dojo/_base/declare",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/string",
    "dojo/query",
    "esri/graphic",
    "dojo/text!./templates/issue-comments.html",
    "dojo/text!./templates/issue-comment-template.html",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "esri/tasks/query",
    "esri/tasks/RelationshipQuery"

], function (declare, dom, domConstruct, domStyle, domAttr, domClass, lang, on, string, query, Graphic, template, issueCommentTemplate, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Query, RelationshipQuery) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,

        //currentObjectID added by Xiongjiu 3/18/2015
        _currentObjectID: null,
        _currentlayer: null,

        /**
        * This function is called when widget is constructed.
        * @param{object} config to be mixed
        * @memberOf widgets/issue-comments/issue-comments
        */
        constructor: function (config) {
            lang.mixin({}, this, config);
        },

        /**
        * This widget helps to show and update comments
        * @memberOf widgets/issue-comments/issue-comments
        */
        postCreate: function () {
            this.parentContainer.appendChild(this.commentsContainer);
            this.commentsContainerBox = domConstruct.create("textarea", { "class": "textAreaContent", "placeholder": dojo.configData.i18n.comment.placeHolderText }, this.enterCommentContainer);
            // on click of close button
            on(this.commentCloseButton, "click", lang.hitch(this, function (evt) {
                domClass.replace(this.commentsContainer, "esriCTHidden", "esriCTVisible");
                this.commentsContainerBox.value = "";
            }));
            // on submission of comment
            on(this.postCommentButton, "click", lang.hitch(this, function (evt) {
                this._submitComment(this.commentsContainerBox);
            }));

            // change event on textarea
            on(this.commentsContainerBox, "change", lang.hitch(this, function (evt) {
                this._calculateCharactersCount();
            }));

            // keyup event on textarea
            on(this.commentsContainerBox, "keyup", lang.hitch(this, function (evt) {
                this._calculateCharactersCount();
            }));

            // paste event on textarea
            on(this.commentsContainerBox, "paste", lang.hitch(this, function (evt) {
                this._calculateCharactersCount();
            }));

            // cut event on textarea
            on(this.commentsContainerBox, "cut", lang.hitch(this, function (evt) {
                this._calculateCharactersCount();
            }));

            // On window resize update the height of comment details based on screen size and headers and footers.
            // As in case of long header title, header height need to be adjusted.
            on(window, "resize", lang.hitch(this, function () {
                this.resizeCommentContainer();
            }));
        },

        /**
        * Calculating height of comments container
        * @memberOf widgets/issue-comments/issue-comments
        */
        resizeCommentContainer: function () {
            var commentHeaderDiv, commentFooterDiv, commentsContainerHeight, commentsDetailsData;
            // If comments container is open, adjust the container height on window resize
            if (!domClass.contains(this.commentsContainer, "esriCTHidden")) {
                commentHeaderDiv = query(".esriCTCommentHeader", this.commentsContainer);
                commentFooterDiv = query(".esriCTCommentFooterHeight", this.commentsContainer);
                if (commentHeaderDiv.length > 0 && commentFooterDiv.length > 0) {
                    commentsContainerHeight = parseInt(this.commentsContainer.clientHeight - (commentHeaderDiv[0].clientHeight + commentFooterDiv[0].clientHeight + 17), 10);
                }
                commentsDetailsData = query(".esriCTCommentsContainer")[0];
                if (commentsDetailsData) {
                    domStyle.set(commentsDetailsData, "height", commentsContainerHeight + "px");
                    if ((dojo.isIE < 9) && commentsContainerHeight < 500) {
                        domStyle.set(commentsDetailsData, "min-height", commentsContainerHeight + "px");
                        domStyle.set(commentsDetailsData, "max-height", commentsContainerHeight + "px");
                    }
                }
            }
        },

        /**
        * Calculating character count of text area
        * @memberOf widgets/issue-comments/issue-comments
        */
        _calculateCharactersCount: function () {
            var count;
            /* Check if the number of characters entered in the comment textarea exceeds the character limit
             If it exceeds the limit do not allow the user to add more characters
             Else, accept the added character and decrease the character count */
            if (this.commentsContainerBox.value.length >= this.characterLength) {
                this.commentsContainerBox.value = this.commentsContainerBox.value.substring(0, this.characterLength);
                this.commentsContainerBox.blur();
                // Setting the count to "No" if character limit is exceeded
                count = dojo.configData.i18n.comment.showNoText;
                this.countLabel.innerHTML = string.substitute(dojo.configData.i18n.comment.remainingTextCount, [count]);
            } else {
                // Decreasing the count and displaying the entered character in the textarea
                count = this.characterLength - this.commentsContainerBox.value.length;
                this.countLabel.innerHTML = string.substitute(dojo.configData.i18n.comment.remainingTextCount, [count]);
            }
        },

        /**
        * Fetch comments from layer
        * @param{object} attributes contains layer attribute
        * @memberOf widgets/issue-comments/issue-comments
        */
        fetchComments: function (paramsObj) {
            this.params = paramsObj;
            var divHeaderContent, currentID, i, relatedQuery, g;
            // Removing no comment available from div
            divHeaderContent = query('.esriCTNoCommentsDiv');
            if (divHeaderContent.length > 0) {
                domConstruct.empty(divHeaderContent[0]);
            }
            domClass.replace(this.commentsContainer, "esriCTVisible", "esriCTHidden");
            domConstruct.empty(this.commentsContent);
            // Setting title in header of comments container
            this.commentTitleDivHeader.innerHTML = this.params.issueTitle;
            relatedQuery = new RelationshipQuery();
            relatedQuery.outFields = ["*"];
            relatedQuery.relationshipId = this.params.layer.relationships[0].id;
            relatedQuery.objectIds = [this.params.objectId];
            currentID = this.params.objectId;

            this._currentObjectID = currentID;
            this._currentlayer = this.params.layer;
            //console.log(relatedQuery.relationshipId);
            //console.log(relatedQuery.objectIds);
            //console.log(currentID);


     

            // Getting character length from comments table
            if (this.params.relatedTable && this.params.relatedTable.fields) {
                // Looping through the fields present in the related table for getting character length
                for (g = 0; g < this.params.relatedTable.fields.length; g++) {
                    if (this.params.relatedTable.fields[g].name === dojo.configData.commentField) {
                        this.characterLength = this.params.relatedTable.fields[g].length;
                    }
                }
            }
            // Assigning maxLength for textarea
            this._setTextAreaMaxLength();
            // Query for related features and showing comments
            this.params.layer.queryRelatedFeatures(relatedQuery, lang.hitch(this, function (relatedRecords) {

                if (relatedRecords[currentID] && relatedRecords[currentID].features.length > 0) {
                    for (i = relatedRecords[currentID].features.length - 1; i >= 0; i--) {
                        this._showComments(relatedRecords[currentID].features[i].attributes, true);
                    }
                } else {
                    domConstruct.create("div", {
                        "innerHTML": dojo.configData.i18n.comment.noCommentsAvailableText,
                        "class": "esriCTNoCommentsDiv"
                    }, this.commentsContent);
                }
                dojo.applicationUtils.hideLoadingIndicator();
            }), function (err) {
                dojo.applicationUtils.hideLoadingIndicator();
                alert(err);
            });
            this.resizeCommentContainer();
        },

        /**
       * county the number of comments for each issue
       * @param{rid} relationshipid
       * @param{oid} objectid
       * @param{cid} currentid
       * @memberOf widgets/issue-wall/issue-wall
       */
        _updateCommentsCount: function (cid) {
            // console.log(r.features.length);
            var ds = dojo.query(".esriCTCommentCount");
            for (var i = 0; i < ds.length; i++) {
                d = ds[i];
                require(["dojo/dom-attr"], function (domAttr) {
                    var did = domAttr.getNodeProp(d, "objid");
                    if (did == cid) {
                        d.innerHTML = Number(d.innerHTML)+1;
                    }
                });
            }
        },

        /**
        * Show comments in comments panel
        * @param{object} attributes contains layer attribute
        * @param{boolean} isChildNode contains Boolean value for child node
        * @memberOf widgets/issue-comments/issue-comments
        */
        _showComments: function (attributes, isChildNode) {
            var commentTemplateString, parentDiv, commentText;
            commentText = attributes[dojo.configData.commentField].replace(/(?:\r\n|\r|\n)/g, '<br />');
            commentTemplateString = string.substitute(issueCommentTemplate, {
                IssueComment: commentText
            });
            // Checking if IE Version is less than 9
            if (dojo.isIE < 9) {
                parentDiv = domConstruct.toDom(commentTemplateString);
            } else {
                parentDiv = domConstruct.toDom(commentTemplateString).childNodes[0];
            }
            // Checking for child node
            if (isChildNode) {
                this.commentsContent.appendChild(parentDiv);
            } else {
                domConstruct.place(parentDiv, this.commentsContent, "first");
            }
        },

        /**
        * Display character count
        * @memberOf widgets/issue-comments/issue-comments
        */
        _setTextAreaMaxLength: function () {
            this.countLabel.innerHTML = string.substitute(dojo.configData.i18n.comment.remainingTextCount, [this.characterLength]);
        },

        /**
        * Submit comment on click of submit button
        * @param{object} commentsContainer contains the comments container object
        * @memberOf widgets/issue-comments/issue-comments
        */
        _submitComment: function (commentsContainer) {
            var cid=this._currentObjectID;
             this._updateCommentsCount(cid);
            var featureData, attributes = {}, divHeaderContent;
            //Proceed if relatedTable and relationships is available, if not show error.
            if (this.params.relatedTable && this.params.relatedTable.relationships.length > 0) {
                if (lang.trim(commentsContainer.value) !== "") {
                    // Create instance of graphic
                    featureData = new Graphic();
                    // create an empty array object
                    attributes[dojo.configData.commentField] = lang.trim(commentsContainer.value);
                    attributes[this.params.relatedTable.relationships[0].keyField] = this.params.globalIdField;
                    featureData.setAttributes(attributes);
                    //console.log(featureData);
                    ///console.log(commentsContainer);

                    
                    // Removing no comment available message from div
                    divHeaderContent = query('.esriCTNoCommentsDiv');
                    if (divHeaderContent.length > 0) {
                        domConstruct.empty(divHeaderContent[0]);
                    }
                    this.params.relatedTable.applyEdits([featureData], null, null, lang.hitch(this, function (result) {
                        if (result[0].success && commentsContainer.value !== "") {
                            this._showComments(featureData.attributes, false);
                            // Assigning maxLength for Text area
                            this._setTextAreaMaxLength();
                            commentsContainer.value = "";
                        } else {
                            // If comment container has no comment then show message and set the remaining text
                            if (commentsContainer.value === "") {
                                this._setTextAreaMaxLength();
                                dojo.applicationUtils.showError(dojo.configData.i18n.comment.emptyCommentMessage);
                                return;
                            }
                            // Assigning maxLength for textarea
                            this._setTextAreaMaxLength();
                            commentsContainer.value = "";
                            dojo.applicationUtils.showError(dojo.configData.i18n.comment.errorInSubmittingComment);
                        }
                    }), function (err) {
                        // Assigning maxLength for textarea
                        this._setTextAreaMaxLength();
                        commentsContainer.value = "";
                        dojo.applicationUtils.showError(dojo.configData.i18n.comment.errorInSubmittingComment);
                    });
                } else {
                    // Assigning  maxLength for textarea
                    this._setTextAreaMaxLength();
                    commentsContainer.value = "";
                    dojo.applicationUtils.showError(dojo.configData.i18n.comment.emptyCommentMessage);
                }
            } else {
                // Assigning maxLength for textarea
                this._setTextAreaMaxLength();
                commentsContainer.value = "";
                dojo.applicationUtils.showError(dojo.configData.i18n.comment.errorInSubmittingComment);
            }
        }
    });
});
