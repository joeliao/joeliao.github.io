/*global define,location */
/*jslint sloppy:true */
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
define({
    //Default configuration settings for the application. This is where you'll define things like a bing maps key,
    //default group, default app color theme and more. These values can be overwritten by template configuration settings and url parameters.
    "appid": "",
    "webid": "1fa4773a9d864d799dd8a126f5ac64dc",
    "oauthappid": null,
    //Group templates must support a group url parameter. This will contain the id of the group.
    "group": "5b6a8c1b6502480cb5a952a22b997ea7",
    //Enter the url to the proxy if needed by the application
    "proxyurl": "DotNet/proxy.ashx",
    //Example of a template specific property. If your template had several color schemes
    //you could define the default here and setup configuration settings to allow users to choose a different
    //color theme.
    "theme": "#1D8E05",
    "bingKey": "", //Enter the url to your organizations bing maps key if you want to use bing basemaps
    //Defaults to arcgis.com. Set this value to your portal or organization host name.
    "sharinghost": location.protocol + "//" + "seattlecitygis.maps.arcgis.com/",
    //HelperServices url
    "helperServices": {
        "geometry": {
            "url": null
        },
        "geocode": [{
            "url": null
        }]
    },

    "applicationName": "Rainier Valley North-South Neighborhood Greenway",
    "applicationIcon": "/images/app-logo.jpg",
    "applicationFavicon": "/images/favicons.ico",

    "signInSubtitle": "",
    "signInBackgroundImage": "/images/signinbg.png",

    "enableFacebook": false,
    "enableTwitter": false,
    "enableGoogleplus": false,

    "facebookAppId": "",

    "twitterSigninUrl": location.protocol + "//utility.arcgis.com/tproxy/signin",
    "twitterUserUrl": location.protocol + "//utility.arcgis.com/tproxy/proxy/1.1/account/verify_credentials.json?q=&include_entities=true&skip_status=true&locale=en",
    "twitterCallbackUrl": "/oauth-callback-twitter.html",

    "googleplusClientId": "",
    "googleplusScope": "",

    "showNullValueAs": "",
    "noThumbnailIcon": "/images/no-thumbnail.png",
    "noAttachmentIcon": "/images/no-attachment.png",

    "webMapInfoDescription": true,
    "webMapInfoSnippet": false,
    "webMapInfoOwner": true,
    "webMapInfoCreated": false,
    "webMapInfoModified": false,
    "webMapInfoLicenseInfo": false,
    "webMapInfoAccessInformation": false,
    "webMapInfoTags": false,
    "webMapInfoNumViews": false,
    "webMapInfoAvgRating": false,

    "submitMessage": "Thank you! Your input has been submitted.",
    "likeField": "VOTE",
    "commentField": "COMMENT",
    "reportedByField": "USERID",

    "zoomLevel": 12,
    "enableUSNGSearch": false,
    "enableMGRSSearch": false,
    "enableLatLongSearch": false
});
