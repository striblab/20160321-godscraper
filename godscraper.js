function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('GodScraper')
      .addItem('Page Scrape', 'menuItem1')
      .addItem('CSV Scrape', 'menuItem2')
      .addItem('JSON Scrape', 'menuItem3')
      .addToUi();
}

function menuItem1() {
  myXML();
}

function menuItem2() {
  myCSV();
}

function menuItem3() {
  myJSON();
}

function cronTasks() {
  //CHANGE ANYTHING IN THIS FUNCTION TO CREATE CUSTOM CRONJOB COMMANDS TO RUN AT SCHEDULED TIMES
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = SpreadsheetApp.setActiveSheet(ss.getSheets()[1]);
  myJSON();
  
  var d = new Date();
  var n = d.getDate();
  var m = d.getMonth();
  var y = d.getFullYear();
  var h = d.getHours();
  var min = d.getMinutes();

  var sheetName = "data" + "-" + y + "-" + m + "-" + n + "-" + h + ":" + min;
  newSheet(sheetName);

  Utilities.sleep(15000);

  var data = sh.getDataRange().getValues();
  var sourceRows = sh.getDataRange().getNumRows();
  var sourceColumns = sh.getDataRange().getNumColumns();
  
  var sh2 = ss.getSheetByName(sheetName);
 
  sh2.getDataRange().offset(0, 0, sourceRows, sourceColumns).setValues(data);
  
  removeEmptyRows(sh2);
}

function newSheet(name){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  yourNewSheet = ss.insertSheet();
  yourNewSheet.setName(name);
}

function removeEmptyRows(sh){
  var maxRows = sh.getMaxRows(); 
  var lastRow = sh.getLastRow();
  sh.deleteRows(lastRow+1, maxRows-lastRow);
}

function myXML() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('GodScraper Settings');
  var urlCell = sheet.getRange(2,2); 
  var url = urlCell.getValue();
  var targetCell = sheet.getRange(3,2);
  var target = targetCell.getValue();
  
  var cell = SpreadsheetApp.getActiveSpreadsheet()
    .getActiveSheet().getActiveCell();
  cell.setFormula('=importXml("' + url + '", "' + target + '")');  
}

function myCSV() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('GodScraper Settings');
  var urlCell = sheet.getRange(2,4); 
  var url = urlCell.getValue();
  
  var cell = SpreadsheetApp.getActiveSpreadsheet()
    .getActiveSheet().getActiveCell();
  cell.setFormula('=importdata("' + url + '")');  
}

function myJSON() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('GodScraper Settings');
  var urlCell = sheet.getRange(2,6); 
  var url = urlCell.getValue();
  
 var cell = SpreadsheetApp.getActiveSpreadsheet()
    .getActiveSheet().getActiveCell();
  cell.setFormula('=ImportJSON("' + url + '")'); 
}

function readRows() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();

  for (var i = 0; i <= numRows - 1; i++) {
    var row = values[i];
    Logger.log(row);
  }
};


function ImportJSON(url, query, options) {
  return ImportJSONAdvanced(url, query, options, includeXPath_, defaultTransform_);
}

function ImportJSONAdvanced(url, query, options, includeFunc, transformFunc) {
  var jsondata = UrlFetchApp.fetch(url);
  var object   = JSON.parse(jsondata.getContentText());
  
  return parseJSONObject_(object, query, options, includeFunc, transformFunc);
}

function URLEncode(value) {
  return encodeURIComponent(value.toString());  
}

function parseJSONObject_(object, query, options, includeFunc, transformFunc) {
  var headers = new Array();
  var data    = new Array();
  
  if (query && !Array.isArray(query) && query.toString().indexOf(",") != -1) {
    query = query.toString().split(",");
  }
  
  if (options) {
    options = options.toString().split(",");
  }
    
  parseData_(headers, data, "", 1, object, query, options, includeFunc);
  parseHeaders_(headers, data);
  transformData_(data, options, transformFunc);
  
  return hasOption_(options, "noHeaders") ? (data.length > 1 ? data.slice(1) : new Array()) : data;
}

function parseData_(headers, data, path, rowIndex, value, query, options, includeFunc) {
  var dataInserted = false;
  
  if (isObject_(value)) {
    for (key in value) {
      if (parseData_(headers, data, path + "/" + key, rowIndex, value[key], query, options, includeFunc)) {
        dataInserted = true; 
      }
    }
  } else if (Array.isArray(value) && isObjectArray_(value)) {
    for (var i = 0; i < value.length; i++) {
      if (parseData_(headers, data, path, rowIndex, value[i], query, options, includeFunc)) {
        dataInserted = true;
        rowIndex++;
      }
    }
  } else if (!includeFunc || includeFunc(query, path, options)) {
    // Handle arrays containing only scalar values
    if (Array.isArray(value)) {
      value = value.join(); 
    }
    
    // Insert new row if one doesn't already exist
    if (!data[rowIndex]) {
      data[rowIndex] = new Array();
    }
    
    // Add a new header if one doesn't exist
    if (!headers[path] && headers[path] != 0) {
      headers[path] = Object.keys(headers).length;
    }
    
    // Insert the data
    data[rowIndex][headers[path]] = value;
    dataInserted = true;
  }
  
  return dataInserted;
}

function parseHeaders_(headers, data) {
  data[0] = new Array();

  for (key in headers) {
    data[0][headers[key]] = key;
  }
}

function transformData_(data, options, transformFunc) {
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[i].length; j++) {
      transformFunc(data, i, j, options);
    }
  }
}

function isObject_(test) {
  return Object.prototype.toString.call(test) === '[object Object]';
}

function isObjectArray_(test) {
  for (var i = 0; i < test.length; i++) {
    if (isObject_(test[i])) {
      return true; 
    }
  }  

  return false;
}

function includeXPath_(query, path, options) {
  if (!query) {
    return true; 
  } else if (Array.isArray(query)) {
    for (var i = 0; i < query.length; i++) {
      if (applyXPathRule_(query[i], path, options)) {
        return true; 
      }
    }  
  } else {
    return applyXPathRule_(query, path, options);
  }
  
  return false; 
};

function applyXPathRule_(rule, path, options) {
  return path.indexOf(rule) == 0; 
}

function defaultTransform_(data, row, column, options) {
  if (!data[row][column]) {
    if (row < 2 || hasOption_(options, "noInherit")) {
      data[row][column] = "";
    } else {
      data[row][column] = data[row-1][column];
    }
  } 

  if (!hasOption_(options, "rawHeaders") && row == 0) {
    if (column == 0 && data[row].length > 1) {
      removeCommonPrefixes_(data, row);  
    }
    
    data[row][column] = toTitleCase_(data[row][column].toString().replace(/[\/\_]/g, " "));
  }
  
  if (!hasOption_(options, "noTruncate") && data[row][column]) {
    data[row][column] = data[row][column].toString().substr(0, 256);
  }

  if (hasOption_(options, "debugLocation")) {
    data[row][column] = "[" + row + "," + column + "]" + data[row][column];
  }
}

function removeCommonPrefixes_(data, row) {
  var matchIndex = data[row][0].length;

  for (var i = 1; i < data[row].length; i++) {
    matchIndex = findEqualityEndpoint_(data[row][i-1], data[row][i], matchIndex);

    if (matchIndex == 0) {
      return;
    }
  }
  
  for (var i = 0; i < data[row].length; i++) {
    data[row][i] = data[row][i].substring(matchIndex, data[row][i].length);
  }
}

function findEqualityEndpoint_(string1, string2, stopAt) {
  if (!string1 || !string2) {
    return -1; 
  }
  
  var maxEndpoint = Math.min(stopAt, string1.length, string2.length);
  
  for (var i = 0; i < maxEndpoint; i++) {
    if (string1.charAt(i) != string2.charAt(i)) {
      return i;
    }
  }
  
  return maxEndpoint;
}
  
function toTitleCase_(text) {
  if (text == null) {
    return null;
  }
  
  return text.replace(/\w\S*/g, function(word) { return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase(); });
}

function hasOption_(options, option) {
  return options && options.indexOf(option) >= 0;
}