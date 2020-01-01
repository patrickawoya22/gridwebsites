const _ = require(`lodash`);
const products = require(`../../Products`);
const emails = require(`../../Emails`);
const reviews = require(`../../Reviews`);
const cart = require(`../../Cart`);
const currencyFormatter = require('currency-formatter');
const order = require('../../Order');
const file = require('../../File');

exports.indexAction = function(req, res) {

    let products = require(res.modulePath+`/app/Products`);
    req.from = 0;
    req.size = 3;
    req.category = `Foundation`;

        products.getProducts(req).then((foundation_templates)=>{
            // console.log(foundation_templates);
            res.render(`index`,{
                showTitle: false,
                searchAction:`search`,
                req,
                indexJs:true,
                foundation_templates,
                // bootstrap_templates: products.getTemplates(req,`bootstrap`),
                // website_design: products.getTemplates(req,`bootstrap`),
                // email_templates: products.getTemplates(req,`email`)
            });
        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err));
};

exports.productJsonAction = function(req, res) {

    products.getAutoCompleteProducts(req).then((productJson) => {

        res.status(200).json({
            suggestions:productJson
        });

    }).catch((error) => {
        res.status(402).json({
            error: error
        });
    });

};

exports.productAction = function(req, res) {

    products.getMyProductByID(req).then((product_obj)=>{

        req.body.ref = product_obj.hits.hits[0]._id;

        req.from = 0;
        req.size = 20;

        reviews.searchProductReviews(req).then((res2)=>{

            const ogUrl = `${req.customBaseURI}product/${product_obj.hits.hits[0]._source.name.replace(/ /g, '+')}/${product_obj.hits.hits[0]._id}`;
            const ogType = 'website';
            const ogTitle = product_obj.hits.hits[0]._source.name;
            const ogDescription = product_obj.hits.hits[0]._source.description;
            const ogImage = `${req.customBaseURI}img/project/img-origin/${product_obj.hits.hits[0]._source.image_obj.hits.hits[0]._source.name}`;

            if (product_obj.hits.total>0){
                res.render(`product`,{
                    showTitle: true,
                    req,
                    successMgs:'<div class="callout success" style="border-radius: .3rem;">Your account Notifications' +
                        ' details are update successfully.</div>',
                    product_obj,
                    searchAction:`/search`,
                    reviews_obj:res2,
                    ogUrl,
                    ogType,
                    ogTitle,
                    ogDescription,
                    ogImage,
                    productJs: true,
                    title:product_obj.hits.hits[0]._source.name
                });
            }else{
                res.redirect(`/`);
            }
        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err));
    },(error)=>{
        console.trace(error.message)
    }).catch(err => console.error(err));
};


exports.searchAction = function(req, res) {

    // let search = require(res.modulePath+`/app/Search`);


    let minPrice = 0;
    let maxPrice = 400;
    let selected_minPrice = minPrice;
    let selected_maxPrice = maxPrice-10;



    if (!_.isEmpty(req.query.price) && req.query.price.match(`-`)!=null){
        let tmp_price = req.query.price.split(`-`);
        selected_minPrice = tmp_price[0];
        selected_maxPrice = tmp_price[1];
    }

    products.searchProducts(req).then((searchResults) => {

        const categoriesObj = products.getCategoriesFromSearchedResults(searchResults,req);

        const exportScripts = `<script type='text/javascript' src='/js/jquery.range-min.js'></script>`;
        const exportStyles = `<link href='/css/jquery.range.css' media='screen' rel='stylesheet' type='text/css'>`;

        const inlineScripts = `$('.range-slider').jRange({ondragend:function(){controller.loadUrl()},from:${minPrice},to: ${maxPrice},step: 1,scale: [${minPrice},${maxPrice}],format: '%s',width: 300,showLabels: true, showScale:true, snap:false,  isRange : true});$('.range-slider').jRange('setValue', '${selected_minPrice},${selected_maxPrice}');`;

        if (req.query.sort==``||req.query.sort==`undefined`||typeof req.query.sort == `undefined`) {
            req.query.sort = `Relevance`;
        }

        res.render(`search`,{
            showTitle: true,
            searchJs: true,
            searchResults: searchResults,
            categories: categoriesObj,
            maxPrice: 70,
            searchAction:`search`,
            inlineScripts:inlineScripts,
            exportScripts:exportScripts,
            exportStyles:exportStyles,
            req:req,
            title:`Search`
        });
    }).catch((error) => {
        console.log(error);
        res.status(400).json({
            error: error
        });
    });

};


exports.themesAction = function(req, res) {

    //https://www.npmjs.com/package/express-paginate
    // console.log(`Paginate limit: `, req.query.limit, `Paginate offset: `, req.skip);

    let title = '';

    if (!_.isEmpty(req.params.id2)) {
        title = _.startCase(_.toLower(req.params.id2));
    }else {
        title = _.startCase(_.toLower(req.params.id));
    }

    let searchAction = ``;

    if (_.isEmpty(title)) {
        title = `Templates / Themes`;
        searchAction = `/themes`
    }
    if (_.toLower(title)===`foundation`) {
        title=`Foundation 6 Grid XY`;
    }else if (_.toLower(title)===`bootstrap`) {
        title = `Bootstrap 4`;
    }
    if (_.isEmpty(req.query.q)) {
        req.query.q = title;
    }

    let search = require(res.modulePath+`/app/Search`);

    let minPrice = 0;
    let maxPrice = 100;
    let selected_minPrice = 20;
    let selected_maxPrice = 20;

    req.from = 0;
    req.size = 1999;
    req.category = '';



    if (!_.isEmpty(req.query.price) && req.query.price.match(`-`)!=null){
        let tmp_price = req.query.price.split(`-`);
        selected_minPrice = tmp_price[0];
        selected_maxPrice = tmp_price[1];
    }

    let exportScripts = `<script type='text/javascript' src='/js/jquery.range-min.js'></script>`;
    let exportStyles = `<link href='/css/jquery.range.css' media='screen' rel='stylesheet' type='text/css'>`;

    let inlineScripts = `$('.range-slider').jRange({ondragend:function(){controller.loadUrl()},from:${minPrice},to: ${maxPrice},step: 1,scale: [${minPrice},${maxPrice}],format: '%s',width: 300,showLabels: true, showScale:true, snap:false,  isRange : true});$('.range-slider').jRange('setValue', '${selected_minPrice},${selected_maxPrice}');`;

    if (req.query.sort==``||req.query.sort==`undefined`||typeof req.query.sort == `undefined`) {
        req.query.sort = `Relevance`;
    }

    products.searchProducts(req).then((products_obj) => {

        console.log(products_obj);
        res.render(`search`,{ //themes
            showTitle: true,
            searchResults: products_obj,
            // categories: search.getCategoriesFromSearchedResults(searchResults,req),
            categories: [],
            maxPrice: 70,
            searchAction:searchAction,
            inlineScripts:inlineScripts,
            exportScripts:exportScripts,
            exportStyles:exportStyles,
            req:req,
            title:title
        });

    }).catch(err => console.error(err));
};


exports.membersAction = function(req, res) {

    //https://www.npmjs.com/package/express-paginate
    // console.log(`Paginate limit: `, req.query.limit, `Paginate offset: `, req.skip);

    let title = '';

    if (!_.isEmpty(req.params.id2)) {
        title = _.startCase(_.toLower(req.params.id2))+` - Developers`;
    }else {
        title = _.startCase(_.toLower(req.params.id));
    }

    let searchAction = ``;

    if (_.isEmpty(title)) {
        title = `Members / Developers`;
        searchAction = `/members`
    }

    let title_lower = _.toLower(title);

    if (title_lower===`php`||title_lower===`css`) {
        title=_.upperCase(title)+` - Developers`;
    }else if (title_lower===`wordpress`) {
        title = 'WordPress - Developers'
    }else if (title_lower===`javascript`) {
        title = `JavaScript - Developers`;
    }
    if (_.isEmpty(req.query.q)) {
        req.query.q = title;
    }

    let search = require(res.modulePath+`/app/Search`);

    searchResults = search.getSearchResults(req);

    if (req.query.sort==``||req.query.sort==`undefined`||typeof req.query.sort == `undefined`) {
        req.query.sort = `Relevance`;
    }

    res.render(`members`,{
        showTitle: true,
        searchResults: searchResults,
        categories: search.getFromSearchQueryCategories(searchResults,req),
        searchAction:searchAction,
        req:req,
        title:title
    });
};


// exports.contactSellerAction = function(req, res) {
//
//     req.check(`title`,`Please select your title`).isLength({min:2,max:4});
//     req.check(`name`, `Please enter your full name`).isLength({min:1,max:100});
//     req.check(`email`,`Please enter a valid email`).isEmail();
//     req.check(`mobile`,`Please enter a valid mobile number. i.e. 07457528436`).isLength({min:11,max:20});
//     req.check(`message`,`Please enter your message`).isLength({min:1});
//     req.check(`ref`,`Invalid page route`).isLength({min:2});
//
//     let errors = req.validationErrors();
//
//     if(errors){
//         res.status(200).json({
//             error: errors
//         });
//     }else{
//
//         req.params.id = req.body.ref;
//
//         products.getMyProductByID(req).then((res2)=>{
//
//             req.products_obj = res2;
//
//             emails.sendContactSellerEmail(req).then(()=>{
//                 res.status(200).json({
//                     body: req.body,
//                 });
//             },(error)=>{
//                 console.trace(error.message)
//             }).catch(err => console.error(err));
//
//         },(error)=>{
//             console.trace(error.message)
//         }).catch(err => console.error(err));
//     }
// };

exports.removeReviewAction = function(req, res) {

    req.check(`review_id`,`Invalid product id`).isLength({min:1,max:100});
    req.check(`action`, `Invalid action`).isLength({min:1,max:20});
    req.check(`page_route`,`Invalid page route`).isLength({min:2});

    let errors = req.validationErrors();

    if (errors) {

        req.flash('remove_review_msg', errors);
    }
    //Redirect back to the previous page
    res.redirect(req.body.page_route);
};

exports.creativesAction = function(req, res) {

    //https://www.npmjs.com/package/express-paginate
    // console.log(`Paginate limit: `, req.query.limit, `Paginate offset: `, req.skip);

    let title = '';

    if (!_.isEmpty(req.params.id2)) {
        title = _.startCase(_.toLower(req.params.id2));
    }else {
        title = _.startCase(_.toLower(req.params.id));
    }

    let searchAction = ``;

    if (_.isEmpty(title)) {
        title = `Members / Developers`;
        searchAction = `/members`
    }

    let title_lower = _.toLower(title);

    if (title_lower===`php`||title_lower===`css`) {
        title=_.upperCase(title);
    }else if (title_lower===`wordpress`) {
        title = 'WordPress'
    }else if (title_lower===`javascript`) {
        title = `JavaScript`;
    }
    if (_.isEmpty(req.query.q)) {
        req.query.q = title;
    }

    let search = require(res.modulePath+`/app/Search`);

    const searchResults = search.getSearchResults(req);

    let minPrice = 0;
    let maxPrice = 100;
    let selected_minPrice = 20;
    let selected_maxPrice = 20;

    if (!_.isEmpty(req.query.price) && req.query.price.match(`-`)!=null){
        let tmp_price = req.query.price.split(`-`);
        selected_minPrice = tmp_price[0];
        selected_maxPrice = tmp_price[1];
    }

    let exportScripts = `<script type='text/javascript' src='/js/jquery.range-min.js'></script>`;
    let exportStyles = `<link href='/css/jquery.range.css' media='screen' rel='stylesheet' type='text/css'>`;

    let inlineScripts = `$('.range-slider').jRange({ondragend:function(){controller.loadUrl()},from:${minPrice},to: ${maxPrice},step: 1,scale: [${minPrice},${maxPrice}],format: '%s',width: 300,showLabels: true, showScale:true, snap:false,  isRange : true});$('.range-slider').jRange('setValue', '${selected_minPrice},${selected_maxPrice}');`;

    if (req.query.sort==``||req.query.sort==`undefined`||typeof req.query.sort == `undefined`) {
        req.query.sort = `Relevance`;
    }

    res.render(`creatives`,{
        showTitle: true,
        searchResults: searchResults,
        categories: search.getFromSearchQueryCategories(searchResults,req),
        maxPrice: 70,
        searchAction:searchAction,
        inlineScripts:inlineScripts,
        exportScripts:exportScripts,
        exportStyles:exportStyles,
        req:req,
        title:title
    });
};


exports.blogsAction = function(req, res) {

    let blogs = require(res.modulePath+`/app/Blogs`);

    res.render(`blogs`,{
        showTitle: true,
        blogs: blogs.getBlogs(req),
        req:req,
        searchAction:`search`,
        title:`Blogs`
    });
};


exports.aboutUsAction = function(req, res) {
    res.render(`about-us`,{
        showTitle: true,
        title:`About Us`,
        req:req,
        searchAction:`search`,
    });
};

exports.contactUsAction = function(req, res) {
    res.render(`contact-us`,{
        showTitle: true,
        contactUsJs: true,
        title:`Contact Us`,
        req:req,
        searchAction:`search`,
    });
};

exports.cartAction = function(req, res) {

    let total_cost = 0;

    if (req.session.cart_obj.hits.total>0) {
        req.session.cart_obj.hits.hits.forEach((cart_obj)=>{
            total_cost += parseFloat(cart_obj._source.offer_price)+parseFloat(cart_obj._source.built_price)+parseFloat(cart_obj._source.hosting_price);
        });
    }
    total_cost = currencyFormatter.format(total_cost, { code: 'USD' });


    res.render(`cart`,{
        showTitle: true,
        cartJs:true,
        total_cost,
        title:`Cart`,
        req,
        searchAction:`search`,
    });
};

exports.checkoutAction = function(req, res) {

    let total_cost = 0;

    cart.synchronizeCart(req).then(() => {

        if (req.session.cart_obj.hits.total > 0 && req.session.isLoggedin) {

            req.session.cart_obj.hits.hits.forEach((cart_obj) => {
                total_cost += parseFloat(cart_obj._source.offer_price) + parseFloat(cart_obj._source.built_price) + parseFloat(cart_obj._source.hosting_price);
            });

            total_cost = currencyFormatter.format(total_cost, {code: 'USD'});

            res.render(`checkout`, {
                showTitle: true,
                cartJs: true,
                total_cost,
                title: `Checkout`,
                req,
                searchAction: `search`,
            });

        } else {
            res.redirect(`/`);
        }

    }).catch((error) => {
        res.status(402).json({
            error: error
        });
    });
};

exports.fileDownloadAction = async function(req, res) {

    file.getProductZipFileAccessUsersByOrderCodeAndProductId(req).then((accessResponse) => {

        if (accessResponse.hits.total > 0) {

            req.body.file_id = accessResponse.hits.hits[0]._source.file_id;

            file.getFileByFileId(req).then((fileResponse) => {

                if (fileResponse.hits.total > 0) {

                    order.checkValidOrderByOrderIdAndProductCode(req).then((orderResponse) => {

                        if (orderResponse) {

                            const zipPath = `${res.modulePath}/resources/assets/files/${fileResponse.hits.hits[0]._source.name}`;

                            res.download(zipPath);

                        } else {
                            res.status(402).json({
                                error: `Error code 129838943! Order was cancelled.`
                            });
                        }

                    }).catch((error) => {
                        res.status(402).json({
                            error: error
                        });
                    });

                } else {
                    res.status(402).json({
                        error: `Error code 409409338! Not file found matching order code and product id selected.`
                    });
                }

            }).catch((error) => {
                res.status(402).json({
                    error: error
                });
            });

        } else {
            res.status(402).json({
                error: `Error code 124895448! Not file found matching order code and product id selected.`
            });
        }

    }).catch((error) => {
        res.status(402).json({
            error: error
        });
    });
};

exports.profileAction = function(req, res) {

    req.from = 0;
    req.size = 1999;

    const flush_message_array = req.flash('profile_alert');
    let flush_message = [];

    if (!_.isEmpty(flush_message_array)) {
        flush_message_array.forEach((item) => {
            if (item.type==='payment') {
                flush_message = item;
            }
        });
    }

    products.getProductsBySupplier(req).then((products_obj)=>{

        order.getOrderedProductByUserId(req).then((order_response) => {

            let order_obj = [];

            order_response.hits.hits.forEach((item) => {

                item._source.order_items.forEach((item2) => {

                    order_obj.push({
                        order_id: item._id.toString(),
                        cart_id: item2._id.toString(),
                        product_id: item2._source.product_id.toString(),
                        payment_id: item._source.payment_id.toString(),
                        payment_method: item._source.payment_method.toString(),
                        order_status: order.getStatusCode(item2._source.order_status?item2._source.order_status:1),
                        order_status_key: item2._source.order_status?item2._source.order_status:1,
                        total_quantity: item._source.quantity.toString(),
                        total_price: item._source.total_price.toString(),
                        user_id: item._source.user_id.toString(),
                        date_created: item._source.date_created.toString(),
                        date_last_updated: item._source.date_last_updated.toString(),
                        image1: `${req.customBaseURI}img/project/img-thumb/${item2._source.image1}`,
                        product_url: `/product/${item2._source.product_name.toString()}/${item2._source.product_id}`,
                        product_name: item2._source.product_name.toString(),
                        main_category: item2._source.main_category.toString(),
                        hosted: item2._source.hosted?1:0,
                        designed: item2._source.designed?1:0,
                        quantity: item2._source.quantity.toString(),
                        offer_price: currencyFormatter.format(parseFloat(item2._source.offer_price), { code: 'USD' }),
                        built_price: currencyFormatter.format(parseFloat(item2._source.built_price), { code: 'USD' }),
                        hosting_price: currencyFormatter.format(parseFloat(item2._source.hosting_price), { code: 'USD' }),
                    });
                });
            });

            const total_order = order_obj.length;

            res.render(`profile`,{
                showTitle: true,
                title:`Profile`,
                profileJs: true,
                flush_message,
                order_obj,
                total_order,
                products_obj,
                req,
                searchAction:`search`,
            });

        }).catch((error) => {
            res.status(402).json({
                error,
                error_code: `Error code 4987958`,
            });
        });
    },(error)=>{
        console.trace(error.message)
    }).catch(err => console.error(err));

};

exports.editLanguagePackAction = async function(req, res) {

    const language_pack = require(`../../LanguagePack`);

    let exportScripts = ``;
    let exportStyles = ``;
    let inlineScripts = ``;
    let language_code = `en`;
    let language_pack_obj = {};
    let issset_get_pram = false;
    let get_pram = ``;

    if (!_.isEmpty(req.query.lan)) {
        language_code = req.query.lan;
        issset_get_pram = true;
        get_pram = `?lan=${req.query.lan}`
    }

    let form_errors = false;
    let flush_error = req.flash('msg');

    if (!_.isEmpty(flush_error)){
        form_errors = true;
    }

    language_pack_obj = await language_pack.getLanguagePackByCode(req.client,language_code);

    if (language_pack_obj.hits.total==0) {
        language_pack_obj = await language_pack.getLanguagePackByCode(req.client,`en`);
    }

    language_pack_obj = await language_pack.getLanguagePackById(req.client,language_pack_obj.hits.hits[0]._id);
    let defualt_language_pack_obj = await language_pack.getLanguagePackById(req.client,`MRjUz2UBu_TaGk0fYyGr`);

    res.render(`edit-language-pack`,{
        showTitle: true,
        title:`Edit Language Pack`,
        inlineScripts,
        exportScripts,
        exportStyles,
        form_errors,
        issset_get_pram,
        get_pram,
        language_pack:language_pack_obj,
        defualt_language_pack:defualt_language_pack_obj,
        messages:flush_error,
        req:req,
        searchAction:`search`,
    });
};



exports.editProfileAction = function(req, res) {

    if (req.session.isLoggedin) {

        const flush_message_array = req.flash('profile_alert');
        let flush_message = [];

        if (!_.isEmpty(flush_message_array)) {
            flush_message_array.forEach((item) => {
                if (item.type==='xxxxxx') {
                    flush_message = item;
                }
            });
        }

        res.render(`edit-profile`,{
            showTitle: true,
            title:`Edit Profile`,
            editProfile:true,
            flush_message,
            req:req,
            searchAction:`search`,
        });
    }else {
        res.redirect(`/`);
    }
};


exports.editTemplatesAction = function(req, res) {
    if (req.session.isLoggedin) {

        const flush_message_array = req.flash('profile_alert');
        let flush_message = [];

        if (!_.isEmpty(flush_message_array)) {
            flush_message_array.forEach((item) => {
                if (item.type==='add-file') {
                    flush_message = item;
                }
            });
        }

        products.getMyProductByID(req).then((products_obj) => {

            const user_id = ((req.session.isLoggedin) ? req.session.body.id : req.DEFAULT_USER_ID);

            file.getUserFilesUserId(req, user_id).then((file_obj) => {

                res.render(`edit-templates`,{
                    showTitle: true,
                    title:`Edit Template`,
                    addTemplate: _.isEmpty(products_obj)?true:false,
                    req,
                    file_obj,
                    flush_message,
                    editTemplatesJs:true,
                    products_obj,
                    searchAction:`search`,
                });

            }).catch((error) => {
                res.status(402).json({
                    error: error
                });
            });

        }).catch(err => console.error(err))
    }else {
        res.redirect(`/`);
    }
};

exports.editProfileImageAction = function(req, res) {

    let exportScripts = `<script type='text/javascript' src='/js/cropit/dist/jquery.cropit.js'></script>`;
    let exportStyles = ``;

    let inlineScripts = `
    $(function() {

        $('.image-editor').cropit({
            exportZoom: 1.25,
        	imageBackground: true,
        	imageBackgroundBorderWidth: 20,
            imageState: {
			  src:'${req.customBaseURI}img/profile/main/profile.jpg',
			},
        });
            $('form').submit(function() {
                // Move cropped image data to hidden input
                var imageData = $('.image-editor').cropit('export');
                $('.hidden-image-data').val(imageData);

                // Print HTTP request params
                var formValue = $(this).serialize();
                console.log(formValue);
                // $('#result-data').text(formValue);

                // Prevent the form from actually submitting
                return false;
            });
        });


        /**  This code control User Profile Photo upload **/
          $(function() {


          $("#imageUpload").change(function() {
                var ext = getEXtession();
               if(ext != '')
               {
                 $('.hidden-image-format').val(ext);
               }
               else {
                 $('.hidden-image-format').val('');
                 $('#image-format-alert').modal('show');
               }
            });
            function getEXtession(){
              var value = $("#imageUpload").val();
              var array = value.split('.');
              var ext =  array[array.length-1].toLowerCase();
              if(ext == 'jpg' || ext == 'jpeg' || ext == 'png' || ext == 'gif')
              {
                 return ext;
              }
              else {
                 return '';
              }
           }
        	 $('.rotate-cw').click(function() {
        		$('.image-editor').cropit('rotateCW');
        	 });
        	 $('.rotate-ccw').click(function() {
        		$('.image-editor').cropit('rotateCCW');
        	 });
        /*
        	 $('.export').click(function() {
        		var imageData = $('.image-editor').cropit('export');
        		window.open(imageData);
           });*/
        	 $('form').submit(function() {
        		// Move cropped image data to hidden input
        		var imageData = $('.image-editor').cropit('export');
        		$('.hidden-image-data').val(imageData);

              var array = imageData.split(',');
              var ext =  array[0].toLowerCase();
              if(ext.match('jpg') || ext.match('jpeg') || ext.match('png') || ext.match('gif'))
              {
                 //var new_ext = getEXtession()
              //   if(new_ext != 'png'){
                    $('.hidden-image-format').val(ext);
                 //}
              }
              else {
                $('.hidden-image-format').val('');
              }

        		// Print HTTP request params
        		//var formValue = $(this).serialize();
        		//$('#result-data').html(formValue);

        		// Prevent the form from actually submitting
        		//return false;
        	});

          });

        `;

    res.render(`edit-profile-image`,{
        showTitle: true,
        exportScripts:exportScripts,
        exportStyles:exportStyles,
        inlineScripts:inlineScripts,
        req:req,
        title:`Edit Profile Image`,
        searchAction:`search`,
    });
};


exports.purchasesAction = function(req, res) {

    let auth = false;

// req.session.test = 'test 32';

    // console.log(req.session);

    res.render(`purchases`,{
        showTitle: true,
        title:`Purchases`,
        searchAction:`search`,
    });
};
