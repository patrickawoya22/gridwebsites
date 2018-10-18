const _ = require(`lodash`);
const products = require(`../../Products`);

exports.indexAction = function(req, res) {

    let templates = require(res.modulePath+`/app/Products`);

    //http://sachinchoolur.github.io/lightslider/
    let exportScripts = `
    <script type='text/javascript' src='/js/lightslider.min.js'></script>
    <script type='text/javascript' src='/js/typed.min.js'></script>
    `;
    let exportStyles = `<link href='/css/lightslider.min.css' media='screen' rel='stylesheet' type='text/css'>`;

    let slider_setting = `{
        keyPress:false,
        item:3,
        slideMargin: 32,
        controls: true,
        prevHtml: '',
        nextHtml: '',
        loop:true,
        responsive : [
            {
                breakpoint:800,
                settings: {
                    item:3,
                    slideMove:1,
                  }
            },
            {
                breakpoint:480,
                settings: {
                    item:1,
                    slideMove:1
                  }
            }
        ]
    }`;

    let slider_setting_2 = `{
        keyPress:false,
        item:2,
        slideMargin: 32,
        controls: true,
        prevHtml: '',
        nextHtml: '',
        loop:true,
        pager: false,
        responsive : [
            {
                breakpoint:800,
                settings: {
                    item:2,
                    slideMove:1,
                  }
            },
            {
                breakpoint:480,
                settings: {
                    item:1,
                    slideMove:1
                  }
            }
        ]
    }`;

    let slider_setting_3 = `{
        keyPress:false,
        item:4,
        slideMargin: 32,
        controls: true,
        prevHtml: '',
        nextHtml: '',
        loop:true,
        pager: false,
        responsive : [
            {
                breakpoint:800,
                settings: {
                    item:4,
                    slideMove:1,
                  }
            },
            {
                breakpoint:480,
                settings: {
                    item:1,
                    slideMove:1
                  }
            }
        ]
    }`;

    let slider_setting_4 = `{
        keyPress:false,
        item:1,
        slideMargin: 32,
        controls: false,

        auto: true,
        speed: 1000,
        loop:true,
        slideEndAnimation: true,
        pause: 6000,
        pager: false,

        responsive : [
            {
                breakpoint:800,
                settings: {
                    item:1,
                    slideMove:1,
                  }
            },
            {
                breakpoint:480,
                settings: {
                    item:1,
                    slideMove:1
                  }
            }
        ]
    }`;

    let inlineScripts = `
        $('#foundation-content-slider').lightSlider(${slider_setting});
        $('#bootstrap-content-slider').lightSlider(${slider_setting});
        $('#websites-design-content-slider').lightSlider(${slider_setting_2});
        $('#email-templates-content-slider').lightSlider(${slider_setting_3});
        $('#work-content-slider').lightSlider(${slider_setting_4});
        $(function() {
            var typed = new Typed('#typed', {
                stringsElement: '#typed-strings',
                typeSpeed: 80,
                backDelay: 2000,
                contentType: 'html',
                backSpeed: 30,
                startDelay: 100,
                loop: true,
                loopCount: Infinity
            });
        });
    `;

    let login_form_errors = false;
    let login_flush_error = req.flash('login_msg');

    if (!_.isEmpty(login_flush_error)){
        login_form_errors = true;
    }

    let join_form_errors = false;
    let join_flush_error = req.flash('join_msg');

    if (!_.isEmpty(join_flush_error)){
        join_form_errors = true;
    }

    res.render(`index`,{
        showTitle: false,
        searchAction:`search`,
        req,
        login_form_errors,
        join_form_errors,
        login_messages:login_flush_error,
        join_messages:join_flush_error,
        exportStyles,
        exportScripts,
        inlineScripts,
        foundation_templates: templates.getTemplates(req,`foundation`),
        bootstrap_templates: templates.getTemplates(req,`bootstrap`),
        website_design: templates.getTemplates(req,`bootstrap`),
        email_templates: templates.getTemplates(req,`email`)
    });
};



exports.productAction = function(req, res) {

    //http://sachinchoolur.github.io/lightslider/

    //http://auxiliary.github.io/rater/

    let exportScripts = `
    <script type='text/javascript' src='/js/lightslider.min.js'></script>
    <script type='text/javascript' src='/js/typed.min.js'></script>
    <script type='text/javascript' src='/js/rater.min.js'></script>
    `;
    let exportStyles = `
    <link href='/css/lightslider.min.css' media='screen' rel='stylesheet' type='text/css'>
    `;

    let slider_setting = `{
        gallery:true,
        item:1,
        thumbItem:9,
        slideMargin: 0,
        speed:1000,
        auto:false,
        controls: false,
        loop:true,
        onSliderLoad: function() {
            $('#image-gallery').removeClass('cS-hidden');
        }
    }`;



    let inlineScripts = `
        $('#image-gallery').lightSlider(${slider_setting});

        $(".rate1").rate({
            max_value: 5,
            step_size: 1,
            cursor: 'pointer',
            initial_value: 5,
            update_input_field_name: $("#rate_input1"),
        });
    `;

    let contact_seller_form_errors = false;
    let contact_seller_flush_error = req.flash('contact_seller_msg');

    if (!_.isEmpty(contact_seller_flush_error)){
        contact_seller_form_errors = true;
    }


    let remove_review_form_errors = false;
    let remove_review_flush_error = req.flash('remove_review_msg');

    if (!_.isEmpty(remove_review_flush_error)){
        remove_review_form_errors = true;
    }

    let save_review_form_errors = false;
    let save_review_flush_error = req.flash('save_review_msg');

    if (!_.isEmpty(save_review_flush_error)){
        save_review_form_errors = true;
    }


    res.render(`product`,{
        showTitle: true,
        req:req,

        contact_seller_messages:contact_seller_flush_error,
        contact_seller_form_errors:contact_seller_form_errors,

        remove_review_messages:remove_review_flush_error,
        remove_review_form_errors:remove_review_form_errors,

        save_review_messages:save_review_flush_error,
        save_review_form_errors:save_review_form_errors,

        exportStyles: exportStyles,
        exportScripts: exportScripts,
        inlineScripts:inlineScripts,
        title:`Space – Multipurpose Responsive Template`
    });
};


exports.searchAction = function(req, res) {

    let search = require(res.modulePath+`/app/Search`);

    searchResults = search.getSearchResults(req);

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

    res.render(`search`,{
        showTitle: true,
        searchResults: searchResults,
        categories: search.getFromSearchQueryCategories(searchResults,req),
        maxPrice: 70,
        searchAction:`search`,
        inlineScripts:inlineScripts,
        exportScripts:exportScripts,
        exportStyles:exportStyles,
        req:req,
        title:`Search`
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

    searchResults = search.getSearchResults(req);

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

    res.render(`themes`,{
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


exports.contactSellerAction = function(req, res) {

    req.check(`title`,`Please enter title`).isLength({min:2,max:4});
    req.check(`name`, `Please enter your full name`).isLength({min:1,max:100});
    req.check(`email`,`Please enter a valid email`).isEmail();
    req.check(`mobile`,`Please enter a valid mobile number. i.e. 07457528436`).isLength({min:11,max:20});
    req.check(`message`,`Message must be at least 2 characters long`).isLength({min:2});
    req.check(`page_route`,`Invalid page route`).isLength({min:2});

    let errors = req.validationErrors();

    if (errors) {

        req.flash('contact_seller_msg', errors);
    }


    //Redirect back to the previous page
    res.redirect(req.body.page_route);
};


exports.saveReviewAction = function(req, res) {

    req.check(`rate_input`,`Please select ratings`).isLength({min:1});
    req.check(`name`,`Review must be at least 2 characters long`).isLength({min:2});
    req.check(`page_route`,`Invalid page route`).isLength({min:2});

    let errors = req.validationErrors();

    if (errors) {

        req.flash('save_review_msg', errors);
    }
    //Redirect back to the previous page
    res.redirect(req.body.page_route);
};

exports.saveReviewReplyAction = function(req, res) {

    req.check(`review_id`, `Invalid review id`).isLength({min:1,max:100});
    req.check(`name`,`Reply must be at least 2 characters long`).isLength({min:2});
    req.check(`page_route`,`Invalid page route`).isLength({min:2});

    let errors = req.validationErrors();

    if (errors) {

        req.flash('save_review_msg', errors);
    }
    //Redirect back to the previous page
    res.redirect(req.body.page_route);
};

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

    searchResults = search.getSearchResults(req);

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

exports.cartAction = function(req, res) {
    res.render(`cart`,{
        showTitle: true,
        title:`Cart`,
        req,
        searchAction:`search`,
    });
};

exports.profileAction = function(req, res) {
    res.render(`profile`,{
        showTitle: true,
        title:`Profile`,
        req:req,
        searchAction:`search`,
    });
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

    let exportScripts = ``;
    let exportStyles = ``;
    let inlineScripts = `
    $(function(){
            $('#edit-profile-details-form').validate({
            rules: {
                    title: {
                        required: true,
                        maxlength: 8,
                    },language: {
                        required: true,
                        maxlength: 20,
                    },first_name: {
                        required: true,
                        maxlength: 60,
                    },last_name: {
                        required: true,
                        maxlength: 60,
                    },username: {
                        required: true,
                        maxlength: 60,
                    },country: {
                        required: true,
                        maxlength: 60,
                    }
                },
            messages: {
                    title: {
                        required: 'Please select your title',
                    },language: {
                        required: 'Please select your defualt language',
                    },first_name: {
                        required: 'Please enter your first name',
                    },last_name: {
                        required: 'Please enter your last name',
                    },username: {
                        required: 'Please enter your username',
                    },country: {
                        required: 'Please select your country!',
                    }
                }
            });

        });


        $(function(){
            $('#edit-description-form').validate({
            rules: {
                description: {
                    required: true,
                }
            },
            messages: {
                    description: {
                        required: 'Please enter description',
                    }
                }
            });
        });


        $(function(){
            $('#edit-notifications-form').validate({
            rules: {
                mobile: {
                    required: true,
                    minlength: 11,
                    maxlength: 20,
                },email: {
                    required: true,
                    email:true,
                    maxlength: 60,
                }
            },
            messages: {
                mobile: {
                    required: 'Please enter your mobile number',
                    minlength: 'Please enter a valid mobile number. i.e. 07457528436',
                },email: {
                    required: 'Please enter your address',
                    email: 'Please enter a valid email address'
                }
            }
        });
    });

    $(function(){
        $('#edit-password-form').validate({
        rules: {
            old_password: {
                required: true,
            },new_password: {
                required: true,
                minlength: 6
            },confirm_password: {
                required: true,
                minlength: 6,
                equalTo:'#new_password'
            }
        },
        messages: {
                old_password: {
                    required: 'Please enter your old password',
                },new_password: {
                    required: 'Please enter your password',
                    minlength: 'Your password must be at least 6 characters long'
                },confirm_password: {
                    required: 'Please enter your password',
                    minlength: 'Your password must be at least 6 characters long',
                    equalTo: 'Please enter the same password'
                }
            }
        });
    });

    `;

    let form_errors = false;
    let flush_error = req.flash('msg');

    if (!_.isEmpty(flush_error)){
        form_errors = true;
    }

    res.render(`edit-profile`,{
        showTitle: true,
        title:`Edit Profile`,
        inlineScripts:inlineScripts,
        exportScripts:exportScripts,
        exportStyles:exportStyles,
        form_errors:form_errors,
        messages:flush_error,
        req:req,
        searchAction:`search`,
    });
};




exports.editTemplatesAction = function(req, res) {

    let exportScripts = `<script type='text/javascript' src='/js/cropit/dist/jquery.cropit.js'></script>`;
    let exportStyles = ``;
    let inlineScripts = `
    $(function(){

        $('.image-editor').cropit({
            exportZoom: 1.25,
        	imageBackground: true,
        	imageBackgroundBorderWidth: 20,
            imageState: {
			  src:'http://localhost:3000/img/profile/main/profile.jpg',
			},
        });
            $('form#cropit-form').submit(function() {
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



            $('#edit-templates-form').validate({
            rules: {
                    title: {
                        required: true,
                        maxlength: 8,
                    },language: {
                        required: true,
                        maxlength: 20,
                    },first_name: {
                        required: true,
                        maxlength: 60,
                    },last_name: {
                        required: true,
                        maxlength: 60,
                    },username: {
                        required: true,
                        maxlength: 60,
                    },country: {
                        required: true,
                        maxlength: 60,
                    }
                },
            messages: {
                    title: {
                        required: 'Please select your title',
                    },language: {
                        required: 'Please select your defualt language',
                    },first_name: {
                        required: 'Please enter your first name',
                    },last_name: {
                        required: 'Please enter your last name',
                    },username: {
                        required: 'Please enter your username',
                    },country: {
                        required: 'Please select your country!',
                    }
                }
            });

        });

    `;

    let form_errors = false;
    let flush_error = req.flash('msg');

    if (!_.isEmpty(flush_error)){
        form_errors = true;
    }

    let product_obj = {}

    if (!_.isEmpty(req.query.ref)) {
        products.getProductByID(req,req.query.ref).then((req2)=>{
            if (!_.isEmpty(req2._source)&&(req2._source.owner=='set_user_id_here')||1==1) {

                req.product = req2;

                req.body = req.flash('query')[0]

                res.render(`edit-templates`,{
                    showTitle: true,
                    title:`Edit Template`,
                    inlineScripts:inlineScripts,
                    exportScripts:exportScripts,
                    exportStyles:exportStyles,
                    form_errors:form_errors,
                    messages:flush_error,
                    req:req,
                    searchAction:`search`,
                });

            }else {
                throw new Error(`Error code 47987498. Something bad happened`);
            }
        })
    }else {

        req.body = req.flash('query')[0]

        res.render(`edit-templates`,{
            showTitle: true,
            title:`Edit Template`,
            inlineScripts:inlineScripts,
            exportScripts:exportScripts,
            exportStyles:exportStyles,
            form_errors:form_errors,
            messages:flush_error,
            req:req,
            searchAction:`search`,
        });
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
			  src:'http://localhost:3000/img/profile/main/profile.jpg',
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
