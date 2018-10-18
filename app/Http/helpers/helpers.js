const _ = require(`lodash`);
const language_pack = require('../../../app/LanguagePack');

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

    if (!_.isEmpty(req.session.language_list)) {

        Handlebars.registerHelper('language_list', function(items, options){
            language_list = ``
            req.session.language_list.forEach((language)=>{
                language_list += "<li><a href='?lan="+language.language_code+"'>" + language.language + "</a></li>";
            })
            return language_list;
        })

    }else {
        language_pack.getCleanLanguagePack(client,req).then((res)=>{

            req.session.language_list = res;

            Handlebars.registerHelper('language_list', function(items, options){
                language_list = ``;
                req.session.language_list.forEach((language)=>{
                    language_list += "<li><a href='?lan="+language.language_code+"'>" + language.language + "</a></li>";
                })
                return language_list;
            })
        }).catch(err => console.error(err))
    }

}

module.exports.setCompareHelper = (modulePath,Handlebars) => {

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

}
