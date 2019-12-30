const _ = require(`lodash`);
const language_pack = require('../../../app/LanguagePack');
const moment = require('moment');
let date = moment();

//Getting current selected language
// module.exports.setCurrentLanguage = (req,modulePath,Handlebars) => {
//     Handlebars.registerHelper('currentLanguage',()=> {
//
//         // let currentLanguage = {
//         //         language_code: 'en', language: 'English'
//         // }
//         let currentLanguage = {}
//
//         if (req.session.LanguagePack.selected_pack.hits.total>0) {
//             currentLanguage = req.session.LanguagePack.selected_pack.hits.hits[0]
//         }
//         console.log(currentLanguage._source.categories_field);
//
//         return currentLanguage._source;
//
//     });
// }

//Getting language list
module.exports.languageListHelper = async (client,req,Handlebars) => {

    let language_list = ``;

    return 0

    // if (!_.isEmpty(req.session.language_list)) {
    //
    //     Handlebars.registerHelper('language_list', function(items, options){
    //         language_list = ``
    //         req.session.language_list.forEach((language)=>{
    //             language_list += "<li><a href='?lan="+language.language_code+"'>" + language.language + "</a></li>";
    //         })
    //         return language_list;
    //     })
    //
    // }else {
    //     language_pack.getCleanLanguagePack(client,req).then((res)=>{
    //
    //         req.session.language_list = res;
    //
    //         Handlebars.registerHelper('language_list', function(items, options){
    //             language_list = ``;
    //             req.session.language_list.forEach((language)=>{
    //                 language_list += "<li><a href='?lan="+language.language_code+"'>" + language.language + "</a></li>";
    //             })
    //             return language_list;
    //         })
    //     }).catch(err => console.error(err))
    // }

};

module.exports.setReplaceUrlHelper = (Handlebars) => {
    Handlebars.registerHelper('replaceUrl', function( find=' ', replace='+', options) {
        let string = options.fn(this);
        return string.replace(/ /g, '+');
    });
};

module.exports.setTrimStringHelper = (Handlebars) => {
    Handlebars.registerHelper('trimString', function(passedString) {
        let theString = passedString ? passedString.trim():'';
        return new Handlebars.SafeString(theString)
    });
};


module.exports.setDateFormatHelper = (Handlebars) => {

    const DateFormats = {
        short: "DD MMMM YYYY",
        year: "YYYY",
        long: "dddd DD.MM.YYYY HH:mm"
    };

    Handlebars.registerHelper("formatDate", function (datetime, format) {
        format = DateFormats[format] || format;
        return moment(datetime).format(format);
    });

};

module.exports.setStrIncludesHelper = (Handlebars) => {
    Handlebars.registerHelper("strIncludes", function(string, value, options) {
        if (string.includes(value)) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
}

module.exports.setStrSplitVersionHelper = (Handlebars) => {
    Handlebars.registerHelper("strSplitVersion", function(string, value, index, options) {
        const tmpStr = string.split(value);
        return `<li>${tmpStr[index]}</li>`;
    });
}

module.exports.setCompareHelper = (Handlebars) => {

    Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {

        var operators, result;

        if (arguments.length < 3) {
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
        }

        if (options === undefined) {
            options = rvalue;
            rvalue = operator;
            operator = "===";
        }

        operators = {
            '==': function (l, r) { return l == r; },
            '===': function (l, r) { return l === r; },
            '!=': function (l, r) { return l != r; },
            '!==': function (l, r) { return l !== r; },
            '<': function (l, r) { return l < r; },
            '>': function (l, r) { return l > r; },
            '<=': function (l, r) { return l <= r; },
            '>=': function (l, r) { return l >= r; },
            'typeof': function (l, r) { return typeof l == r; }
        };

        if (!operators[operator]) {
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
        }

        result = operators[operator](lvalue, rvalue);

        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }

    });

};
