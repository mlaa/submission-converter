/* Main */

/*global window*/

'use strict';

var $ = require('jquery');
var fileReader = require('./modules/file-reader');
var parse = require('csv-parse');

var $dropParent = $('#my-droppable');
var $dropInput = $('#my-dropzone');
var $warningDiv = $('#my-warning');
var $loadingDiv = $('#my-loading');
var $errorDiv = $('#my-errors');
var $output = $('#my-output');
var $download = $('#my-download');
var $downloadLink = $('#my-download-link');

var fileReaderOptions = {
  onDragEnter: function () {
    $dropParent.addClass('hover');
  },
  onDragLeave: function () {
    $dropParent.removeClass('hover');
  },
  target: $dropInput[0],
  types: [
    'text/csv',
    'text/comma-separated-values',
    'application/csv',
    'application/vnd.ms-excel'
  ]
};

var targetFieldNames = [
  'PublicationType',
  'PublicationAuthor',
  'ArticleTitle',
  'ArticlePageRange',
  'JournalTitle',
  'BookTitle',
  'PublicationEditor',
  'TableOfContents',
  'PlaceofPublication',
  'Publisher',
  'DateofPublication',
  'SeriesTitle',
  'Volume',
  'Issue',
  'TotalPages',
  'ISBN',
  'PublicationPermalink',
  'PublicationAbstract',
  'SuggestedKeywords',
  'YourContactEmail',
  'AnyAdditionalBibliographicInformation',
  'FileUpload'
];

var confirmNavigation = function () {
  return 'Your conversion will be cleared and will not be recoverable.';
};

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

var processRows = function (err, dataArray) {

  if (err) {
    $errorDiv.append('<p>' + err.message + '</p>').show();
    return;
  }

  $loadingDiv.hide();

  var output = '';
  var mapping = {};
  var headers = dataArray.shift();

  // Populate mapping of desired fields to available fields.
  targetFieldNames.forEach(function (name) {
    headers.forEach(function (header, columnIndex) {
      if (header.replace(/ /g, '').toLowerCase().startsWith(name.toLowerCase())) {
        mapping[name] = columnIndex;
      }
    });
  });

  dataArray.forEach(function (row) {
    targetFieldNames.forEach(function (name) {
      var value = row[mapping[name]] || '';
      output = output + name + ' ' + value + '\n';
    });
  });

  // Add a special delimeter after the last row.
  output = output + targetFieldNames[0] + ' ';

  // Populate output.
  $output.text(output);
  $downloadLink
    .attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(output))
    .attr('download', 'submission-export-' + new Date().toJSON().slice(0, 10) + '.txt');

  $download.show();
  $output.show();

  // Confirm navigation away from page
  window.onbeforeunload = confirmNavigation;

};

var parseCsv = function (err, csvString) {

  $dropParent.hide();

  if (err) {
    processRows(err);
    return;
  }

  $loadingDiv.show();
  parse(csvString, processRows);

};

// Show warning if browser does not support file reading.
if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
  $warningDiv.show();
  $dropParent.hide();
}

fileReader(fileReaderOptions, parseCsv);
