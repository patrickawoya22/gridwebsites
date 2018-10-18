const express = require('express'); //Lets us create a server
const path = require('path'); // path cleaner
const hbs = require('hbs'); // lets us use explating system
const async = require("async");
const exphbs = require('exphbs');
const paginate = require('express-paginate');
const session = require('express-session');
const dotenv = require('dotenv').config({path: '../.env'});
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const cookieParser = require('cookie-parser');
const elasticsearch = require('elasticsearch');
const _ = require(`lodash`);
const flash = require('connect-flash');
const language_pack = require('../app/LanguagePack');
const helper = require('../app/Http/helpers/helpers');


if (dotenv.error) {
  throw dotenv.error
}

var Handlebars = exphbs.handlebars;

let app = express();
let port  = 3000; // port variable

const modulePath = path.join(__dirname, '..'); //setting path to module

//https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes
//https://www.npmjs.com/package/exphbs

// require('dotenv').config({path: modulePath + `config/dev`});

app.engine('hbs', exphbs);
app.set('view engine', 'hbs'); // defual  https://www.npmjs.com/package/hbs

hbs.registerPartials('../resources/view/partials');


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
    cookie: {},
    resave: false,
    saveUninitialized: true,
};

if (process.env.APP_ENV === `production`) {
    app.set(`trust proxy`, 1);
    sess.cookie.secure = true;
}
else {
    sess.cookie.secure = false;
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session(sess));
app.use(flash());


//setting helpers https://github.com/gnowoel/exphbs/blob/HEAD/docs/helpers.md
//Setting global helper

helper.setCompareHelper(modulePath,Handlebars);

app.use((req, res, next)=>{
    helper.languageListHelper(client,req,Handlebars).then((res2)=>{
        next()
    });
})

//Setting LanguagePack session middl
app.use((req, res, next)=>{

    if (!_.isEmpty(req.query.lan)){
        req.session.language = req.query.lan.trim().substring(0, 30).toLowerCase();
    }else if (!_.isEmpty(req.session.language)) {
        req.session.language = req.session.language;
    }else {
        req.session.language = `en`;
    }

    if ((_.isEmpty(req.session.LanguagePack))|| ((!_.isEmpty(req.session.LanguagePack.selected_pack.hits.hits[0]._source.language_code_field))&&req.session.LanguagePack.selected_pack.hits.hits[0]._source.language_code_field.toLowerCase()!=req.session.language)){

        //selected pack
        language_pack.getLanguagePackByLanguageOrCode(client,req.session.language).then((res)=>{
            //defualt pack
            language_pack.getLanguagePackByLanguageOrCode(client,`en`).then((res2)=>{
                //setting language pack
                req.session.LanguagePack = {}
                req.session.LanguagePack.selected_pack = res;
                req.session.LanguagePack.defualt_pack = res2;

                next();

            }).catch(err => console.error(err))
        }).catch(err => console.error(err))

    }else{
        next();
    }
});

const authController = require(modulePath+'/app/Http/Controllers/authController');
const userController = require(modulePath+'/app/Http/Controllers/userController');

//Setting defualt layout
// app.locals.layout = 'layout';

//Setting index router
app.get('/',(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.indexAction);

//Setting blog router
app.get('/product/:id/:name',(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.productAction);


//Setting Contact seller router
app.post(`/contact-seller`,(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.contactSellerAction);

//Setting Contact seller router
app.post(`/save-review`,(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.saveReviewAction);

//Setting Contact seller router
app.post(`/save-review-reply`,(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.saveReviewReplyAction);


//Setting Contact seller router
app.post(`/remove-review`,(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.removeReviewAction);


//Setting about us router
app.get('/about-us', userController.aboutUsAction);

app.use(paginate.middleware(12, 2));

//Setting blog router
app.get('/blogs',(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.blogsAction);

//Setting search router
app.get('/search',(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.searchAction);

//Setting themes router
app.get('/themes',(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.themesAction);

//Setting themes router
app.get('/themes/:id',(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.themesAction);

//Setting members router
app.get('/members',(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.membersAction);

//Setting members router
app.get('/members/:id',(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.membersAction);

//Setting members router
app.get('/members/:id/:id2',(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.membersAction);

//Setting creatives router
app.get('/creatives',(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.creativesAction);

//Setting creatives router
app.get('/creatives/:id',(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.creativesAction);

//Setting cart router
app.get('/cart',(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.cartAction);

//Setting cart router
app.get('/purchases',(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.purchasesAction);

//Setting cart router
app.post(`/join`,(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, authController.joinAction);

//Setting cart router
app.post(`/login`,(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, authController.loginAction);

//Setting cart router
app.get(`/profile`,(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.profileAction);

//Setting cart router
app.get(`/edit-profile`,(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.editProfileAction);

//Setting cart router
app.post(`/save-account-details`,(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, authController.saveAccountDetailsAction);

//Setting cart router
app.post(`/save-description`,(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, authController.saveDescriptionAction);

//Setting cart router
app.post(`/save-notifications`,(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, authController.saveNotificationsAction);

//Setting cart router
app.post(`/save-password`,(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, authController.savePasswordAction);

//Setting cart router
app.get(`/edit-profile-image`,(req, res, next)=>{
    res.modulePath = modulePath;
    next();
}, userController.editProfileImageAction);

//Setting cart router
app.get(`/edit-language-pack`,(req, res, next)=>{
    req.client = client;
    next();
}, userController.editLanguagePackAction);

//Setting cart router
app.get(`/edit-templates`,(req, res, next)=>{
    req.client = client;
    next();
}, userController.editTemplatesAction);

//Setting cart router
app.post(`/save-template`,(req, res, next)=>{
    req.client = client;
    next();
}, authController.saveTemplateAction);


//Setting cart router
app.post(`/save-language-pack`,(req, res, next)=>{
    req.client = client;
    next();
}, authController.saveLanguagePackAction);

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
}); // creating a binding port on the machine
