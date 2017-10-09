var app = angular.module('csv-upload', []);

app.controller('MainCtrl', function ($scope, $timeout) {
    var self = this;
    $scope.title = 'Read CSV file';
    $scope.lines = [];
    $scope.selected = {};
    $scope.fileName = '';
    $scope.fileDetails = {};
    $scope.displayFileDetails = [];
    $scope.active = true;

    $scope.ctrlFn = function (arg) {
        $scope.processData(arg);
    }

    $scope.processData = function (strData, strDelimiter) {
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                    // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                    // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
        );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;

        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[1];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push([]);
            }
            var strMatchedValue;

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[2]) {
                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[2].replace(
                    new RegExp("\"\"", "g"),
                    "\""
                );
            } else {
                // We found a non-quoted value.
                strMatchedValue = arrMatches[3];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[arrData.length - 1].push(strMatchedValue);
        }
        $scope.csv2json((arrData));

        // Return the parsed data.
        // return ( arrData );
    }

    $scope.csv2json = function (csv) {
        var array = csv;
        var objArray = [];
        for (var i = 1; i < array.length; i++) {
            objArray[i - 1] = {};
            for (var k = 0; k < array[0].length && k < array[i].length; k++) {
                var key = array[0][k];
                objArray[i - 1][key] = array[i][k]
            }
        }
        $scope.lines = objArray;
    }

    /**
     * Reset Client Details
     */
    $scope.reset = function () {
        $scope.selected = {};
    };

    /**
     * Post the JSON data
     */
    $scope.postJsonData = function () {
        if ($scope.clientForm.$valid) {
            $scope.fileInfo = {
                STG_EXT_USER_FILE_INFO: {
                    FILE_NAME: $scope.fileDetails.name
                }
            };

            $scope.userInfo = {
                STG_EXT_USER_INFO: $scope.lines
            };

            $scope.finalObject = {
                INSERT_STG_USER: angular.extend($scope.fileInfo, $scope.userInfo)
            };
            alert(angular.toJson($scope.finalObject, true));
            $scope.fileDetails.uploadedBy = 'vikash';
            $scope.fileDetails.uploadDate = new Date();
            $scope.fileDetails.totalRecords = $scope.lines.length;
            $scope.displayFileDetails.push($scope.fileDetails);
        }
    }

});


/**
 * File Reader Directive
 */
app.directive('fileReader', function () {
    return {
        scope: {
            fileReader: "=",
            fromDirectiveFn: '=method',
            fileDetails: "="
        },
        link: function (scope, element) {
            $(element).on('change', function (changeEvent) {
                var files = changeEvent.target.files;
                if (files.length) {
                    var r = new FileReader();
                    r.onload = function (e) {
                        var contents = e.target.result;
                        scope.$apply(function () {
                            scope.fileReader = contents;
                            scope.fromDirectiveFn(contents);
                            scope.fileDetails = files[0];
                        });
                    };
                    r.readAsText(files[0]);
                }
            });
        }
    };
});