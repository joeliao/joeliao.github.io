/*global define,dojo,alert,document */
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
    "dojo/dom",
    "dojo/_base/fx",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-attr",
    "dojo/on",
    "dojo/query",
    "esri/dijit/LocateButton",
     "esri/symbols/PictureMarkerSymbol",
     "esri/SpatialReference",
     "esri/geometry/Point",
      "esri/graphic"
], function (
    dom,
    coreFx,
    lang,
    domConstruct,
    domGeometry,
    domClass,
    domAttr,
    on,
    query,
    LocateButton,
    PictureMarkerSymbol,
    Graphic,
    SpatialReference,
    Point
) {
    return {
        showLoadingIndicator: function () {
            domClass.add(document.body, "app-loading");
        },

        hideLoadingIndicator: function () {
            domClass.remove(document.body, "app-loading");
        },

        showError: function (error) {
            alert(error);
        },

        showMessage: function (msg) {
            alert(msg);
        },

        showErrorScreen: function (message) {
            domClass.add(dom.byId("layoutContainer"), "esriCTHidden");
            domClass.remove(dom.byId("esriCTNoWebMapParentDiv"), "esriCTHidden");
            domAttr.set(dom.byId("esriCTNoWebMapChildDiv"), "innerHTML", message);
        },

        /**
        * This function is used to convert ArcGIS date format constants to readable date formats
        * @memberOf utils/utils
        */
        getDateFormat: function (type) {
            var obj = {};
            switch (type) {
            case "shortDate":
                obj.dateFormat = "MM/DD/YYYY";
                obj.showTime = false;
                return obj;
            case "shortDateLE":
                obj.dateFormat = "DD/MM/YYYY";
                obj.showTime = false;
                return obj;
            case "longMonthDayYear":
                obj.dateFormat = "MMMM DD, YYYY";
                obj.showTime = false;
                return obj;
            case "dayShortMonthYear":
                obj.dateFormat = "DD MMM YYYY";
                obj.showTime = false;
                return obj;
            case "longDate":
                obj.dateFormat = "dddd, MMMM DD, YYYY";
                obj.showTime = false;
                return obj;
            case "shortDateLongTime":
                obj.dateFormat = "MM/DD/YYYY h:mm:ss a";
                obj.showTime = true;
                return obj;
            case "shortDateLELongTime":
                obj.dateFormat = "DD/MM/YYYY h:mm:ss a";
                obj.showTime = true;
                return obj;
            case "shortDateShortTime":
                obj.dateFormat = "DD/MM/YYYY h:mm a";
                obj.showTime = true;
                return obj;
            case "shortDateLEShortTime":
                obj.dateFormat = "MM/DD/YYYY h:mm a";
                obj.showTime = true;
                return obj;
            case "shortDateShortTime24":
                obj.dateFormat = "MM/DD/YYYY HH:mm";
                obj.showTime = true;
                return obj;
            case "shortDateLEShortTime24":
                obj.dateFormat = "MM/DD/YYYY HH:mm";
                obj.showTime = true;
                return obj;
            case "longMonthYear":
                obj.dateFormat = "MMMM YYYY";
                obj.showTime = false;
                return obj;
            case "shortMonthYear":
                obj.dateFormat = "MMM YYYY";
                obj.showTime = false;
                return obj;
            case "year":
                obj.dateFormat = "YYYY";
                obj.showTime = false;
                return obj;
            default:
                obj.dateFormat = "MMMM DD, YYYY";
                obj.showTime = false;
                return obj;
            }
        },

        /**
        * This function is used to convert number to thousand separator
        * @memberOf utils/utils
        */
        convertNumberToThousandSeperator: function (number) {
            return number.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        },

        /**
        * Create geolocation button on the map
        * @memberOf utils/utils
        */
        createGeoLocationButton: function (basemapLayers, map, mapId, addGraphic) {
            var currentLocation, createLocationDiv;
            // create geolocation div
            createLocationDiv = domConstruct.create("div", { "class": "esriCTBGColor esriCTLocationButton" });
            domConstruct.place(createLocationDiv, query(".esriSimpleSliderDecrementButton", mapId)[0], "after");
            domAttr.set(createLocationDiv, "title", dojo.configData.i18n.map.geolocationTooltip);
            // initialize object of locate button
            currentLocation = new LocateButton({
                map: map,
                highlightLocation: false,
                setScale: false,
                scale: 15,
                useTracking:false,
                centerAt: true,
                symbol: new PictureMarkerSymbol('images/blue-dot.png', 21, 21)
            }, domConstruct.create('div'));
            currentLocation.startup();
            // handle click event of geolocate button
            on(createLocationDiv, 'click', lang.hitch(this, function (evt) {
                // trigger locate method of locate button widget
                //console.log(currentLocation);

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(zoomToLocation, locationError);
                }

                function zoomToLocation(location) {
                    //console.log(location);
                    var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(location.coords.longitude, location.coords.latitude));
                    if (typeof map.locicon == "undefined") map.locicon = null;
                    if (!map.locicon) {
                        var symbol = new esri.symbol.PictureMarkerSymbol('images/blue-dot.png', 40, 40);
                        map.locicon = new esri.Graphic(pt, symbol);
                        map.graphics.add(map.locicon);
                    }
                    else { //move the graphic if it already exists
                        map.locicon.setGeometry(pt);
                    }

                    map.centerAndZoom(pt, 16);
                }

                function locationError(error) {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            alert("Location not provided");
                            break;

                        case error.POSITION_UNAVAILABLE:
                            alert("Current location not available");
                            break;

                        case error.TIMEOUT:
                            alert("Timeout");
                            break;

                        default:
                            alert("unknown error");
                            break;
                    }

                }

                //currentLocation.locate();
            }));
            // event on locate
            on(currentLocation, "locate", lang.hitch(this, function (evt) {
                this.onGeolocationComplete(evt, addGraphic);
            }));
        },

        /**
        * Fetch the basemap extent
        * @memberOf utils/utils
        */
        getBasemapExtent: function (baseMapLayers) {
            var basemapExtent, i;
            /* If map contains a single basemap layer, consider full extent of that basemap
            If map contains multiple basemap layers, union the full extent of all the basemaps */
            for (i = 0; i < baseMapLayers.length; i++) {
                if (i === 0) {
                    basemapExtent = baseMapLayers[i].layerObject.fullExtent;
                } else {
                    basemapExtent = basemapExtent.union(baseMapLayers[i].layerObject.fullExtent);
                }
            }
            return basemapExtent;
        },

        /**
        * Invoked when geolocation is complete
        * @memberOf utils/utils
        */
        onGeolocationComplete: function (event, addGraphic) {
            return event;
        }
    };
});