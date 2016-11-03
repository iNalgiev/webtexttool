// Run on page load
$(document).ready(function () {

// If sessionStorage is storing default values, exit the function and do not restore data
    if (sessionStorage.getItem('wttKeyword') == "wttKeyword") {
        return;
    }

// If values are not blank, restore them to the fields
    var wttKeyword = sessionStorage.getItem('wttKeyword');
    if (wttKeyword !== null) {
        jQuery('#wtt-keyword').val(wttKeyword);
    }

    var wttDescription = sessionStorage.getItem('wttDescription');
    if (wttDescription !== null) {
        jQuery('#wtt-description').val(wttDescription);
    }

    var wttLanguage = sessionStorage.getItem('wttLanguage');
    if (wttLanguage !== null) {
        jQuery('#wtt-language-code-field').val(wttLanguage);
    }
});