
$(function () {
    'use strict';

// Initialize ajax autocomplete:
$('#autocomplete').devbridgeAutocomplete({
    serviceUrl: '/product-json',
    paramName: 'q',
    beforeRender: false,
    preventBadQueries: true,
    autoSelectFirst: false,
    showNoSuggestionNotice: true,
    tabDisabled: true,
    noSuggestionNotice: '',
    onSelect: function(suggestion) {
        $('#autocomplete').val('');
        window.location.href = '/product/'+suggestion.name.replace(/ /g, '+')+'/'+suggestion.data;
        // $('#selction-ajax').html('You selected: ' + suggestion.value + ', ' + suggestion.data);
    },
    onHint: function (hint) {
        $('#autocomplete-ajax-x').val(hint);
    },
    onInvalidateSelection: function() {
        $('#selction-ajax').html('You selected: none');
    },
    onSearchStart: function(query){
        // $('#autocomplete').autocomplete().setOptions({ajaxSettings: {"data": { "query": $('#autocomplete').val() } } });
    }
});

});

