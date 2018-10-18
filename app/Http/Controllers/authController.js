const _ = require(`lodash`);
const language_pack = require(`../../LanguagePack`);
const products = require(`../../Products`);

exports.joinAction = function(req, res) {

    req.check(`title`,`Please enter title`).isLength({min:2,max:4});
    req.check(`first_name`, `Please enter your first name`).isLength({min:1,max:60});
    req.check(`last_name`,`Please enter your last name`).isLength({min:1,max:60});
    req.check(`email`,`Please enter a valid email`).isEmail();
    req.check(`password`,`Password must be at least 6 characters long`).isLength({min:6,max:60});

    let errors = req.validationErrors();

    if (errors) {
        req.flash('join_msg', errors);
    }
    res.redirect(`/`);
};

exports.loginAction = function(req, res) {

    req.check(`email`,`Please enter a valid email`).isEmail();
    req.check(`password`,`Password must be at least 6 characters long`).isLength({min:6,max:60});

    let errors = req.validationErrors();

    if(errors){
        req.flash('login_msg', errors);
    }
    res.redirect(`/`);
};

exports.saveAccountDetailsAction = function(req, res) {

    req.check(`title`,`Please enter title`).isLength({min:2,max:4});
    req.check(`language`, `Please select defualt language`).isLength({min:1,max:60});
    req.check(`username`, `Please enter your username`).isLength({min:1,max:60});
    req.check(`first_name`, `Please enter your first name`).isLength({min:1,max:60});
    req.check(`last_name`,`Please enter your last name`).isLength({min:1,max:60});

    req.check(`country`,`Please select Country`).isLength({min:1,max:60});

    let errors = req.validationErrors();

    if(errors){

        req.flash('msg', errors);
    }

    res.redirect(`/edit-profile#account`);
};
exports.saveTemplateAction = function(req, res) {

    req.check(`name`,`Please enter template name`).isLength({min:2,max:200});
    req.check(`language`,`Please select language`).isLength({min:2,max:100});
    req.check(`price`, `Please enter a valid format i.e 59.99`).isLength({min:1,max:10});
    req.check(`discount_price`, `Please enter a valid format i.e 59.99`).isLength({min:1,max:10});
    req.check(`built_price`, `Please enter a valid format i.e 59.99`).isLength({min:1,max:10});
    req.check(`hosting_price`,`Please enter a valid format i.e 59.99`).isLength({min:1,max:10});

    req.check(`category`,`Please select categories`).isLength({min:1});
    req.check(`features`,`Please select features`).isLength({min:1});
    req.check(`code_quality`,`Please enter code quality`).isLength({min:1});
    req.check(`description`,`Please enter description`).isLength({min:1});

    let errors = req.validationErrors();

    if(errors){
        req.flash('msg', errors)
        req.flash('query', req.body)
        res.redirect(`/edit-templates`);
    }else if (!_.isEmpty(req.body.p_ref)) {

        products.getProductByID(req,req.body.p_ref).then((req2)=>{

            if (!_.isEmpty(req2._source)&&(req2._source.owner=='set_user_id_here')||1==1) {

                language_pack.getLanguagePackByLanguageOrCode(req.client,req.body.language).then((res2)=>{

                    if (res2.hits.total > 0) {

                        req.body.language_code = res2.hits.hits[0]._source.language_code_field
                        req.body.language = res2.hits.hits[0]._source.language_field

                        //products.updateProductDetails(req).then((res3)=>{
                            res.redirect(`/edit-templates?s=details&ref=${res2._id}`);
                        //})
                    }
                }).catch(err => console.error(err))

            }else {
                throw new Error(`Error code 298240790. Something bad happened`);
            }

        }).catch(err => console.error(err))

    } else{
        language_pack.getLanguagePackByLanguageOrCode(req.client,req.body.language).then((res2)=>{

            if (res2.hits.total > 0) {

                req.body.language_code = res2.hits.hits[0]._source.language_code_field
                req.body.language = res2.hits.hits[0]._source.language_field

                products.addNewProduct(req).then((res3)=>{
                    res.redirect(`/edit-templates?s=details&ref=${res3._id}`);
                }).catch(err => console.error(err))
            }else {
                throw new Error(`Error code 295850790. Something bad happened`);
            }
        })

    }


};

exports.saveDescriptionAction = function(req, res) {

    req.check(`description`,`Description must be at least 2 characters long`).isLength({min:2});

    let errors = req.validationErrors();

    if(errors){

        req.flash('msg', errors);
    }
    res.redirect(`/edit-profile#description`);
};


exports.saveNotificationsAction = function(req, res) {

    req.check(`email`,`Please enter a valid email`).isEmail();
    req.check(`mobile`,`Please enter a valid mobile number. i.e. 07457528436`).isLength({min:11,max:20});

    let errors = req.validationErrors();

    if(errors){

        req.flash('msg', errors);
    }
    res.redirect(`/edit-profile#notifications`);
};


exports.savePasswordAction = function(req, res) {

    req.check(`new_password`,`Password must be at least 6 characters long`).isLength({min:6,max:60});
    req.check(`new_password`,`Confirm new password has to must New Password`).equals(req.body.confirm_password);

    let errors = req.validationErrors();

    if(errors){

        req.flash('msg', errors);
    }
    res.redirect(`/edit-profile#change-password`);
};

exports.saveLanguagePackAction = function(req, res) {

    req.check(`language_field`,'Invalid language value').isLength({min:1,max:60});
    req.check(`language_code_field`,'Invalid language code only 2 values allowed').isLength({min:2,max:2});
    req.check(`templates_field`,'Invalid templates value').isLength({min:1,max:60});
    req.check(`themes_field`,'Invalid themes value').isLength({min:1,max:60});

    let errors = req.validationErrors();
    let get_pram = ``

    if (!_.isEmpty(req.query.lan)) {
        issset_get_pram = true;
        get_pram = `?lan=${req.query.lan}`
    }

    if(errors){
        req.flash('msg', errors);
        res.redirect(`/edit-language-pack${get_pram}`);
    }else {
        language_pack.getLanguagePackByLanguageOrCode(req.client,req.body.language_field).then((res2)=>{
            if (res2.hits.total==0) {

                language_pack.addLanguagePack(req).then((res2)=>{
                    console.log(`adding language pack`);
                    res.redirect(`/edit-language-pack${get_pram}`);

                }).catch(err => console.error(err))

            }else{

                req.language_id = res2.hits.hits[0]._id;

                language_pack.updateLanguagePack(req).then((res3)=>{

                    console.log(`update language pack`);

                    res.redirect(`/edit-language-pack${get_pram}`);

                }).catch(err => console.error(err))
            }
        }).catch(err => console.error(err))
    }
};
