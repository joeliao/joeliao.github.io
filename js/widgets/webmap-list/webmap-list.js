﻿/*global define,document,location,require,alert,console,dojo,$,setTimeout,moment,dojoConfig*/
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
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/webmap-list.html",
    "dojo/dom-construct",
    "dojo/DeferredList",
    "esri/arcgis/utils",
    "dojo/text!./templates/webmap-item.html",
    "dojo/text!./templates/operational-layer.html",
    "dojo/_base/event",
    "dojo/string",
    "dojo/dom-attr",
    "dojo/on",
    "esri/layers/FeatureLayer",
    "dojo/dom",
    "dojo/dom-class",
    "widgets/bootstrapmap/bootstrapmap",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/query"
], function (
    declare,
    lang,
    _WidgetBase,
    _TemplatedMixin,
    dijitTemplate,
    domConstruct,
    DeferredList,
    arcgisUtils,
    webMapItemTemplate,
    operationalLayerTemplate,
    event,
    string,
    domAttr,
    on,
    FeatureLayer,
    dom,
    domClass,
    BootstrapMap,
    _WidgetsInTemplateMixin,
    query
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: dijitTemplate,
        filteredWebMapResponseArr: [], // to store web-map that needs to be displayed in list
        lastWebMapSelected: "", // used to store last web map that is selected
        map: null, // to store map object
        options: {}, // to mixin data in this object
        configData: {}, // to store configuration data
        mapDivID: "webMapListMapDiv", // id of div in which web-map is created
        webMapDescriptionFields: {}, // to store fields that needs to be display in web-map description
        lastSelectedWebMapExtent: null, // to store last extent of web-map that was selected
        lastSelectedWebMapItemInfo: null, // to store item info of web-map that was last selected
        changeExtentOnLayerChange: null, // whether to change extent on click of operational layer
        _layersToRemove: {}, //object of arrays for each webmap item having list of operational id's which are not valid.

        /**
        * This function is called when widget is constructed.
        * @param{object} options to be mixed
        * @param{object} source reference node
        * @memberOf widgets/webmap-list/webmap-list
        */
        constructor: function (options, srcRefNode) {
            lang.mixin(this, options);
        },

        /**
        * This function is called on startup of widget.
        * @memberOf widgets/webmap-list/webmap-list
        */
        startup: function () {
            try {
                this._createFilteredWebMapArr();
            } catch (err) {
                dojo.applicationUtils.showError(err.message);
            }
        },

        /**
        * This function is used when there is no web map to display
        * @memberOf widgets/webmap-list/webmap-list
        */
        noMapsFound: function () {
            return true;
        },

        /**
        * This function is used to return selected operational layer
        * @param{object} details of operational layer selected
        * @memberOf widgets/webmap-list/webmap-list
        */
        onOperationalLayerSelected: function (details) {
            return details;
        },

        /**
        * This function is used to create web-map array that needs to be displayed in list
        * @memberOf widgets/webmap-list/webmap-list
        */
        _createFilteredWebMapArr: function () {
            try {
                var i, itemInfo, requestArray = [],
                    dl, results = this.configData.groupItems.results;
                for (i = 0; i < results.length; i++) {
                    itemInfo = results[i];
                    // Set the itemInfo config option. This can be used when calling createMap instead of the webmap id
                    if (itemInfo.type === "Web Map") {
                        requestArray.push(this._createMap(itemInfo.id, "webMapListMapDiv"));
                    }
                }
                dl = new DeferredList(requestArray);
                dl.then(lang.hitch(this, function (response) {
                    this._filterWebMaps(response);
                    // if atleast 1 web-map is available than display it
                    if (this.filteredWebMapResponseArr.length > 0) {
                        this._createMap(this.filteredWebMapResponseArr[0][1].itemInfo.item.id, this.mapDivID).then(lang.hitch(this, function (response) {
                            this.lastSelectedWebMapExtent = response.map.extent;
                            this.lastSelectedWebMapItemInfo = response.itemInfo;
                            this._createWebMapListUI();
                        }));
                    } else {
                        // display message if no web-map is available to display
                        this.noMapsFound();
                    }
                }));
            } catch (err) {
                dojo.applicationUtils.showError(err.message);
            }
        },

        /**
        * This function is used to create map
        * @param{string} web-map ID
        * @param{string} map container ID
        * @memberOf widgets/webmap-list/webmap-list
        */
        _createMap: function (webMapID, mapDivID) {
            try {
                if (this.map) {
                    this.map.destroy();
                }
                domConstruct.empty(mapDivID);
                //var webMapInstance = BootstrapMap.createWebMap(webMapID, mapDivID, {
                 
                //Suzy's webmap
                //var webMapInstance = BootstrapMap.createWebMap("1fa4773a9d864d799dd8a126f5ac64dc", mapDivID, {
                     
                    //xiongjiu's test
                   // var webMapInstance = BootstrapMap.createWebMap("a2209a4a7d6d42b3ba557426e7276866", mapDivID, {
                //
                webMapID = this.configData.webid;
                var webMapInstance = BootstrapMap.createWebMap(webMapID, mapDivID, {
                //var webMapInstance = BootstrapMap.createWebMap("209c28e33e8741f48da4bd8850d2e7f5", mapDivID, {
                    ignorePopups: true,
                    editable: false,
                    bingMapsKey: this.configData.bingKey,
                    scrollWheelZoom: true
                });
                webMapInstance.then(lang.hitch(this, function (response) {
                    this.map = response.map;
                    this.onMapLoaded(response.map);
                }));
                return webMapInstance;
            } catch (err) {
                dojo.applicationUtils.showError(err.message);
            }
        },

        /**
        * This function is used to indicate that map is loaded
        * @param{object} response of web-map created
        */
        onMapLoaded: function (webmapResponse) {
            return;
        },

        /**
        * This function is used to validate web map.
        * @param{object} response of web-map created
        * @memberOf widgets/webmap-list/webmap-list
        */
        _filterWebMaps: function (response) {
            try {
                var i, showWebmapInList, j, removeLayerFromList, operationalLayerCount;
                for (i = 0; i < response.length; i++) {
                    // check if webmap has any operational layer if not then dont show that webmap in list
                    if (response[i][0] && response[i][1].itemInfo.itemData.operationalLayers.length > 0) {
                        showWebmapInList = false;
                        operationalLayerCount = response[i][1].itemInfo.itemData.operationalLayers.length;
                        // this loop will check if the layer is having valid capabilities and popinfo
                        // if not then it will remove that layer from array
                        for (j = 0; j < operationalLayerCount; j++) {
                            removeLayerFromList = true;
                            if (response[i][1].itemInfo.itemData.operationalLayers[j].visibility && response[i][1].itemInfo.itemData.operationalLayers[j].resourceInfo && response[i][1].itemInfo.itemData.operationalLayers[j].layerObject) {
                                // check if layer is having valid capabilities and valid popupinfo
                                if (this._validateLayerCapabilities(response[i][1].itemInfo.itemData.operationalLayers[j].resourceInfo.capabilities)) {
                                    if (this._validatePopupFields(response[i][1].itemInfo.itemData.operationalLayers[j].popupInfo, response[i][1].itemInfo.itemData.operationalLayers[j].layerObject.fields)) {
                                        showWebmapInList = true;
                                        removeLayerFromList = false;
                                    }
                                }
                            }
                            // if layer is not valid remove it from array
                            if (removeLayerFromList) {

                                if (!this._layersToRemove[response[i][1].itemInfo.item.id]) {
                                    this._layersToRemove[response[i][1].itemInfo.item.id] = [];
                                }
                                this._layersToRemove[response[i][1].itemInfo.item.id].push(response[i][1].itemInfo.itemData.operationalLayers[j].id);
                                response[i][1].itemInfo.itemData.operationalLayers.splice(j, 1);
                                operationalLayerCount = response[i][1].itemInfo.itemData.operationalLayers.length;
                                j--;
                            }
                        }
                        // if not then dont show that layer in webmaplist
                        if (showWebmapInList) {
                            this.filteredWebMapResponseArr.push(response[i]);
                        }
                        //If their are any auto refreshed layer on the map browser will send request for those layers although that layer may not be selected on main map.
                        //destroy the map instance once all the operation is completed.
                        response[i][1].map.destroy();
                    }
                }
            } catch (err) {
                dojo.applicationUtils.showError(err.message);
            }
        },

        /**
        * This function is used to create description info.
        * @param{object} web map item
        * @memberOf widgets/webmap-list/webmap-list
        */
        _createWebMapDescription: function (webMapItem) {
            var descriptionInfo = "",
                field,
                value = "";
            for (field in this.webMapDescriptionFields) {
                if (this.webMapDescriptionFields.hasOwnProperty(field)) {
                    if (this.webMapDescriptionFields[field]) {
                        // to display date field
                        if (field === "created" || field === "modified") {
                            value = webMapItem.itemInfo.item[field] ? ((moment(webMapItem.itemInfo.item[field]).toDate()).toLocaleDateString()) : this.configData.showNullValueAs + "<br/>";
                            if (lang.trim(value) === "") {
                                value = this.configData.showNullValueAs + "<br/>";
                            }
                        } else {
                            value = webMapItem.itemInfo.item[field] || this.configData.showNullValueAs + "<br/>";
                        }
                        descriptionInfo += "<div class='esriCTDetailsContainerRow'><div class='esriCTDetailsContainerCell'><div class='esriCTInfoHeader'>" + this.configData.i18n.webMapList[field] + "</div><div class='esriCTInfoDetails'>" + value + "</div></div></div>";
                    }
                }
            }
            return descriptionInfo;
        },

        /**
        * This function is used to highlight selected web map
        * @param{string} selected web map ID
        * @memberOf widgets/webmap-list/webmap-list
        */
        _selectWebMapItem: function (selectedWebMapID) {
            if ($('div[webMapID="' + this.lastWebMapSelected + '"]').length > 0) {
                domClass.replace($('div[webMapID="' + this.lastWebMapSelected + '"]')[0], "esriCTWebMapBorder", "esriCTBorder");
            }
            if ($('div[webMapID="' + selectedWebMapID + '"]').length > 0) {
                domClass.replace($('div[webMapID="' + selectedWebMapID + '"]')[0], "esriCTBorder", "esriCTWebMapBorder");
            }
            this.lastWebMapSelected = selectedWebMapID;
        },

        /**
        * This function is used to create UI for web map list.
        * @memberOf widgets/webmap-list/webmap-list
        */
        _createWebMapListUI: function () {
            try {
                var parentDiv, i, templateString, thumbnailSrc = "",
                    tokenString,
                    infoDescription = "",
                    editCapabilityLayerCount,
                    obj;
                for (i = 0; i < this.filteredWebMapResponseArr.length; i++) {
                    editCapabilityLayerCount = this.filteredWebMapResponseArr[i][1].itemInfo.itemData.operationalLayers.length;
                    // set token for private groups to fetch thumbnail
                    // first check if web-map thumbnail is available than display it
                    // second check if web-map thumbnail is configured than display it
                    // third if none of above scenario is valid than display fallback icon
                    if (this.filteredWebMapResponseArr[i][1].itemInfo.item.thumbnail) {
                        tokenString = "";
                        if (this.configData.logInDetails.token) {
                            tokenString = "?token=" + this.configData.logInDetails.token;
                        }
                        thumbnailSrc = this.configData.sharinghost + "/sharing/rest/content/items/" + this.filteredWebMapResponseArr[i][1].itemInfo.item.id + "/info/" + this.filteredWebMapResponseArr[i][1].itemInfo.item.thumbnail + tokenString;
                    } else {
                        if (this.configData.noThumbnailIcon && lang.trim(this.configData.noThumbnailIcon).length !== 0) {
                            if (this.configData.noThumbnailIcon.indexOf("http") === 0) {
                                thumbnailSrc = this.configData.noThumbnailIcon;
                            } else {
                                if (this.configData.noThumbnailIcon.indexOf("/") === 0) {
                                    thumbnailSrc = dojoConfig.baseURL + this.configData.noThumbnailIcon;
                                } else {
                                    thumbnailSrc = dojoConfig.baseURL + "/" + this.configData.noThumbnailIcon;
                                }
                            }
                        } else {
                            thumbnailSrc = dojoConfig.baseURL + "/images/no-thumbnail.png";
                        }
                    }
                    infoDescription = this._createWebMapDescription(this.filteredWebMapResponseArr[i][1]);
                    templateString = string.substitute(webMapItemTemplate, {
                        WebmapThumbnail: thumbnailSrc,
                        WebmapTitle: this.filteredWebMapResponseArr[i][1].itemInfo.item.title,
                        InfoDescription: infoDescription
                    });
                    // to display web-map icon which is aligned right & left
                    if (i % 2 !== 0) {
                        if (domConstruct.toDom(templateString).childNodes.length > 2) {
                            parentDiv = domConstruct.toDom(templateString).childNodes[2];
                        } else {
                            parentDiv = domConstruct.toDom(templateString).childNodes[1];
                        }
                    } else {
                        parentDiv = domConstruct.toDom(templateString).childNodes[0];
                    }
                    $(parentDiv).addClass("esriCTDisplayWebMapTemplate esriCTWebMapBorder");
                    domAttr.set(parentDiv, "webMapID", this.filteredWebMapResponseArr[i][1].itemInfo.item.id);
                    if (query('.esriCTInfoImg', parentDiv).length > 0) {
                        domAttr.set(query('.esriCTInfoImg', parentDiv)[0], "title", dojo.configData.i18n.webMapList.infoBtnToolTip);
                    }
                    if ((this.filteredWebMapResponseArr[i][1].itemInfo.itemData.operationalLayers.length > 1) && (editCapabilityLayerCount > 1)) {
                        domAttr.set(parentDiv, "displayOperationalLayerList", true);
                        this._handleWebMapClick(parentDiv, null);
                    } else {
                        domAttr.set(parentDiv, "displayOperationalLayerList", false);
                        domAttr.set(parentDiv, "operationalLayerID", this.filteredWebMapResponseArr[i][1].itemInfo.itemData.operationalLayers[0].id);
                        this._handleWebMapClick(parentDiv, this.filteredWebMapResponseArr[i][1].itemInfo.itemData.operationalLayers[0]);
                    }
                    this.esriCTWebMapListParentDiv.appendChild(parentDiv);
                    this._attachInformationClick(infoDescription, parentDiv);
                    if ((this.filteredWebMapResponseArr[i][1].itemInfo.itemData.operationalLayers.length > 1) && (editCapabilityLayerCount > 1)) {
                        this._sortOperationalLayer(i);
                        this._createOperationalLayerList(query('.esriCTLayerList', parentDiv)[0], this.filteredWebMapResponseArr[i][1], i);
                    }
                }
                // by default load first webmap and its first layer
                if (this.filteredWebMapResponseArr.length > 0) {
                    obj = {
                        "webMapId": this.filteredWebMapResponseArr[0][1].itemInfo.item.id,
                        "operationalLayerId": this.filteredWebMapResponseArr[0][1].itemInfo.itemData.operationalLayers[0].id,
                        "operationalLayerDetails": this.filteredWebMapResponseArr[0][1].itemInfo.itemData.operationalLayers[0],
                        "itemInfo": this.filteredWebMapResponseArr[0][1].itemInfo
                    };
                    this._displaySelectedOperationalLayer(obj);
                    // by default select first webmap in list
                    this._selectWebMapItem(this.filteredWebMapResponseArr[0][1].itemInfo.item.id);
                }
            } catch (err) {
                dojo.applicationUtils.showError(err.message);
            }
        },

        /**
        * This function is used to hide layer
        * @param{string} web-map ID
        * @param{string} operational layer ID
        * @param{object} operational layer details
        * @memberOf widgets/webmap-list/webmap-list
        */
        _displaySelectedOperationalLayer: function (obj) {
            try {
                var layer, featureLayer, i;
                if (this.map) {
                    for (layer in this.map._layers) {
                        if (this.map._layers.hasOwnProperty(layer)) {
                            if (this.map._layers[layer].type) {
                                // only show feature layer that is selected by user
                                // and hide rest of layers
                                if (this.map._layers[layer].type === "Feature Layer") {
                                    if (this.map._layers[layer].id !== obj.operationalLayerId) {
                                        //modified by Xiongjiu Liao 3/11/2015 to display other layers
                                        //this.map._layers[layer].hide();
                                    } else {
                                        this.map._layers[layer].show();
                                        this.map.getLayer(obj.operationalLayerId).refresh();
                                        featureLayer = new FeatureLayer(this.map._layers[layer].url);
                                        this._onFeatureLayerLoad(featureLayer, obj.webMapId, obj.operationalLayerId, obj.operationalLayerDetails, obj.itemInfo);
                                    }
                                }
                            }
                        }
                    }
                    //Remove Invalid Layers from map
                    if (this._layersToRemove[obj.webMapId]) {
                        for (i = 0; i < this._layersToRemove[obj.webMapId].length; i++) {
                            if (this.map._layers.hasOwnProperty(this._layersToRemove[obj.webMapId][i])) {
                                //modified by Xiongjiu Liao 3/11/2015 to display other layers
                                //  this.map.removeLayer(this.map._layers[this._layersToRemove[obj.webMapId][i]]);
                            }
                        }
                    }
                } else {
                    dojo.applicationUtils.hideLoadingIndicator();
                }
            } catch (err) {
                dojo.applicationUtils.showError(err.message);
            }
        },

        /**
        * This function is used to highlight(change font to bold) the selected webmap item and selected layer
        * @param{string} web map ID
        * @param{string} operational layer ID
        * @memberOf widgets/webmap-list/webmap-list
        */
        _highlightSelectedItem: function (webMapID, layerID) {
            //Remove Selected class from previously selected WebMap and Layer
            query(".esriCTSelectedItem").removeClass("esriCTSelectedItem");
            //Add Selected Class to WebMap Item
            query(".esriCTMediaBody", $('div[webMapID="' + webMapID + '"]', this.domNode)[0]).addClass("esriCTSelectedItem");
            //Add Selected Class to Layer in that webmap only if exist
            if ($('div[operationalLayerID="' + layerID + '"]', $('div[webMapID="' + webMapID + '"]', this.domNode)[0]).length > 0) {
                domClass.add($('div[operationalLayerID="' + layerID + '"]', $('div[webMapID="' + webMapID + '"]', this.domNode)[0])[0], "esriCTSelectedItem");
            }
        },

        /**
        * This function is used to process execution on load of feature layer
        * @param{object} feature layer to attach on-load event
        * @param{string} web map ID
        * @param{string} operational layer ID
        * @param{object} operational layer details
        * @param{object} web-map item info
        * @memberOf widgets/webmap-list/webmap-list
        */
        _onFeatureLayerLoad: function (featureLayer, webMapID, layerID, layerDetails, itemInfo) {
            try {
                if (!featureLayer.loaded) {
                    on(featureLayer, "load", lang.hitch(this, function () {
                        this._featureLayerLoaded(webMapID, layerID, layerDetails, itemInfo);
                    }));
                } else {
                    this._featureLayerLoaded(webMapID, layerID, layerDetails, itemInfo);
                }
                on(featureLayer, "error", lang.hitch(this, function (evt) {
                    dojo.applicationUtils.showError(evt.error.message);
                }));
            } catch (err) {
                dojo.applicationUtils.showError(err.message);
            }
        },

        /**
        * This function is used to process execution after the feature layer is loaded
        * @param{string} web map ID
        * @param{string} operational layer ID
        * @param{object} operational layer details
        * @param{object} web-map item info
        * @memberOf widgets/webmap-list/webmap-list
        */
        _featureLayerLoaded: function (webMapID, layerID, layerDetails, itemInfo) {
            //Highlight the Selected Item in webmap list
            this._highlightSelectedItem(webMapID, layerID);
            setTimeout(lang.hitch(this, function () {
                this.onOperationalLayerSelected({
                    "map": this.map,
                    "webMapId": webMapID,
                    "operationalLayerId": layerID,
                    "operationalLayerDetails": layerDetails,
                    "itemInfo": itemInfo
                });
                dojo.applicationUtils.hideLoadingIndicator();
            }), 500);
        },

        /**
        * This function is used to handle web map click
        * @param{object} parent div container in which web-map list will be added
        * @param{object} details of operational layer
        * @memberOf widgets/webmap-list/webmap-list
        */
        _handleWebMapClick: function (parentDiv, operationalLayerDetails) {
            try {
                dojo.applicationUtils.showLoadingIndicator();
                on($(".esriCTMediaBody", parentDiv)[0], "click", lang.hitch(this, function (evt) {
                    this._handleWebmapToggling(parentDiv, operationalLayerDetails);
                }));
                on($(".esriCTWebMapImg", parentDiv)[0], "click", lang.hitch(this, function (evt) {
                    this._handleWebmapToggling(parentDiv, operationalLayerDetails);
                }));
            } catch (err) {
                dojo.applicationUtils.showError(err.message);
            }
        },

        /**
        * This function is used to handle web map Toggling
        * @param{object} parent div container in which web-map list will be added
        * @param{object} details of operational layer
        * @memberOf widgets/webmap-list/webmap-list
        */
        _handleWebmapToggling: function (node, operationalLayerDetails) {
            var webMapId, selectedWebMapList, operationalLayerId, descriptionDiv;
            dojo.applicationUtils.showLoadingIndicator();
            webMapId = domAttr.get(node, "webMapID");
            // to display operational layer list if web-map contains more than 1 layer
            if (domAttr.get(node, "displayOperationalLayerList") === true) {
                selectedWebMapList = dom.byId(webMapId);
                // if operational layer list is visible than hide it
                // & if it is hidden than display it
                if (domClass.contains(selectedWebMapList, "esriCTDisplayList")) {
                    $("#" + webMapId).slideUp({
                        duration: 500,
                        easing: "linear"
                    });
                    setTimeout(lang.hitch(this, function () {
                        domClass.replace(selectedWebMapList, "esriCTHidden", "esriCTDisplayList");
                    }), 500);

                } else {
                    descriptionDiv = query('.esriCTDescription', selectedWebMapList.parentElement.parentElement)[0];
                    if (descriptionDiv) {
                        $('.esriCTDescription', selectedWebMapList.parentElement.parentElement).slideUp(0);
                        domClass.replace(descriptionDiv, "esriCTHidden", "esriCTDisplayList");
                    }
                    $("#" + webMapId).slideDown({
                        duration: 500,
                        easing: "linear"
                    });
                    setTimeout(lang.hitch(this, function () {
                        domClass.replace(selectedWebMapList, "esriCTDisplayList", "esriCTHidden");
                    }), 500);

                }
                dojo.applicationUtils.hideLoadingIndicator();
            } else {
                if (this.lastWebMapSelected !== webMapId) {
                    this.setDefaultHeightOfContainers();
                    this._selectWebMapItem(webMapId);
                    operationalLayerId = domAttr.get(node, "operationalLayerID");
                    this._createMap(webMapId, this.mapDivID).then(lang.hitch(this, function (evt) {
                        this.lastSelectedWebMapExtent = evt.map.extent;
                        var obj = {
                            "webMapId": webMapId,
                            "operationalLayerId": operationalLayerId,
                            "operationalLayerDetails": operationalLayerDetails,
                            "itemInfo": evt.itemInfo
                        };
                        this._displaySelectedOperationalLayer(obj);
                    }));
                } else {
                    this.onSelectedWebMapClicked(webMapId);
                    dojo.applicationUtils.hideLoadingIndicator();
                }
            }
        },

        /**
        * This function is used to generate event on all-ready selected webmap clicked
        * @memberOf widgets/webmap-list/webmap-list
        */
        onSelectedWebMapClicked: function (webMapId) {
            return webMapId;
        },

        /**
        * This function is used to sort operational layer according to name
        * @param{int} index where concerned operational layer resides
        * @memberOf widgets/webmap-list/webmap-list
        */
        _sortOperationalLayer: function (index) {
            try {
                this.filteredWebMapResponseArr[index][1].itemInfo.itemData.operationalLayers.sort(function (a, b) {
                    var titleA = a.title.toLowerCase(),
                        titleB = b.title.toLowerCase();
                    if (titleA < titleB) {
                        return -1;
                    }
                    if (titleA > titleB) {
                        return 1;
                    }
                    return 0;
                });
            } catch (err) {
                dojo.applicationUtils.showError(err.message);
            }
        },

        /**
        * This function is used to add operational layer in list
        * @param{object} parent container in which operational layer list will be added
        * @param{object} details of web map
        * @memberOf widgets/webmap-list/webmap-list
        */
        _createOperationalLayerList: function (parentContainer, webMap, index) {
            try {
                var i, parentListNode, childListNode, operationalLayerString;
                parentListNode = domConstruct.create("div", {
                    "class": "esriCTHidden  esriCTMediaBorder",
                    "id": webMap.itemInfo.item.id
                });
                // to create operational layer list
                for (i = 0; i < webMap.itemInfo.itemData.operationalLayers.length; i++) {
                    operationalLayerString = string.substitute(operationalLayerTemplate, {
                        OperationalLayerTitle: webMap.itemInfo.itemData.operationalLayers[i].title
                    });
                    childListNode = domConstruct.toDom(operationalLayerString);
                    domAttr.set(childListNode, "webMapID", webMap.itemInfo.item.id);
                    domAttr.set(childListNode, "operationalLayerID", webMap.itemInfo.itemData.operationalLayers[i].id);
                    this._handleOperationalLayerClick(childListNode, webMap.itemInfo.itemData.operationalLayers[i]);
                    parentListNode.appendChild(childListNode);
                }
                // stop event propogation so that no other event gets executed
                on(parentListNode, "click", lang.hitch(this, function (evt) {
                    event.stop(evt);
                }));
                parentContainer.appendChild(parentListNode);
            } catch (err) {
                dojo.applicationUtils.showError(err.message);
            }
        },

        /**
        * This function is used to handle operational layer click.
        * @param{object} operational layer node
        * @param{object} operational layer details
        * @memberOf widgets/webmap-list/webmap-list
        */
        _handleOperationalLayerClick: function (childListNode, operationalLayerDetails) {
            try {
                var operationalLayerId;
                on(childListNode, "click", lang.hitch(this, function (evt) {
                    var webMapId, obj;
                    event.stop(evt);
                    dojo.applicationUtils.showLoadingIndicator();
                    webMapId = domAttr.get(evt.currentTarget, "webMapID");
                    operationalLayerId = domAttr.get(evt.currentTarget, "operationalLayerID");
                    // if other layer of same web-map is clicked than just display it
                    // & if other layer of other web-map is clicked than do create map
                    if (this.lastWebMapSelected !== webMapId) {
                        this.setDefaultHeightOfContainers();
                        this._selectWebMapItem(webMapId);
                        this._createMap(webMapId, this.mapDivID).then(lang.hitch(this, function (response) {
                            this.lastSelectedWebMapExtent = response.map.extent;
                            this.lastSelectedWebMapItemInfo = response.itemInfo;
                            obj = {
                                "webMapId": webMapId,
                                "operationalLayerId": operationalLayerId,
                                "operationalLayerDetails": operationalLayerDetails,
                                "itemInfo": response.itemInfo
                            };
                            this._displaySelectedOperationalLayer(obj);
                        }));
                    } else {
                        obj = {
                            "webMapId": webMapId,
                            "operationalLayerId": operationalLayerId,
                            "operationalLayerDetails": operationalLayerDetails,
                            "itemInfo": this.lastSelectedWebMapItemInfo
                        };
                        this._displaySelectedOperationalLayer(obj);
                        if (this.changeExtentOnLayerChange) {
                            this.map.setExtent(this.lastSelectedWebMapExtent);
                        }
                    }
                }));
            } catch (err) {
                dojo.applicationUtils.showError(err.message);
            }
        },

        /**
        * This function is used to set default height of upper and lower container
        * @memberOf widgets/webmap-list/webmap-list
        */
        setDefaultHeightOfContainers: function () {
            return;
        },

        /**
        * This function is used to handle information click
        * @param{object} information of web map
        * @param{object} web-map item div container
        * @memberOf widgets/webmap-list/webmap-list
        */
        _attachInformationClick: function (information, parentDiv) {
            var infoIcon, descriptionDiv, webMapId, layerList;
            infoIcon = query('.esriCTInfoImg', parentDiv)[0];
            if (lang.trim(information).length !== 0 && infoIcon) {
                on(infoIcon, "click", function (evt) {
                    event.stop(evt);
                    descriptionDiv = query('.esriCTDescription', this.parentElement.parentElement)[0];
                    webMapId = domAttr.get(this.parentElement.parentElement, "webMapID");
                    layerList = dom.byId(webMapId);
                    // if description div is hidden than display it &
                    // if it is visible than hide it
                    if (domClass.contains(descriptionDiv, "esriCTHidden")) {
                        if (layerList) {
                            $("#" + webMapId).slideUp(0);
                            domClass.replace(layerList, "esriCTHidden", "esriCTDisplayList");
                        }
                        $('.esriCTDescription', this.parentElement.parentElement).slideDown({
                            duration: 500,
                            easing: "linear"
                        });
                        setTimeout(lang.hitch(this, function () {
                            domClass.replace(descriptionDiv, "esriCTDisplayList", "esriCTHidden");
                        }), 500);
                    } else {
                        $('.esriCTDescription', this.parentElement.parentElement).slideUp({
                            duration: 500,
                            easing: "linear"
                        });
                        setTimeout(lang.hitch(this, function () {
                            domClass.replace(descriptionDiv, "esriCTHidden", "esriCTDisplayList");
                        }), 500);
                    }
                });
            } else {
                if (infoIcon) {
                    domClass.replace(infoIcon, "esriCTHidden");
                }
            }
        },

        /**
        * This function is used to validate the capabalites of the layer
        * @param{object} capabilities of layer
        * @memberOf widgets/webmap-list/webmap-list
        */
        _validateLayerCapabilities: function (layerCapabilities) {
            // if layer has capability of create & update than return true
            if (layerCapabilities && layerCapabilities.indexOf("Create") > -1 && layerCapabilities.indexOf("Update") > -1) {
                return true;
            }
            // if layer has capability of create & editing than return true
            if (layerCapabilities && layerCapabilities.indexOf("Create") > -1 && layerCapabilities.indexOf("Editing") > -1) {
                return true;
            }
            return false;
        },

        /**
        * This function is used to validate popup fields
        * @param{object} pop-up info
        * @param{object} layer fields
        * @memberOf widgets/webmap-list/webmap-list
        */
        _validatePopupFields: function (popupInfo, fields) {
            try {
                var i, j;
                // check if popup-info is available if not then return false
                if (popupInfo) {
                    for (i = 0; i < popupInfo.fieldInfos.length; i++) {
                        for (j = 0; j < fields.length; j++) {
                            if (popupInfo.fieldInfos[i].fieldName === fields[j].name) {
                                // check if field is Editable
                                if (popupInfo.fieldInfos[i].isEditable) {
                                    return true;
                                }
                            }
                        }
                    }
                }
                return false;
            } catch (err) {
                dojo.applicationUtils.showError(err.message);
            }
        }
    });
});