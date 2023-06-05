define(['jquery', 'qlik', 'angular', 'ng!$q', 'css!./LinkShare.css'], function ($, qlik, angular, $q) {
    return {
        //define the properties panel looks like
        definition: {
            type: "items",
            component: "accordion",
            items: {
                exportSettings: {
                    type: "items",
                    label: "Export Settings",
                    items: {
                        outputMethod: {
                            ref: "outputMethod",
                            component: "radiobuttons",
                            type: "string",
                            label: "Output Method",
                            options: [
                                {
                                    value: "clipboard",
                                    label: "Copy To Clipboard Button"
                                },
                                //{value: "email",
                                // label: "Create New Email Button"},
                                {
                                    value: "textbox",
                                    label: "Copy From Textbox"
                                }

                            ],
                            defaultValue: "clipboard",
                        },
                        maxSelected: {
                            ref: "maxSelected",
                            type: "integer",
                            label: "Max Values Selected in One Field",
                            defaultValue: "1000",
                            min: 1
                        },
                        maxURLLength: {
                            ref: "maxURLLength",
                            type: "integer",
                            label: "Max URL Length in the shared Link",
                            defaultValue: "600",
                            min: 1
                        }
                    }
                },


                ButtonStyle: {
                    type: "items",
                    label: "Button Style",
                    items: {
                        buttonText: {
                            ref: "props.buttonText",
                            type: "string",
                            label: "Button Text",
                            defaultValue: "Button Text",
                        },
                        buttonFontColor: {
                            ref: "props.font_color",
                            type: "string",
                            label: "Font Color (Hex)",
                            defaultValue: "#FFFFF"
                        },
                        buttonFontSize: {
                            ref: "props.font_size",
                            type: "string",
                            label: "Font Size",
                            defaultValue: "25px"

                        },
                        buttonFontWeight: {
                            ref: "props.font_weight",
                            type: "string",
                            label: "Font Weight",
                            defaultValue: "bolder"
                        },
                        buttonBackground: {
                            ref: "props.buttonBackground_color",
                            type: "string",
                            label: "Button Color (Hex)",
                            defaultValue: "#008080"
                        },
                        borderColor: {
                            ref: "props.border_color",
                            type: "string",
                            label: "Border Color (Hex)",
                            defaultValue: "#008080"
                        },
                        borderStyle: {
                            ref: "props.border_style",
                            type: "string",
                            label: "Border Size / Style",
                            defaultValue: "1px solid #d9d9d9"
                        },
                        borderRadius: {
                            ref: "props.border_radius",
                            type: "string",
                            label: "Border Radius",
                            defaultValue: "4px"
                        },
                        buttonIconShow: {
                            ref: "props.iconShow",
                            type: "boolean",
                            label: "Show Icon?",
                            defaultValue: false
                        },
                        buttonIcon: {
                            ref: "props.icon",
                            type: "string",
                            label: "Leonardo UI Icon",
                            defaultValue: "lui-icon--share",
                            show: function (data) {
                                return data.props.iconShow
                            }
                        },
                        buttonIconSize: {
                            ref: "props.iconSize",
                            type: "string",
                            component: "dropdown",
                            label: "Leonardo UI Icon Size",
                            defaultValue: " ",
                            options: [{
                                value: "lui-icon--small",
                                label: "Small (12px)"
                            }, {
                                value: " ",
                                label: "Default (16px)"
                            }, {
                                value: "lui-icon--large",
                                label: "Large (20px)"
                            }],
                            show: function (data) {
                                return data.props.iconShow
                            }
                        }
                    }
                }
            }
        },

        paint: function ($element, layout, jquery) {
            var self = this;

            //Defining the separators used in GetCurrentSelections function call
            var recordSeparator = '&@#$^()';
            var tagSeparator = '::::';
            var valueSeparator = ';;;;';

            //For IE that doesn't recognize the "includes" function
            if (!String.prototype.includes) {
                String.prototype.includes = function (search, start) {
                    'use strict';
                    if (typeof start !== 'number') {
                        start = 0;
                    }

                    if (start + search.length > this.length) {
                        return false;
                    } else {
                        return this.indexOf(search, start) !== -1;
                    }
                };
            }

            //Obtaining the global object to use it for generating the first part of the App Integration API's URI (host/ip, app id, sheet id)
            var config = {
                host: window.location.hostname,
                prefix: window.location.pathname.substr(0, window.location.pathname.toLowerCase().lastIndexOf("/extensions") + 1),
                port: window.location.port,
                isSecure: window.location.protocol === "https:"
            };
            var global = qlik.getGlobal(config);



            //Getting the current application
            var app = qlik.currApp(this);
            var applicationId = app.model.layout.qFileName;


            if (applicationId.substring(applicationId.length - 4) == '.qvf') {
                applicationId = applicationId.slice(0, -4);
            }
            var applicationIdFr = encodeURIComponent(applicationId);

            //Getting the current sheet
            var CurrentSheet = qlik.navigation.getCurrentSheetId();
            var SheetID = CurrentSheet.sheetId;



            /*Creating base part of URL including clearing any leftover 
            selections before opening the new page with our selections*/
            var baseURL = (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + "/sense/app/" + applicationIdFr + "/sheet/" + SheetID + "/state/analysis/clearselections";


            //If the user chose to output the link through an email, only create a button, otherwise create a textbox as well
            // if (layout.outputMethod == "email") {
            //     var buttonHTMLCode = '<button name="' + "GenerateDashboardLink" + '" id="generateDashboardLink" class="dashboardLinkGenerator">' + "Email Link" + '</button>';
            //     $element.html(buttonHTMLCode);

            // }
            // else 
            if (layout.outputMethod == "clipboard") {
                var buttonHTMLCode = '<button name="' + "GenerateDashboardLink" + '" id="generateDashboardLink" class="dashboardLinkGenerator">' + "Copy Dashboard Link" + '</button>';
                //console.log('buttonHTMLCode is: ', buttonHTMLCode);

                $element.html(buttonHTMLCode);


            }
            else if (layout.outputMethod == "textbox") {
                var buttonHTMLCode = '<button name="GenerateDashboardLink" id="generateDashboardLink" class="dashboardLinkGenerator">Generate Link</button>';
                var textboxHTMLCode = '<textarea id="textbox" class="linkTextboxArea" type="text" readOnly="true" style="height: 90%;width: 90%;font-size: 10px;" value="0"/>';

                //Creating the button, its name, its CSS class, and its original text
                $element.html('<table style="height:100%;text-align: center;"><tr><td style="width:20%;">' + buttonHTMLCode + '</td><td style="width:80%;">' + textboxHTMLCode + '</td></tr></table>');
            }

            // Set up button style

            let button = layout.props;
            let buttonIconShow = button.iconShow;
            let buttonIcon = button.icon;
            let buttonIconSize = button.iconSize;
            let buttonText = button.buttonText;

            let buttonCSS = 'background-color:' + button.buttonBackground_color + ';';
            buttonCSS += 'border-color:' + button.border_color + ';';
            buttonCSS += 'border:' + button.border_style + ';';
            buttonCSS += 'border-radius:' + button.border_radius + ';';
            buttonCSS += 'color:' + button.font_color + ';';
            buttonCSS += 'font-size:' + button.font_size + ';';
            buttonCSS += 'font-weight:' + button.font_weight + ';';
            //console.log('buttonCss is: ', buttonCSS);

            document.getElementById('generateDashboardLink').style.cssText = buttonCSS;

            if (buttonIconShow) {
                var icon = '<span class="lui-icon  ' + buttonIcon + ' ' + buttonIconSize + '"></span>';
            } else {
                var icon = '';
            }
            document.getElementById('generateDashboardLink').innerHTML = icon + ' ' + buttonText;

            //console.log('current style: ',document.getElementById('generateDashboardLink').style)


            //If in edit mode, do nothing
            if (window.location.pathname.includes("/state/edit"))
                return;

            //Making sure the maximum selected values in a field is at least one
            var maxValuesSelectedInField = layout.maxSelected;
            maxValuesSelectedInField = maxValuesSelectedInField < 1 ? 1 : maxValuesSelectedInField;

            //Create a hypercube with the GetCurrentSelections expression
            app.createCube({
                qMeasures: [
                    {
                        qDef: {
                            qDef: "=GetCurrentSelections('" + recordSeparator + "','" + tagSeparator + "','" + valueSeparator + "'," + maxValuesSelectedInField + ")"
                        }
                    }
                ],
                qInitialDataFetch: [{
                    qTop: 0,
                    qLeft: 0,
                    qHeight: 1,
                    qWidth: 1
                }]
            }, function (reply) {
                //console.log('App Integration API\'s reply is: ', reply);
                //console.log('App Integration API\'s detailed reply is: ', reply.qHyperCube.qDataPages[0].qMatrix[0][0].qText)
                //If the app's reply is not empty
                if (reply.qHyperCube.qDataPages[0].qMatrix[0][0].qText && reply.qHyperCube.qDataPages[0].qMatrix[0][0].qText != '-') {
                    //Split the app's reply using the recordSeparator
                    var fieldSelections = reply.qHyperCube.qDataPages[0].qMatrix[0][0].qText.split(recordSeparator);

                    // ---------------------- Start test String -----
                    console.log('characters in the selections:', fieldSelections);
                    var count_sum = 0
                    var test_url = ""
                    fieldSelections.forEach(function (item) {
                        let test = "/%5B" + encodeURI(item.split(tagSeparator)[1].split(valueSeparator).join("];[")) + "%5D"

                        count_sum += test.length
                        if (count_sum > 500) {
                            test_url += '\n' + "----------" + '\n' + encodeURI(item.split(tagSeparator)[0]), '\n', encodeURI(item.split(tagSeparator)[1].split(valueSeparator))
                            //console.log ("test_url over 500: ", test_url)
                            //console.log('itemname in fieldseletions:',encodeURI(item.split(tagSeparator)[0]),'\n',encodeURI(item.split(tagSeparator)[1].split(valueSeparator)),'\n');
                            //console.log('itemvalue in fieldseletions:',encodeURI(item.split(tagSeparator)[1].split(valueSeparator)));
                        } else {
                            test_url += "/select/" + encodeURI(item.split(tagSeparator)[0]) + "/%5B" + encodeURI(item.split(tagSeparator)[1].split(valueSeparator).join("];[")) + "%5D";
                            //console.log('test_url in fieldseletions:',test_url);
                        }

                    });
                    // ---------------------- End test String -----

                    //console.log('Number of characters in the selections:',fieldSelections[0].length);
                    //If the array of split selected fields is more than zero
                    if (fieldSelections.length > 0) {
                        //Create a part of the App Integration API's URI responsible for selections
                        var selectionPartOfURL = createSelectionURLPart(fieldSelections, tagSeparator, valueSeparator, true);
                        if (selectionPartOfURL.tooManySelectionsPossible) {
                            //console.log("Possible 'x of y values' returned. Need to double check. These dimensions are suspected: "+selectionPartOfURL.suspectedFields);
                            //If tooManySelections is possible, then create a new hypercube with the number of selections of the suspected fields
                            var measuresDef = [];
                            selectionPartOfURL.suspectedFields.forEach(function (field) {
                                var measureDefinition = {
                                    qDef: {
                                        qDef: "=GetSelectedCount([" + field + "],True())"
                                    }
                                };
                                measuresDef.push(measureDefinition);
                            });
                            app.createCube({
                                qMeasures: measuresDef,
                                qInitialDataFetch: [{
                                    qTop: 0,
                                    qLeft: 0,
                                    qHeight: 1,
                                    qWidth: selectionPartOfURL.suspectedFields.length
                                }]
                            }, function (reply) {
                                var tooManySelectionsMade = false;
                                reply.qHyperCube.qDataPages[0].qMatrix[0].forEach(function (suspectedSelection) {
                                    //check if the number of selected values is > "Max number of values selected in one field" property
                                    if (parseInt(suspectedSelection.qText) > layout.maxSelected)
                                        tooManySelectionsMade = true;
                                });
                                if (tooManySelectionsMade) {
                                    //If this is the case for at least one field, disable the button
                                    $("#generateDashboardLink").text("Too Many Selections");
                                    $("#generateDashboardLink").prop("disabled", true);
                                }
                                else {
                                    //Considering it a false alarm (for example some field has actual value that follows the "x of y" pattern); activate the button
                                    var selectionPartOfURL = createSelectionURLPart(fieldSelections, tagSeparator, valueSeparator, false);
                                    //console.log('Number of characters in the URL is: ', selectionPartOfURL.selectionURLPart.length)

                                    //if (selectionPartOfURL.selectionURLPart.length > 800){
                                    //		$("#generateDashboardLink").text("Too Many Selections");
                                    //		$("#generateDashboardLink").prop("disabled", true);
                                    //} else {
                                    //		addOnActivateButtonEvent($element,config,layout,baseURL+selectionPartOfURL.selectionURLPart,layout.emailRecipients,layout.emailTopic,layout.emailBody);
                                    //}
                                    addOnActivateButtonEvent($element, config, layout, baseURL + selectionPartOfURL.selectionURLPart);

                                }
                            }); //end of tooManySelections hypercube
                        } //end of tooManySelections possibility
                        else {
                            //If there's no possibility of too many selections, activate the button with the selections part added to the baseURL
                            //console.log('Number of characters in the URL2 is: ', selectionPartOfURL.selectionURLPart.length)
                            //if (selectionPartOfURL.selectionURLPart.length > 800){
                            //		$("#generateDashboardLink").text("Too Many Selections");
                            //		$("#generateDashboardLink").prop("disabled", true);
                            //} else {
                            //		addOnActivateButtonEvent($element,config,layout,baseURL+selectionPartOfURL.selectionURLPart,layout.emailRecipients,layout.emailTopic,layout.emailBody);
                            //}
                            addOnActivateButtonEvent($element, config, layout, baseURL + selectionPartOfURL.selectionURLPart);

                        }
                    } //end of if split selected fields is zero
                    else {
                        //If the array of split selected fields is zero, activate the button with no selections added to the baseURL
                        addOnActivateButtonEvent($element, config, layout, baseURL);
                    }
                } //end of if App Integration API's reply is empty
                else {
                    //If the app's reply is empty, activate the button with no selections added to the baseURL
                    addOnActivateButtonEvent($element, config, layout, baseURL);
                }
            }); //end of reply and createCube
        }
    };
});


//Helper function for creating App Integration API's URI part responsible for selections
var createSelectionURLPart = function (fieldSelections, tagSeparator, valueSeparator, checkForTooManySelections) {
    var returnObject = {
        selectionURLPart: "",
        tooManySelectionsPossible: false,
        suspectedFields: []
    };
    var count_num = 0

    fieldSelections.forEach(function (item) {
        //If this function is instructed to check for tooManySelections, it checks if the selection contains the keywords of, ALL, or NOT, indicating that the selection is not in the 'x of y values' format

        //count_num += 

        if (checkForTooManySelections && (item.includes(" of ") || item.includes("ALL") || item.includes("NOT")) && item.split(valueSeparator).length == 1) {
            returnObject.tooManySelectionsPossible = true;
            returnObject.suspectedFields.push(item.split(tagSeparator)[0]);
        }
        //Otherwise it just creates the selections part of the URL
        else {
            returnObject.selectionURLPart += "/select/" + encodeURI(item.split(tagSeparator)[0]) + "/%5B" + encodeURI(item.split(tagSeparator)[1].split(valueSeparator).join("];[")) + "%5D";
            splitForBrackets = returnObject.selectionURLPart.split("%3B%3B%3B%3B");
            returnObject.selectionURLPart = splitForBrackets.join("%5D%3B%5B");
        }
    });
    return returnObject;
};

//Helper funciton for adding on a "qv-activate" event of button/link
var addOnActivateButtonEvent = function ($element, config, layout, url) {
    var encodedURL = encodeURIComponent(url);
    var langCode = navigator.language;

    $("#generateDashboardLink").on('qv-activate', function () {
        var finalURL = (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + "/" + layout.urlResolver + "?URL=" + encodedURL;

        //if (layout.outputMethod == "email") {
        //    //Opening a new email with the user settings' input subject, the dashboard generated link, and the user settings' input body
        //    window.location.href = 'mailto:' + recipient + '?subject=' + topic + '&body=' + body + " " + "%0D%0A" + "%0D%0A" + (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + "/" + layout.urlResolver + "?URL=" + encodedURL + "%0D%0A" + "%0D%0A" + "%0D%0A" + "http://www.qlik.com";
        //}
        //else 
        if (layout.outputMethod == "clipboard") {
            //Copying the generated link

            var textboxReference = document.querySelector('.dashboardLinkGenerator');
            textboxReference.addEventListener('click', function (event) {
                //let final_text = (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + "/" + layout.urlResolver + "?URL=" + url
                let final_text = url
                console.log('url:', url);
                var showing_text = ""
                if (final_text.length > layout.maxURLLength) {
                    var decoderURL_sting_array = []
                    var substring = final_text.substring(0, layout.maxURLLength);
                    var lastIndex = substring.lastIndexOf('%5D');
                    var last_selection_Index = substring.lastIndexOf('/select/');
                    showing_text += final_text.substring(0, lastIndex + 3)
                    console.log('maxURLLength:', layout.maxURLLength);
                    console.log('Final URL length:', showing_text.length);
                    showing_text += '\n' + '\n' + '-'.repeat(100) + '\n'
                    if (langCode.startsWith("de")) {
                        showing_text += "Die maximalen Filtermöglichkeiten sind überschritten. Bitte folgende Filter manuell ergänzen: " + '\n' + '\n';
                    } else {
                        showing_text += "The maximum filter possibilities have been exceeded. Please add the following filters manually: " + '\n' + '\n';
                    }
                    //console.log('lastIndex of 5D:',final_text.substring(0, lastIndex+3));

                    if (final_text.substring(lastIndex + 3, lastIndex + 11) == '/select/') {

                        console.log('rest of URL:', final_text.substring(lastIndex + 3,));
                        decoderURL_sting_array = decodeURI(final_text.substring(lastIndex + 11,)).split("/select/")
                        console.log('decoderURL_sting_array :', final_text.substring(lastIndex + 11,));
                    } else {
                        rest_substring_tmp = final_text.substring(last_selection_Index + 8, lastIndex + 4)
                        console.log('rest of URL part topic:', rest_substring_tmp.split("/")[0]);
                        let decoderURL_sting = decodeURI(final_text.substring(lastIndex + 4,))
                        decoderURL_sting_array = decoderURL_sting.split("/select/")
                        console.log('decoderURL_sting_array :', final_text.substring(lastIndex + 4,));
                    }

                    decoderURL_sting_array.forEach(function (item) {
                        console.log('item :', item);
                        if (item.split("/[").length < 2) {
                            //console.log('rest_substring_tmp :',rest_substring_tmp);
                            showing_text += 'Filter Name: ' + decodeURI(rest_substring_tmp.split("/")[0]) + '\n' + 'Filter Werte: ' + '\n\t' + item.substring(1, item.length - 1).replaceAll("];[", ",\n\t") + '\n' + '\n' + '-'.repeat(20) + '\n'
                            // console.log('Filtername:',rest_substring_tmp.split("/")[0] + '\n' + item);
                        } else {
                            let sub_item = item.split(item.split("/[")[0] + "/")[1]
                            console.log('sub_item:', sub_item);
                            showing_text += 'Filter nName: ' + item.split("/[")[0] + '\n' + 'Filter Werte: ' + '\n\t' + sub_item.substring(1, sub_item.length - 1).replaceAll("];[", ",\n\t") + '\n' + '\n' + '------------------------' + '\n'
                            //console.log('Filtervalue:',item.split("/")[0] + '\n' + item.split("/")[1]);
                        }
                    });
                    console.log('showing_text:', showing_text);


                } else {
                    showing_text = final_text
                    console.log('final_copy_text:', final_text);
                }

                copyTextToClipboard(showing_text);
            });
            //Changing the button's text temporarily to mark success

            if (langCode.startsWith("de")) {
                document.getElementById('generateDashboardLink').innerHTML = "Link in Zwischenablage kopiert!";
            } else {
                document.getElementById('generateDashboardLink').innerHTML = "Link copied to Clipboard!";
            }
            //Waiting for 1.5 seconds and resetting the button's text so that users are not discouraged to make new selections and generate new links
            setTimeout(function () {
                document.getElementById('generateDashboardLink').innerHTML = layout.props.buttonText;
            }, 1500)
        }
        else if (layout.outputMethod == "textbox") {
            //Adding the dashboard generated link to the textbox
            let final_text = url
            console.log('url:', url);
            var showing_text = ""
            if (final_text.length > layout.maxURLLength) {
                var decoderURL_sting_array = []
                var substring = final_text.substring(0, layout.maxURLLength);
                var lastIndex = substring.lastIndexOf('%5D');
                var last_selection_Index = substring.lastIndexOf('/select/');
                showing_text += final_text.substring(0, lastIndex + 3)
                console.log('maxURLLength:', layout.maxURLLength);
                console.log('Final URL length:', showing_text.length);
                showing_text += '\n' + '\n' + '-'.repeat(100) + '\n'
                if (langCode.startsWith("de")) {
                    showing_text += "Die maximalen Filtermöglichkeiten sind überschritten. Bitte folgende Filter manuell ergänzen: " + '\n' + '\n';
                } else {
                    showing_text += "The maximum filter possibilities have been exceeded. Please add the following filters manually: " + '\n' + '\n';
                }

                if (final_text.substring(lastIndex + 3, lastIndex + 11) == '/select/') {

                    console.log('rest of URL:', final_text.substring(lastIndex + 3,));
                    decoderURL_sting_array = decodeURI(final_text.substring(lastIndex + 11,)).split("/select/")
                    console.log('decoderURL_sting_array :', final_text.substring(lastIndex + 11,));
                } else {
                    rest_substring_tmp = final_text.substring(last_selection_Index + 8, lastIndex + 4)
                    console.log('rest of URL part topic:', rest_substring_tmp.split("/")[0]);
                    let decoderURL_sting = decodeURI(final_text.substring(lastIndex + 4,))
                    decoderURL_sting_array = decoderURL_sting.split("/select/")
                    console.log('decoderURL_sting_array :', final_text.substring(lastIndex + 4,));
                }

                decoderURL_sting_array.forEach(function (item) {
                    console.log('item :', item);
                    if (item.split("/[").length < 2) {
                        showing_text += 'Filter Name: ' + decodeURI(rest_substring_tmp.split("/")[0]) + '\n' + 'Filter Werte: ' + '\n\t' + item.substring(1, item.length - 1).replaceAll("];[", ",\n\t") + '\n' + '\n' + '-'.repeat(20) + '\n'
                    } else {
                        let sub_item = item.split(item.split("/[")[0] + "/")[1]
                        console.log('sub_item:', sub_item);
                        showing_text += 'Filter nName: ' + item.split("/[")[0] + '\n' + 'Filter Werte: ' + '\n\t' + sub_item.substring(1, sub_item.length - 1).replaceAll("];[", ",\n\t") + '\n' + '\n' + '------------------------' + '\n'
                    }
                });


            } else {
                showing_text = final_text
            }
            document.getElementById('textbox').value = decodeURIComponent(showing_text);


            //console.log('addOnActivateButtonEvent-finalURL is: ', finalURL.length)
            //Copying the textbox's text (which we just added the generated link to)
            var textboxReference = document.querySelector('.dashboardLinkGenerator');
            textboxReference.addEventListener('click', function (event) {
                var copyTextarea = document.querySelector('.linkTextboxArea');
                copyTextarea.select();
                try {
                    var successful = document.execCommand('copy');
                    var msg = successful ? 'successful' : 'unsuccessful';
                    console.log('Copying text command was ' + msg);
                } catch (err) {
                    console.log('Oops, unable to copy.');
                }
            });
            //Changing the button's text temporarily to mark success
            document.getElementById('generateDashboardLink').innerHTML = "Copied To Clipboard!";
            //Waiting for 1.5 seconds and resetting the button's text so that users are not discouraged to make new selections and generate new links
            setTimeout(function () {
                document.getElementById('generateDashboardLink').innerHTML = "Generate Link";
            }, 1500)
        }
        window.onbeforeunload = null;
        return false;
    });
    $("#generateDashboardLink").prop("disabled", false);
};

function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");

    // *** This styling is an extra step which is likely not required. ***
    //
    // Why is it here? To ensure:
    // 1. the element is able to have focus and selection.
    // 2. if element was to flash render it has minimal visual impact.
    // 3. less flakyness with selection and copying which **might** occur if
    //    the textarea element is not visible.
    //
    // The likelihood is the element won't even render, not even a flash,
    // so some of these are just precautions. However in IE the element
    // is visible whilst the popup box asking the user for permission for
    // the web page to copy to the clipboard.
    //

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';


    textArea.value = text;

    document.body.appendChild(textArea);

    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }
    document.body.removeChild(textArea);
}