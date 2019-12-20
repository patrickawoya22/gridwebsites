

//Getting clear language list
module.exports.getCleanLanguagePack = (client,req) =>{

    return new Promise((resolve,reject)=>{
        resolve();
        // client.search({
        //     index: 'language_pack',
        //     type: '_doc',
        //     body:{
        //         query:{
        //             match_all: {}
        //         }
        //     }
        // }).then((body)=>{
        //
        //     let lang_arr = [];
        //
        //     if (body.hits.total>0) {
        //         body.hits.hits.forEach((language_obj)=>{
        //
        //             lang_arr.push({ 'language_code': language_obj._source.language_code_field.toLowerCase(), 'language': language_obj._source.language_field });
        //         })
        //
        //         resolve(lang_arr)
        //
        //     }else {
        //         resolve({})
        //     }
        //
        // }, (error)=>{
        //     console.trace(error.message)
        // }).catch(err => console.error(err))
    })

}

module.exports.addLanguagePack = async (req) =>{

    return await req.client.index({
        index: 'language_pack',
        type: '_doc',
        body: getLanguageJson(req)
    })
}

module.exports.updateLanguagePack = async (req) =>{

    return await req.client.update({
        index: 'language_pack',
        type: '_doc',
        id:req.language_id,
        body: {
            doc: getLanguageJson(req)
        }
    })
}

module.exports.getLanguagePackByCode = (client,code) => {
    return new Promise((resolve,reject)=>{
        client.search({
            index: 'language_pack',
            type: '_doc',
            body:{
                from: 0,
                size: 1,
                query:{
                    bool:{
                        must:{
                            match:{
                                language_code_field:code,
                            }
                        },
                    }
                }
            }
        }).then((body)=>{
            resolve(body)
        }, (error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err))
    })
}

module.exports.getLanguagePackByLanguage = (client,language) => {
    return new Promise((resolve,reject)=>{
        client.search({
            index: 'language_pack',
            type: '_doc',
            body:{
                from: 0,
                size: 1,
                query:{
                    bool:{
                        must:{
                            match:{
                                language_field:language,
                            }
                        },
                    }
                }
            }
        }).then((body)=>{
            resolve(body)
        }, (error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err))
    })
}

module.exports.getLanguagePackByLanguageOrCode = (client,language) => {

    return new Promise((resolve,reject)=>{
        client.search({
            index: 'language_pack',
            type: '_doc',
            body:{
                from: 0,
                size: 1,
                query:{
                    bool:{
                        must:{

                                multi_match:{
                                    query:language,
                                    type:'phrase',
                                    analyzer:'standard',
                                    fields:['language_code_field','language_field'],
                                },

                        }
                    }
                }
            }
        }).then((body)=>{
            resolve(body)
        }, (error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err))
    })
}

module.exports.getLanguagePackById = (client,id) => {
    return new Promise((resolve,reject)=>{
        return client.get({
            id: id,
            index: 'language_pack',
            type: '_doc',
        }).then((body)=>{
            resolve(body)
        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err))
    })
}

const getLanguageJson = (req) => {
    return {
        templates_field: req.body.templates_field,
        themes_field: req.body.themes_field,
        members_field: req.body.members_field,
        country_field: req.body.country_field,
        name_field: req.body.name_field,
        mobile_field: req.body.mobile_field,
        email_field: req.body.email_field,
        account_detail_field: req.body.account_detail_field,
        followers_field: req.body.followers_field,
        following_field: req.body.following_field,
        credits_field: req.body.credits_field,
        categories_field: req.body.categories_field,
        login_field: req.body.login_field,
        join_field: req.body.join_field,
        developers_field: req.body.developers_field,
        php_field: req.body.php_field,
        foundation_field: req.body.foundation_field,
        bootstrap_field: req.body.bootstrap_field,
        birth_day_cards_field: req.body.birth_day_cards_field,
        business_cards_field: req.body.business_cards_field,
        sports_field: req.body.sports_field,
        photos_field: req.body.photos_field,
        api_intergration_field: req.body.api_intergration_field,
        about_us_field: req.body.about_us_field,
        blogs_field: req.body.blogs_field,
        chat_room_field: req.body.chat_room_field,
        contact_us_field: req.body.contact_us_field,
        website_design_field: req.body.website_design_field,
        products_and_services_field: req.body.products_and_services_field,
        all_rights_reserved_field: req.body.all_rights_reserved_field,
        learn_more_field: req.body.learn_more_field,
        reviews_field: req.body.reviews_field,
        questions_field: req.body.questions_field,
        contact_seller_field: req.body.contact_seller_field,
        reviewed_by_our_Foundation_6_team_field: req.body.reviewed_by_our_Foundation_6_team_field,
        months_support_field: req.body.months_support_field,
        released_field: req.body.released_field,
        version_field: req.body.version_field,
        files_included_field: req.body.files_included_field,
        layout_field: req.body.layout_field,
        responsive_field: req.body.responsive_field,
        features_field: req.body.features_field,
        code_quality_field: req.body.code_quality_field,
        leave_review_field: req.body.leave_review_field,
        remove_review_field: req.body.remove_review_field,
        submit_field: req.body.submit_field,
        leave_your_reply_here_field: req.body.leave_your_reply_here_field,
        leave_your_review_here_field: req.body.leave_your_review_here_field,
        posted_on_field: req.body.posted_on_field,
        price_field: req.body.price_field,
        relevance_field: req.body.relevance_field,
        price_low_to_high_field: req.body.price_low_to_high_field,
        price_high_to_low_field: req.body.price_high_to_low_field,
        avg_customer_review_field: req.body.avg_customer_review_field,
        results_for_field: req.body.results_for_field,
        projects_field: req.body.projects_field,
        money_back_guarantee_field: req.body.money_back_guarantee_field,
        sold_field: req.body.sold_field,
        home_paragraph_1: req.body.home_paragraph_1,
        home_paragraph_2: req.body.home_paragraph_2,
        home_paragraph_3: req.body.home_paragraph_3,
        home_paragraph_4: req.body.home_paragraph_4,
        home_paragraph_5: req.body.home_paragraph_5,
        home_cta_header_1: req.body.home_cta_header_1,
        home_cta_paragraph_1: req.body.home_cta_paragraph_1,
        creative_field: req.body.creative_field,
        search_field: req.body.search_field,
        company_field: req.body.company_field,
        grid_websites_field: req.body.grid_websites_field,
        landing_pages_field: req.body.landing_pages_field,
        created_by_field: req.body.created_by_field,
        our_most_recently_work_field: req.body.our_most_recently_work_field,
        support_field: req.body.support_field,
        days_money_back_guarantee_on_all_products_field: req.body.days_money_back_guarantee_on_all_products_field,
        multi_language: req.body.multi_language,
        email_emplates_field: req.body.email_emplates_field,
        email_emplates_paragraph_field: req.body.email_emplates_paragraph_field,
        login_with_google_field: req.body.login_with_google_field,
        login_with_facebook_field: req.body.login_with_facebook_field,
        or_field: req.body.or_field,
        email_or_username_field: req.body.email_or_username_field,
        password_field: req.body.password_field,
        log_in_field: req.body.log_in_field,
        remember_me_field: req.body.remember_me_field,
        forgot_your_password_field: req.body.forgot_your_password_field,
        dont_have_account_password_field: req.body.dont_have_account_password_field,
        sign_up_field: req.body.sign_up_field,
        join_with_google_field: req.body.join_with_google_field,
        join_with_facebook_field: req.body.join_with_facebook_field,
        title_field: req.body.title_field,
        first_name_field: req.body.first_name_field,
        last_name_field: req.body.last_name_field,
        username_field: req.body.username_field,
        already_have_an_account_field: req.body.already_have_an_account_field,
        by_signing_up_you_agree_to_our_terms_privacy_policy_field: req.body.by_signing_up_you_agree_to_our_terms_privacy_policy_field,
        please_select_your_title_field: req.body.please_select_your_title_field,
        mr_field: req.body.mr_field,
        mrs_field: req.body.mrs_field,
        ms_field: req.body.ms_field,
        miss_field: req.body.miss_field,
        standard_license_field: req.body.standard_license_field,
        get_it_design_for_our_business_field: req.body.get_it_design_for_our_business_field,
        get_it_design_and_hosteds_field: req.body.get_it_design_and_hosteds_field,
        add_to_cart_field: req.body.add_to_cart_field,
        please_press_confirm_to_remove_review_field: req.body.please_press_confirm_to_remove_review_field,
        cancel_field: req.body.cancel_field,
        confirm_field: req.body.confirm_field,
    }
};
