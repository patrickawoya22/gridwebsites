const _ = require(`lodash`);
const bcrypt = require('bcrypt');
const language_pack = require(`../../LanguagePack`);
const products = require(`../../Products`);
const users = require(`../../Users`);
const emails = require(`../../Emails`);
const utility = require(`../../Utility`);
const cart = require(`../../Cart`);
const reviews = require(`../../Reviews`);
const replies = require(`../../ReviewsReplies`);
const paypal = require('paypal-rest-sdk');
const paypalModal = require('../../PayPal');
const order = require('../../Order');
const currencyFormatter = require('currency-formatter');

exports.joinAction = function(req, res) {

    req.check(`title`,`Please enter your title`).isLength({min:2,max:4});
    req.check(`first_name`, `Please enter your first name`).isLength({min:1,max:60});
    req.check(`last_name`,`Please enter your last name`).isLength({min:1,max:60});
    req.check(`email`,`Please enter a valid email`).isEmail();
    req.check(`password`,`Password must be at least 6 characters long`).isLength({min:6,max:60});

    let errors = req.validationErrors();

    if (errors) {
        res.status(200).json({
            error: errors
        });
        // req.flash('join_msg', errors);
    }else{
        users.getUserByEmail(req).then((user_obj)=>{

            const saltRounds = 15;
            const myPlaintextPassword = req.body.password;
            bcrypt.hash(myPlaintextPassword, saltRounds).then(function(hash) {

                if (user_obj.hits.total===0) {

                    // Store hash in your password DB.

                    req.body.password = hash;

                    users.addNewUser(req).then((new_user_obj)=>{

                        req.activation_code = new_user_obj._id;

                        users.addActivationCode(req).then(()=>{

                            emails.sendAccountActivationEmail(req).then(()=>{

                            })

                        }).catch(err => console.error(err))

                        res.status(200).json({
                            body: req.body
                        });
                    }).catch(err => console.error(err))

                }else{
                    res.status(200).json({
                        error: [
                            {
                                param:`email`,
                                msg:`User with the same email address already exists.`
                            }
                        ]
                    });
                }
            }).catch(err => console.error(err))

        }).catch(err => console.error(err))
    }
};
exports.activationAction = function(req, res) {
    users.activateUser(req).then(()=>{
        res.redirect(`/`);
    }).catch(err => console.error(err))
};
exports.logoutAction = function(req, res) {
    if (req.session.isLoggedin) {
        req.session.isLoggedin = false;
        req.session.body = {};
    }
        res.redirect(`/`);
};
exports.loginAction = function(req, res) {

    req.check(`email`,`Please enter a valid email address`).isEmail();
    req.check(`password`,`Your password must be at least 6 characters long`).isLength({min:6,max:60});

    // console.log(req.body);

    let errors = req.validationErrors();

    if(errors){
        res.status(200).json({
            error: errors
        });
    }else{
        users.getUserByEmail(req).then((user_obj)=>{
            if (user_obj.hits.total>0&&!_.isEmpty(user_obj.hits.hits[0]._source.activation_code)){
                res.status(200).json({
                    error: [
                        {
                            param:`email`,
                            msg:`Please logon into your email to activate your account.`
                        }
                    ]
                });
            } else if (user_obj.hits.total>0) {

                bcrypt.compare(req.body.password, user_obj.hits.hits[0]._source.passwd, function(err, res2) {

                    if (res2===true) {

                        req.session.isLoggedin=true;
                        req.session.body = user_obj.hits.hits[0]._source;
                        req.session.body.id = user_obj.hits.hits[0]._id;

                        res.status(200).json({
                            body: req.body
                        });

                    }else{
                        res.status(200).json({
                            error: [
                                {
                                    param:`email`,
                                    msg:`Invalid email or password provided.`
                                }
                            ]
                        });
                    }

                });
            }else{
                res.status(200).json({
                    error: [
                        {
                            param:`email`,
                            msg:`Invalid email or password provided.`
                        }
                    ]
                });
            }
        }).catch(err => console.error(err))
    }
};

exports.paypalPaymentCancellationAction = (req, res) => {
    if (req.session.cart_obj.hits.total>0) {

    } else {

    }
};
exports.paypalPaymentConfirmationAction = (req, res) => {
    if (req.session.cart_obj.hits.total>0) { //wrong look for paypal id
        if (!_.isEmpty(req.query) && !_.isEmpty(req.query.paymentId)) {
            const p_token = req.query.p_token;

            paypalModal.getPayPalCheckoutInformationById(req, p_token).then((response) => {

                if (response.hits.total > 0) {

                    const paypal_payment_id = response.hits.hits[0]._source.paypal_payment_id;

                    if (paypal_payment_id===req.query.paymentId) {

                        cart.getCartItemsByUserId(req).then((cartResponse)=>{

                            order.getOrderByPaymentId(req, p_token).then((response) => {

                                if (response.hits.total === 0) {

                                    order.addNewOrder(req, cartResponse, 'payment', p_token).then((response) => {

                                        if (!_.isEmpty(response)) {

                                            const order_id = response._id;

                                            paypalModal.updatePayPalCheckoutStatusAndOrderId(req, p_token, 'payment_confirmed', order_id).then(() => {

                                                order.updateOrderStatus(req, order_id, 6).then(() => {

                                                    products.updateProductOrderCounts(req, cartResponse).then(() => {

                                                        cart.deleteCartByIds(req, cartResponse).then(() => {

                                                            const msg = {
                                                                message: `THANKS for your order. Order files are listed below.`,
                                                                type: `payment`,
                                                                class: `success`,
                                                            };

                                                            req.flash('payment_confirmed', msg);

                                                            res.redirect(`${req.BASE_URL}/profile`);

                                                        }).catch(() => {

                                                            res.status(402).json({
                                                                error,
                                                                error_code: `Error code 39849093`,
                                                            });

                                                        });

                                                    }).catch((error) => {
                                                        res.status(402).json({
                                                            error,
                                                            error_code: `Error code 84983782`,
                                                        });
                                                    });

                                                }).catch((error) => {
                                                    res.status(402).json({
                                                        error,
                                                        error_code: `Error code 98409849`,
                                                    });
                                                });

                                            }).catch((error) => {
                                                res.status(402).json({
                                                    error,
                                                    error_code: `Error code 84983782`,
                                                });
                                            });

                                        } else {
                                            res.status(402).json({
                                                error: `Error 29080388! Could not add new order.`
                                            });
                                        }

                                    }).catch((error) => {
                                        res.status(402).json({
                                            error,
                                            error_code: `Error code 30498892`,
                                        });
                                    });

                                } else {
                                    res.status(402).json({
                                        error: `WARNING! Order already added`,
                                    });
                                }

                            }).catch((error) => {
                                res.status(402).json({
                                    error,
                                    error_code: `Error code 12939894`,
                                });
                            });

                        }).catch((error) => {

                        });

                    } else {
                        res.status(402).json({
                            error: `Error 39848029! Invalid payment paymentId [${req.query.paymentId}] provided. payment ID store is [${paypal_payment_id}]`
                        });
                    }

                } else {
                    res.status(402).json({
                        error: `Error 28738737! No payment matching p_token ${p_token}`
                    });
                }

            }).catch((error) => {
                res.status(402).json({
                    error
                });
            });
        } else {
            res.status(402).json({
                error: `Error 209930929! No paymentId get parameter provided.`
            });
        }
    } else {
        res.redirect(`${req.BASE_URL}/profile`);
    }
};

exports.paypalCheckoutAction = (req, res) => {

    if (req.session.cart_obj.hits.total>0&&req.session.isLoggedin) {

        let total_cost = 0;
        let tmp_total_cost = 0;
        let offer_price = 0;
        let built_price = 0;
        let hosting_price = 0;

        let itemsPurchased = [];

        cart.synchronizeCart(req).then(() => {

            req.session.cart_obj.hits.hits.forEach((cart_obj) => {
                offer_price = cart_obj._source.offer_price;
                built_price = cart_obj._source.built_price;
                hosting_price = cart_obj._source.hosting_price;
                total_cost += parseFloat(offer_price) + parseFloat(built_price) + parseFloat(hosting_price);
                tmp_total_cost = parseFloat(offer_price) + parseFloat(built_price) + parseFloat(hosting_price);

                itemsPurchased.push({
                    "name": cart_obj._source.product_name,
                    "sku": "item",
                    "price": tmp_total_cost,
                    "currency": "USD",
                    "quantity": 1
                });
            });

            paypal.configure({
                'mode': 'sandbox', //sandbox or live
                'client_id': 'AQdBXy0TI5xDXwGlVXI9XzZPyD_vOSh-tdu9oTs-xN6PcwYsaMYgBIFdpk2pVSiM42bgNag-O9Q3cwKN',
                'client_secret': 'EGxFvScSGkq932JRwhOAzyuKDn3yfIYMYwNvdJk-I_FPOLFsj2yKTwFBUI0v2s8mF8KfUUyhGT2sojTr'
            });


            paypalModal.addPayPalCheckoutInformation(req, {}).then((response) => {

                const p_token = response._id;

                let create_payment_json = {
                    "intent": "sale",
                    "payer": {
                        "payment_method": "paypal"
                    },
                    "redirect_urls": {
                        "return_url": `${req.BASE_URL}/paypal-payment-confirmation?p_token=${p_token}`,
                        "cancel_url": `${req.BASE_URL}/paypal-payment-cancellation?p_token=${p_token}`
                    },
                    "transactions": [{
                        "item_list": {
                            "items": itemsPurchased
                        },
                        "amount": {
                            "currency": "USD",
                            "total": currencyFormatter.format(total_cost, { code: 'USD' }).replace('$','')
                        },
                        "description": "Grid websites payment."
                    }]
                };

                paypal.payment.create(create_payment_json, function (error, payment) {
                    if (error) {
                        res.status(402).json({
                            error: error
                        });
                    } else {

                        console.log("Create Payment Response");
                        // console.log(payment);
                        /**
                         * Store payment in elastic with payment_status pending
                         */
                        paypalModal.updatePayPalCheckoutInformation(req, p_token, payment).then((response) => {
                            payment.links.forEach((item) => {
                                if (item.method.trim().toLowerCase() === 'redirect') {
                                    res.redirect(item.href);
                                }
                            });
                        }).catch((errors) => {
                            res.status(402).json({
                                error: `Elastic update error 4897949! ${errors}`
                            });
                        });
                    }
                });

            }).catch((errors) => {
                res.status(402).json({
                    error: errors
                });
            });
        }).catch((error) => {
            res.status(402).json({
                error: errors
            });
        });

    } else {
        res.redirect(`/`);
    }

};

exports.removeReviewReplyAction = function(req, res) {

    req.check(`review_reply_id`, `Invalid review reply id`).isLength({min:1,max:100});

    let errors = req.validationErrors();

    if (!req.session.isLoggedin) {
        res.status(200).json({
            error: [
                {
                    param:`comment`,
                    msg:`Invalid login details.`
                }
            ]
        });
    }else if(errors){
        res.status(200).json({
            error: errors
        });
    }else{

        replies.getReviewReplyById(req).then((res2)=>{

            if (res2.hits.total>0&&res2.hits.hits[0]._source.user_id===req.session.body.id) {

                replies.deleteReview(req).then((res3)=>{
                    res.status(200).json({
                        body: req.body,
                    });
                },(error)=>{
                    console.trace(error.message)
                }).catch(err => console.error(err));;

            } else {
                res.status(200).json({
                    error: [
                        {
                            param:`comment`,
                            msg:`Error occurred we could not find your details.`
                        }
                    ]
                });
            }
        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err));
    }

};

exports.removeReviewAction = function(req, res) {

    req.check(`review_id`, `Invalid review id`).isLength({min:1,max:100});

    let errors = req.validationErrors();

    if (!req.session.isLoggedin) {
        res.status(200).json({
            error: [
                {
                    param:`comment`,
                    msg:`Invalid login details.`
                }
            ]
        });
    }else if(errors){
        res.status(200).json({
            error: errors
        });
    }else{

        reviews.getReviewByID(req).then((res2)=>{

            if (res2.hits.total>0&&res2.hits.hits[0]._source.user_id===req.session.body.id) {

                req.body.ref = res2.hits.hits[0]._source.product_id;

                reviews.getAllProductReviews(req).then((res2)=> {

                    req.reviews_obj = res2;
                    req.current_review_total = res2.hits.total - 1;

                    let total_ratings = 0;

                    req.reviews_obj.hits.hits.forEach((review_obj) => {

                        if(req.body.review_id !== review_obj._id){

                            total_ratings += parseInt(review_obj._source.rating);
                        }
                    });

                    req.rating_average = parseInt(total_ratings / req.current_review_total);

                    reviews.addReviewsOnProducts(req).then(() => {

                        reviews.deleteReview(req).then((res2) => {
                            res.status(200).json({
                                body: req.body,
                            });
                        },(error)=>{
                            console.trace(error.message)
                        }).catch(err => console.error(err));
                    },(error)=>{
                        console.trace(error.message)
                    }).catch(err => console.error(err));
                },(error)=>{
                    console.trace(error.message)
                }).catch(err => console.error(err));

            } else {
                res.status(200).json({
                    error: [
                        {
                            param:`comment`,
                            msg:`Error occurred we could not find your details.`
                        }
                    ]
                });
            }
        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err));
    }

};

exports.saveReviewReplyAction = function(req, res) {

    req.check(`review_id`, `Invalid review id`).isLength({min:1,max:100});
    req.check(`name`,`Please enter your reply`).isLength({min:1});
    req.check(`ref`,`Invalid ref`).isLength({max:100});


    let errors = req.validationErrors();

    if (!req.session.isLoggedin) {
        res.status(200).json({
            error: [
                {
                    param:`comment`,
                    msg:`Invalid login details.`
                }
            ]
        });
    }else if(errors){
        res.status(200).json({
            error: errors
        });
    }else{

        req.params.id = req.body.ref;

        products.getMyProductByID(req).then((res2)=>{
            if (res2.hits.total>0) {

                replies.getAllReviewReplies(req).then((res3)=>{

                    req.product_obj = res2;
                    req.review_replies_obj = res3;
                    req.current_total_replies = res3.hits.total + 1;

                    reviews.getReviewByID(req).then((res4) => {

                        if (res4.hits.total>0) {

                            replies.addReviewReply(req).then((res5)=>{

                                emails.sendReviewReplyEmail(req).then(()=>{
                                    res.status(200).json({
                                        body: req.body,
                                        reviewer_name: `${req.session.body.first_name} ${req.session.body.last_name.substring(0,1)}`,
                                        date_created: req.dateS,
                                        profile_img:req.session.body.profile_img?req.session.body.profile_img:'user.svg',
                                        review_replies_id: `${res5._id}`,
                                        review: `${req.body.name}`,
                                        is_User_cont: '<input onclick="reviews.removeReviewReply(\''+req.params.id+'\')" type="button" value="Remove review">',
                                    });
                                },(error)=>{
                                    console.trace(error.message)
                                }).catch(err => console.error(err));

                            },(error)=>{
                                console.trace(error.message)
                            }).catch(err => console.error(err));

                        } else {
                            res.status(200).json({
                                error: [
                                    {
                                        param:`comment`,
                                        msg:`Error occurred we could not find the selected review.`
                                    }
                                ]
                            });
                        }
                    },(error)=>{
                        console.trace(error.message)
                    }).catch(err => console.error(err));
                },(error)=>{
                    console.trace(error.message)
                }).catch(err => console.error(err));
            } else {
                res.status(200).json({
                    error: [
                        {
                            param:`comment`,
                            msg:`Error occurred we could not find the select products.`
                        }
                    ]
                });
            }
        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err));
    }
};

exports.saveReviewAction = function(req, res) {

    req.check(`rate_input`,`Please select ratings`).isLength({min:1});
    req.check(`comment`,`Please enter your review`).isLength({min:1});
    req.check(`ref`,`Invalid page route`).isLength({min:2});

    let errors = req.validationErrors();

    if (!req.session.isLoggedin) {
        res.status(200).json({
            error: [
                {
                    param:`comment`,
                    msg:`Invalid login details.`
                }
            ]
        });
    }else if(errors){
        res.status(200).json({
            error: errors
        });
    }else{

        req.params.id = req.body.ref;

        products.getMyProductByID(req).then((res2)=>{
            if (res2.hits.total>0) {

                reviews.getAllProductReviews(req).then((res3)=>{

                    req.product_obj = res2;
                    req.reviews_obj = res3;
                    req.current_review_total = res3.hits.total + 1;



                    let total_ratings = parseInt(req.body.rate_input)<=5?parseInt(req.body.rate_input):5;

                    req.reviews_obj.hits.hits.forEach((review_obj) => {
                        total_ratings += parseInt(review_obj._source.rating);
                    });

                    req.rating_average = parseInt(total_ratings / req.current_review_total);

                    reviews.addUserReview(req).then((res2)=>{

                        let rating_stars = '';

                        let j = 0;

                        for(let i = 0; i < req.body.rate_input; i++){
                            rating_stars += '<img' +
                                ' src="/img/icon/mark-as-favorite-star.svg" width="18" alt="star ratings">';
                            j++;
                        }
                        while(j<5){
                            rating_stars += '<img' +
                                ' src="/img/icon/mark-as-favorite-star1.svg" width="18" alt="star ratings">';
                            j++;
                        }

                        reviews.addReviewsOnProducts(req).then(()=>{
                            res.status(200).json({
                                body: req.body,
                                reviewer_name: `${req.session.body.first_name} ${req.session.body.last_name.substring(0,1)}`,
                                date_created: req.dateS,
                                review_id:res2._id,
                                profile_img:req.session.body.profile_img?req.session.body.profile_img:'user.svg',
                                ratings: req.body.rate_input,
                                review: req.body.comment,
                                rating_stars: rating_stars,
                            });
                        },(error)=>{
                            console.trace(error.message)
                        }).catch(err => console.error(err));

                    },(error)=>{
                        console.trace(error.message)
                    }).catch(err => console.error(err))
                },(error)=>{
                    console.trace(error.message)
                }).catch(err => console.error(err));
            } else {
                res.status(200).json({
                    error: [
                        {
                            param:`comment`,
                            msg:`Error occurred we could not find the select products.`
                        }
                    ]
                });
            }
        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err));
    }

};

exports.saveAccountDetailsAction = function(req, res) {
    req.check(`title`,`Please enter title`).isLength({min:2,max:4});
    req.check(`username`, `Please enter your username`).isLength({min:1,max:60});
    req.check(`first_name`, `Please enter your first name`).isLength({min:1,max:60});
    req.check(`last_name`,`Please enter your last name`).isLength({min:1,max:60});

    req.check(`country`,`Please select Country`).isLength({min:1,max:60});

    let errors = req.validationErrors();

    if (!req.session.isLoggedin) {
        res.status(200).json({
            error: [
                {
                    param:`first_name`,
                    msg:`Invalid login details.`
                }
            ]
        });
    }else if(errors){
        res.status(200).json({
            error: errors
        });
    }else {
        users.updateAccountDetails(req).then((res2)=>{
            res.status(200).json({
                body: req.body,
                res:res2
            });
        }).catch(err => console.error(err))
    }
};
exports.saveTemplateImageAction = function(req, res) {

    req.check(`image_data`,`Please select template image`).isLength({min:1});
    req.check(`ref`,`Invalid ref`).isLength({max:100});

    let errors = req.validationErrors();

    if (!req.session.isLoggedin) {
        res.status(200).json({
            error: [
                {
                    param:`image_data`,
                    msg:`Invalid login details.`
                }
            ]
        });
    }else if(errors){
        res.status(200).json({
            error: errors
        });
    }else{

        req.params.id = req.body.ref;

        products.getMyProductByID(req).then((product_obj_req)=>{

            if(product_obj_req.hits.total>0&&product_obj_req.hits.hits[0]._source.supplier===req.session.body.id){

                req.product_obj_req = product_obj_req;


                products.getUserTemplateImagesByTemplateId(req).then((product_res) => {

                    if (product_res.hits.total < 6) {

                        req.sort = product_res.hits.total + 1
                        req.name = product_obj_req.hits.hits[0]._source.name+`-${utility.getDateAsNumber()}`;
                        req.name = req.name.toString().replace(/'/g, ''.replace(/ /g, '-'));

                        products.addNewProductImageToDB(req).then((res2) => {

                            products.addNewProductImageToFile(req).then(()=>{
                                res.status(200).json({
                                    body: req.body,
                                    new_image:`${req.name}.png`,
                                });
                            }).catch(err => console.error(err))
                        },(error)=>{
                            console.trace(error.message)
                        }).catch(err => console.error(err));
                    } else {
                        res.status(200).json({
                            error: [
                                {
                                    param:`image_data`,
                                    msg:`You can only add maximum of 6 images. Please delete some images to add new ones.`
                                }
                            ]
                        });
                    }
                },(error)=>{
                    console.trace(error.message)
                }).catch(err => console.error(err));
            }else{
                res.status(200).json({
                    error: [
                        {
                            param:`image_data`,
                            msg:`We could not find the template specified.`
                        }
                    ]
                });
            }
        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err));
    }
};

exports.saveTemplateAction = function(req, res) {

    console.log(req.body);
    req.check(`name`,`Please enter template name`).isLength({min:2,max:200});
    req.check(`language`,`Please select language`).isLength({min:2,max:100});
    req.check(`ref`,`Invalid ref`).isLength({max:100});
    req.check(`price`, `Please enter a valid format i.e 59.99`).isLength({min:1,max:10});
    req.check(`discount_price`, `Please enter a valid format i.e 59.99`).isLength({min:1,max:10});
    req.check(`built_price`, `Please enter a valid format i.e 59.99`).isLength({min:1,max:10});
    req.check(`hosting_price`,`Please enter a valid format i.e 59.99`).isLength({min:1,max:10});

    req.check(`category`,`Please select categories`).isLength({min:1});
    req.check(`type`,`Please select type`).isLength({min:1});
    req.check(`features`,`Please select features`).isLength({min:1});
    req.check(`code_quality`,`Please enter code quality`).isLength({min:1});
    req.check(`description`,`Please enter description`).isLength({min:1});

    let errors = req.validationErrors();

    if (!req.session.isLoggedin) {
        res.status(200).json({
            error: [
                {
                    param:`name`,
                    msg:`Invalid login details! Please reload your browser.`
                }
            ]
        });
    }else if(errors){
        res.status(200).json({
            error: errors
        });
    }else{
        products.searchUserProductsById(req).then((product_res) => {
            if (_.isEmpty(product_res)||product_res.hits.total===0||
                product_res.hits.hits[0]._source.supplier !== req.session.body.id) {
                products.addNewProduct(req).then((res2)=>{
                    res.status(200).json({
                        body: req.body,
                        ref:res2._id,
                    });
                }).catch(err => console.error(err))
            } else if (product_res.hits.hits[0]._source.supplier === req.session.body.id) {
                products.updateProductDetails(req).then((res2)=>{
                    res.status(200).json({
                        body: req.body,
                        ref:req.body.ref
                    });
                }).catch(err => console.error(err))
            } else {
                res.status(200).json({
                    error: [
                        {
                            param:`name`,
                            msg:`Invalid product id.`
                        }
                    ]
                });
            }
        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err));
    }
};


exports.sendContactUsMessage = function(req, res) {

    req.check(`title`,`Please enter your title`).isLength({min:2,max:4});
    req.check(`first_name`, `Please enter your first name`).isLength({min:1,max:60});
    req.check(`last_name`,`Please enter your last name`).isLength({min:1,max:60});
    req.check(`email`,`Please enter a valid email`).isEmail();
    req.check(`mobile`,`Please enter a valid mobile number. i.e. 07457528436`).isLength({min:11,max:20});
    req.check(`message`,`Please enter message`).isLength({min:1,max:500});

    let errors = req.validationErrors();

    if(errors){
        res.status(200).json({
            error: errors
        });
    }else{
        emails.sendContactUsEmail(req).then(() => {
            res.status(200).json({
                body: [],
                ref:'sent',
            });
        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err));
    }
};

exports.deleteTemplateImageAction = function(req, res) {

    req.check(`image_id`,`Please select template image id`).isLength({min:2,max:100});

    let errors = req.validationErrors();

    if (!req.session.isLoggedin) {
        res.status(200).json({
            error: [
                {
                    param:`name`,
                    msg:`Invalid login details.`
                }
            ]
        });
    }else if(errors){
        res.status(200).json({
            error: errors
        });
    }else{
        products.deleteProductImage(req).then((res2)=>{
            res.status(200).json({
                res:res2
            });
        }).catch(err => {
            res.status(401).json({
                res:err
            });
            console.error(err)
        });
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


exports.saveCartAction = function(req, res) {

    if (_.isEmpty(req.cookies.cookieName)) {
        utility.setCartCookie(req, res);
    }
    req.check(`order`,`Please select order`).isLength({min:1});
    req.check(`ref`,`No Item selected`).isLength({min:1});

    let errors = req.validationErrors();

    if(errors){
        res.status(200).json({
            error: errors
        });
    }else if (!req.session.isLoggedin) {
        utility.processCart(req, res);
    }else{

        cart.updateOfflineCartItems(req).then(()=>{

            cart.updateOfflineCartCookie(req).then(()=>{

                utility.processCart(req, res);

            },(error)=>{
                console.trace(error.message)
            }).catch(err => console.error(err));

        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err));
    }
};

exports.modifyCartAction = function(req, res) {

    req.check(`action`,`Invalid action`).isLength({min:1,max:10});
    req.check(`ref`,`Please select item to remove`).isLength({min:1});

    let errors = req.validationErrors();

    if(errors){
        res.status(200).json({
            error: errors
        });
    }else{

        cart.getCartById(req).then((res2)=>{

            if(!_.isEmpty(req.cookies.cookieName)&&res2.hits.total>0 && res2.hits.hits[0]._source.cart_cookie===req.cookies.cookieName){
                cart.getCartItemsByCookieIdEx(req,res).then((res3)=>{

                    let tmp_cart_obj = [];

                    res3.hits.hits.map((cart_obj)=>{
                        if(cart_obj._id !== req.body.ref){
                            tmp_cart_obj.push({
                                _id: cart_obj._id,
                                cart_cookie: cart_obj._source.cart_cookie,
                                cart_version: cart_obj._source.cart_version,
                                product_id: cart_obj._source.product_id,
                                user_id: cart_obj._source.user_id,
                                price: cart_obj._source.price,
                                offer_price: cart_obj._source.offer_price,
                                quantity: cart_obj._source.quantity,
                                build_option: cart_obj._source.build_option,
                                build_price: cart_obj._source.build_price,
                                offer: cart_obj._source.offer,
                                image1: cart_obj._source.image1,
                                product_name: cart_obj._source.product_name,
                                main_category: cart_obj._source.main_category,
                                date_created: cart_obj._source.date_created,
                                date_last_updated: cart_obj._source.date_last_updated
                            });
                        }
                    });

                    cart.deleteCartItem(req).then(()=>{
                        res.status(200).json({
                            body: req.body,
                            cart_obj: tmp_cart_obj
                        });
                    },(error)=>{
                        console.trace(error.message)
                    }).catch(err => console.error(err));

                },(error)=>{
                    console.trace(error.message)
                }).catch(err => console.error(err));
            } else {
                res.status(200).json({
                    error: [
                        {
                            param:`action`,
                            msg:`Something went wrong please make sure you are selecting the write item.`
                        }
                    ]
                });
            }
        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err));
    }
};


exports.saveNotificationsAction = function(req, res) {

    req.check(`email`,`Please enter a valid email`).isEmail();
    req.check(`mobile`,`Please enter a valid mobile number. i.e. 07457528436`).isLength({min:11,max:20});

    let errors = req.validationErrors();

    if (!req.session.isLoggedin) {
        res.status(200).json({
            error: [
                {
                    param:`first_name`,
                    msg:`Invalid login details.`
                }
            ]
        });
    }else if(errors){
        res.status(200).json({
            error: errors
        });
    }else {
        users.updateAccountNotificationsDetails(req).then((res2)=>{
            res.status(200).json({
                body: req.body,
                res:res2
            });
        }).catch(err => console.error(err))
    }
};


exports.savePasswordAction = function(req, res) {

    req.check(`new_password`,`Password must be at least 6 characters long`).isLength({min:6,max:60});
    req.check(`new_password`,`Confirm new password has to must New Password`).equals(req.body.confirm_password);

    let errors = req.validationErrors();

    if (!req.session.isLoggedin) {
        res.status(200).json({
            error: [
                {
                    param:`new_password`,
                    msg:`Invalid login details.`
                }
            ]
        });
    }else if(errors){
        res.status(200).json({
            error: errors
        });
    }else {
        users.getUserById(req).then((res_user_obj)=>{

            bcrypt.compare(req.body.old_password, res_user_obj.hits.hits[0]._source.passwd, function(err, res2) {

                if (res2===true) {

                    const saltRounds = 15;
                    const myPlaintextPassword = req.body.new_password;

                    bcrypt.hash(myPlaintextPassword, saltRounds).then(function(hash) {

                        req.body.password = hash;

                        users.updateAccountPassword(req).then(()=>{
                            res.status(200).json({
                                body: req.body
                            });
                        }).catch(err => console.error(err))
                    }).catch(err => console.error(err))

                }else{
                    res.status(200).json({
                        error: [
                            {
                                param:`email`,
                                msg:`Invalid old password provided.`
                            }
                        ]
                    });
                }

            });
        }).catch(err => console.error(err))
    }
};

exports.saveLanguagePackAction = function(req, res) {

    req.check(`language_field`,'Invalid language value').isLength({min:1,max:60});
    req.check(`language_code_field`,'Invalid language code only 2 values allowed').isLength({min:2,max:2});
    req.check(`templates_field`,'Invalid templates value').isLength({min:1,max:60});
    req.check(`themes_field`,'Invalid themes value').isLength({min:1,max:60});

    let errors = req.validationErrors();
    let get_pram = ``;

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
