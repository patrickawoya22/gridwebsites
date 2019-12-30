const express = require('express'); //Lets us create a server
const path = require('path'); // path cleaner
const hbs = require('hbs'); // lets us use explating system
const exphbs = require('exphbs');
const paginate = require('express-paginate');
const session = require('express-session');
const dotenv = require('dotenv').config({path: __dirname+'/../.env'});
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const cookieParser = require('cookie-parser');
const elasticsearch = require('elasticsearch');
const _ = require(`lodash`);
const flash = require('connect-flash');
const language_pack = require('../app/LanguagePack');
const cart = require('../app/Cart');
const helper = require('../app/Http/helpers/helpers');
const moment = require('moment');
const ip = require('ip');
const fileUpload = require('express-fileupload');



let date = moment();

if (dotenv.error) {
  throw dotenv.error
}

let Handlebars = exphbs.handlebars;

let customBaseURI = `http://localhost:3000/`;

let app = express();
let port  = 3000; // port variable

const modulePath = path.join(__dirname, '..'); //setting path to module

//https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes
//https://www.npmjs.com/package/exphbs

// require('dotenv').config({path: modulePath + `config/dev`});

app.engine('hbs', exphbs);
app.set('view engine', 'hbs'); // defual  https://www.npmjs.com/package/hbs

hbs.registerPartials('../resources/view/partials');

// default options
app.use(fileUpload());

//Redirect all requests to public folder by defualt
app.use(express.static(__dirname + '../../public'));
// console.log(__dirname + '../../public');
//Web Servers and Application Deployment [2][Hello Express]

//Navigate to views
app.set('views', modulePath + '/resources/view');

//Navigate to layout
app.set('view layouts', modulePath+'/resources/view/layouts');

//set middleware function to finish before app continues
// app.use((req, res, next)=>{
//     //next();
// });

let client = new elasticsearch.Client({
    host:[
        {
            host: process.env.ELASTIC_HOST,
            port: process.env.ELASTIC_PORT,
            //auth: process.env.ELASTIC_AUTH
        }
    ]
});

client.ping({
    requestTimeout: 1000
}, function (error) {
    if (error) {
        console.trace(`elasticsearch cluster is down`);
    } else {
        console.trace(`elasticsearch cluster is up`);
    }
});

// client.search({
//     body:{
//         query:{
//             match_all: {}
//         }
//     }
// }).then(function (body) {
//
//     main_hits = body.hits.hits
//     console.log(body);
//
// }, function (error) {
//     console.trace(error.message)
// });

let sess = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2678400000 }
};

// if (process.env.APP_ENV === `production`) {
//     app.set(`trust proxy`, 1);
//     sess.cookie.secure = true;
// }
// else {
//     sess.cookie.secure = false;
// }

app.use(bodyParser.json({limit: '10mb', extended: true}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session(sess));
app.use(flash());


//setting helpers https://github.com/gnowoel/exphbs/blob/HEAD/docs/helpers.md
//Setting global helper

helper.setCompareHelper(Handlebars);
helper.setReplaceUrlHelper(Handlebars);
helper.setTrimStringHelper(Handlebars);
helper.setDateFormatHelper(Handlebars);
helper.setStrIncludesHelper(Handlebars);
helper.setStrSplitVersionHelper(Handlebars);

// app.use((req, res, next)=>{
//     helper.languageListHelper(client,req,Handlebars).then((res2)=>{
//         next()
//     }).catch(err => console.error(err));
// });

//Setting LanguagePack session middl
app.use((req, res, next)=>{

    req.client = client;

    if (!_.isEmpty(req.query.lan)){
        req.session.language = req.query.lan.trim().substring(0, 30).toLowerCase();
    }else if (!_.isEmpty(req.session.language)) {
        req.session.language = req.session.language;
    }else {
        req.session.language = `en`;
    }

    req.env = process.env;

    cart.getCartItemsByCookieIdEx(req,res).then((res3)=>{

        req.session.cart_obj = res3;

        // if ((_.isEmpty(req.session.LanguagePack))|| ((!_.isEmpty(req.session.LanguagePack.selected_pack.hits.hits[0]._source.language_code_field))&&req.session.LanguagePack.selected_pack.hits.hits[0]._source.language_code_field.toLowerCase()!=req.session.language)){

            //selected pack
            // language_pack.getLanguagePackByLanguageOrCode(client,req.session.language).then((res)=>{
                //defualt pack
                // language_pack.getLanguagePackByLanguageOrCode(client,`en`).then((res2)=>{

                        //setting language pack
                        // req.session.LanguagePack = {};
                        // req.session.LanguagePack.selected_pack = res;
                        // req.session.LanguagePack.defualt_pack = res2;
                        next();

                // }).catch(err => console.error(err))
            // }).catch(err => console.error(err))

        // }else{
        //         next();
        // }
    }).catch(err => console.error(err))
});

const authController = require(modulePath+'/app/Http/Controllers/authController');
const userController = require(modulePath+'/app/Http/Controllers/userController');

//Setting defualt layout
// app.locals.layout = 'layout';

//Setting index router
app.get('/',(req, res, next)=>{
    req.client = client;
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, userController.indexAction);

//Setting index router
app.get('/product-json',(req, res, next)=>{
    req.client = client;
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, userController.productJsonAction);

//Setting blog router
app.get('/product/:name/:id',(req, res, next)=>{
    res.modulePath = modulePath;
    req.client = client;
    req.customBaseURI = customBaseURI;
    req.env = process.env;
    next();
}, userController.productAction);


//Setting Contact seller router
// app.post(`/contact-seller`,(req, res, next)=>{
//     res.modulePath = modulePath;
//     req.MAIL_HOST = process.env.MAIL_HOST;
//     req.MAIL_PORT = process.env.MAIL_PORT;
//     req.MAIL_USERNAME = process.env.MAIL_USERNAME;
//     req.MAIL_PASSWORD = process.env.MAIL_PASSWORD;
//     req.client = client;
//     next();
// }, userController.contactSellerAction);

app.post(`/save-review`,(req, res, next)=>{
    res.modulePath = modulePath;
    req.client = client;
    req.date = moment(date).format('YYYY-MM-DD HH:mm:ss');
    req.dateS = moment(date).format('DD MMMM YYYY');
    req.env = process.env;
    next();
}, authController.saveReviewAction);

app.post(`/save-review-reply`,(req, res, next)=>{
    res.modulePath = modulePath;
    req.client = client;
    req.date = moment(date).format('YYYY-MM-DD HH:mm:ss');
    req.dateS = moment(date).format('DD MMMM YYYY');
    req.env = process.env;
    next();
}, authController.saveReviewReplyAction);

app.post(`/remove-review`,(req, res, next)=>{
    res.modulePath = modulePath;
    req.client = client;
    req.env = process.env;
    next();
}, authController.removeReviewAction);

app.post(`/remove-review-reply`,(req, res, next)=>{
    res.modulePath = modulePath;
    req.client = client;
    req.env = process.env;
    next();
}, authController.removeReviewReplyAction);


//Setting Contact seller router
app.post(`/remove-review`,(req, res, next)=>{
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, userController.removeReviewAction);


//Setting about us router
app.get('/about-us', userController.aboutUsAction);

app.use(paginate.middleware(12, 2));

//Setting blog router
app.get('/blogs',(req, res, next)=>{
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, userController.blogsAction);

//Setting search router
app.get('/search',(req, res, next)=>{
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, userController.searchAction);

//Setting themes router
// app.get('/themes',(req, res, next)=>{
//     res.modulePath = modulePath;
//     req.client = client;
//     next();
// }, userController.themesAction);

//Setting themes router
// app.get('/themes/:id',(req, res, next)=>{
//     res.modulePath = modulePath;
//     req.client = client;
//     next();
// }, userController.themesAction);

//Setting members router
app.get('/members',(req, res, next)=>{
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, userController.membersAction);

//Setting members router
app.get('/members/:id',(req, res, next)=>{
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, userController.membersAction);

//Setting members router
app.get('/members/:id/:id2',(req, res, next)=>{
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, userController.membersAction);

//Setting creatives router
app.get('/creatives',(req, res, next)=>{
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, userController.creativesAction);

//Setting creatives router
app.get('/creatives/:id',(req, res, next)=>{
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, userController.creativesAction);


app.get('/cart',(req, res, next)=>{
    res.modulePath = modulePath;
    req.customBaseURI = customBaseURI;
    req.DEFAULT_USER_ID = process.env.DEFAULT_USER_ID;
    req.env = process.env;
    next();
}, userController.cartAction);


app.get('/purchases',(req, res, next)=>{
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, userController.purchasesAction);


app.post(`/join`,(req, res, next)=>{

    req.MAIL_HOST = process.env.MAIL_HOST;
    req.MAIL_PORT = process.env.MAIL_PORT;
    req.MAIL_USERNAME = process.env.MAIL_USERNAME;
    req.MAIL_PASSWORD = process.env.MAIL_PASSWORD;
    req.env = process.env;
    req.client = client;
    req.ip = ip.address();
    req.date = moment(date).format('YYYY-MM-DD HH:mm:ss');
    res.modulePath = modulePath;
    next();

}, authController.joinAction);


app.post(`/login`,(req, res, next)=>{
    req.client = client;
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, authController.loginAction);

//Setting activation router
app.get(`/activation`,(req, res, next)=>{
    req.client = client;
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, authController.activationAction);

//Setting activation router
app.get(`/logout`,(req, res, next)=>{
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, authController.logoutAction);


app.get(`/profile`,(req, res, next)=>{
    if (req.session.isLoggedin) {
        req.client = client;
        req.DEFAULT_USER_ID = process.env.DEFAULT_USER_ID;
        res.modulePath = modulePath;
        req.customBaseURI = customBaseURI;
        req.env = process.env;
        next();
    } else {
        res.redirect(`/`);
    }
}, userController.profileAction);

app.get(`/file-download/:product_id/:order_id`,(req, res, next)=>{
    if (req.session.isLoggedin) {
        req.client = client;
        req.DEFAULT_USER_ID = process.env.DEFAULT_USER_ID;
        res.modulePath = modulePath;
        req.customBaseURI = customBaseURI;
        req.env = process.env;
        next();
    } else {
        res.redirect(`/`);
    }
}, userController.fileDownloadAction);


app.get(`/edit-profile`,(req, res, next)=>{
    if (req.session.isLoggedin) {
        res.modulePath = modulePath;
        req.customBaseURI = customBaseURI;
        req.env = process.env;
        next();
    } else {
        res.redirect(`/`);
    }
}, userController.editProfileAction);

app.post(`/save-account-details`,(req, res, next)=>{
    req.client = client;
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, authController.saveAccountDetailsAction);

app.post(`/upload-template-file`,(req, res, next)=>{

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    req.client = client;
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, authController.saveTemplateFileAction);


app.post(`/save-description`,(req, res, next)=>{
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, authController.saveDescriptionAction);

app.post(`/save-notifications`,(req, res, next)=>{
    req.client = client;
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, authController.saveNotificationsAction);

app.post(`/save-password`,(req, res, next)=>{
    req.client = client;
    res.modulePath = modulePath;
    next();
}, authController.savePasswordAction);

app.get(`/edit-profile-image`,(req, res, next)=>{
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, userController.editProfileImageAction);

app.get(`/edit-language-pack`,(req, res, next)=>{
    req.client = client;
    req.env = process.env;
    next();
}, userController.editLanguagePackAction);

app.get(`/edit-templates/:id`,(req, res, next)=>{
    req.client = client;
    req.DEFAULT_USER_ID = process.env.DEFAULT_USER_ID;
    req.date = moment(date).format('YYYY-MM-DD HH:mm:ss');
    req.customBaseURI = customBaseURI;
    req.env = process.env;
    next();
}, userController.editTemplatesAction);


app.get(`/checkout`,(req, res, next)=>{
    req.client = client;
    req.DEFAULT_USER_ID = process.env.DEFAULT_USER_ID;
    req.date = moment(date).format('YYYY-MM-DD HH:mm:ss');
    req.customBaseURI = customBaseURI;
    req.env = process.env;
    next();
}, userController.checkoutAction);

app.get(`/paypal-checkout`,(req, res, next)=>{
    req.client = client;
    req.BASE_URL = process.env.BASE_URL;
    req.DEFAULT_USER_ID = process.env.DEFAULT_USER_ID;
    req.date = moment(date).format('YYYY-MM-DD HH:mm:ss');
    req.customBaseURI = customBaseURI;
    req.env = process.env;
    next();
}, authController.paypalCheckoutAction);

app.get(`/paypal-payment-confirmation`,(req, res, next)=>{
    req.client = client;
    req.BASE_URL = process.env.BASE_URL;
    req.DEFAULT_USER_ID = process.env.DEFAULT_USER_ID;
    req.date = moment(date).format('YYYY-MM-DD HH:mm:ss');
    req.customBaseURI = customBaseURI;
    req.env = process.env;
    next();
}, authController.paypalPaymentConfirmationAction);

app.get(`/paypal-payment-cancellation`,(req, res, next)=>{
    req.client = client;
    req.DEFAULT_USER_ID = process.env.DEFAULT_USER_ID;
    req.date = moment(date).format('YYYY-MM-DD HH:mm:ss');
    req.customBaseURI = customBaseURI;
    next();
}, authController.paypalPaymentCancellationAction);

app.get(`/contact-us`,(req, res, next)=>{
    req.client = client;
    req.date = moment(date).format('YYYY-MM-DD HH:mm:ss');
    req.customBaseURI = customBaseURI;
    req.env = process.env;
    next();
}, userController.contactUsAction);

app.post(`/save-template`,(req, res, next)=>{
    req.client = client;
    req.env = process.env;
    next();
}, authController.saveTemplateAction);

app.post(`/send-contact-us-message`,(req, res, next)=>{
    req.MAIL_HOST = process.env.MAIL_HOST;
    req.MAIL_PORT = process.env.MAIL_PORT;
    req.MAIL_USERNAME = process.env.MAIL_USERNAME;
    req.MAIL_PASSWORD = process.env.MAIL_PASSWORD;
    req.client = client;
    req.ip = ip.address();
    req.date = moment(date).format('YYYY-MM-DD HH:mm:ss');
    res.modulePath = modulePath;
    req.env = process.env;
    next();
}, authController.sendContactUsMessage);

app.post(`/save-template-image`,(req, res, next)=>{
    req.client = client;
    req.modulePath = modulePath;
    req.date = moment(date).format('YYYY-MM-DD HH:mm:ss');
    req.env = process.env;
    next();
}, authController.saveTemplateImageAction);

app.post(`/delete-template-image`,(req, res, next)=>{
    req.client = client;
    req.modulePath = modulePath;
    req.date = moment(date).format('YYYY-MM-DD HH:mm:ss');
    req.env = process.env;
    next();
}, authController.deleteTemplateImageAction);

app.post(`/delete-template-file`,(req, res, next)=>{
    req.client = client;
    req.modulePath = modulePath;
    req.date = moment(date).format('YYYY-MM-DD HH:mm:ss');
    req.env = process.env;
    next();
}, authController.deleteTemplateFileAction);

app.post(`/save-cart`,(req, res, next)=>{
    req.client = client;
    req.modulePath = modulePath;
    req.DEFAULT_USER_ID = process.env.DEFAULT_USER_ID;
    req.date = moment(date).format('YYYY-MM-DD HH:mm:ss');
    req.env = process.env;
    next();
}, authController.saveCartAction);

app.post(`/change-order-status`,(req, res, next)=>{
    if (req.session.isLoggedin) {
        req.client = client;
        req.modulePath = modulePath;
        req.DEFAULT_USER_ID = process.env.DEFAULT_USER_ID;
        req.date = moment(date).format('YYYY-MM-DD HH:mm:ss');
        req.env = process.env;
        next();
    } else {
        res.status(402).json({
            error,
            error_code: `Error code 39320948`,
        });
    }
}, authController.saveOrderStatusAction);

app.post(`/modify-cart`,(req, res, next)=>{
    req.client = client;
    req.modulePath = modulePath;
    req.DEFAULT_USER_ID = process.env.DEFAULT_USER_ID;
    req.env = process.env;
    req.date = moment(date).format('YYYY-MM-DD HH:mm:ss');
    next();
}, authController.modifyCartAction);

app.post(`/save-language-pack`,(req, res, next)=>{
    req.client = client;
    req.env = process.env;
    next();
}, authController.saveLanguagePackAction);

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
}); // creating a binding port on the machine
