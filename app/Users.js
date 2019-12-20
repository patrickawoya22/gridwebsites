
module.exports.addNewUser = async (req) => {
    return await req.client.index({
        index: 'users',
        type: '_doc',
        body: {
            first_name: req.body.first_name,
            first_name_no_analyzer: req.body.first_name,
            last_name: req.body.last_name,
            last_name_no_analyzer: req.body.last_name,
            username: req.body.username,
            session_id: '',
            country_code: '',
            location: '',
            email: req.body.email,
            email_no_analyzer: req.body.email,
            passwd: req.body.password,

            b_postcode: '',
            b_postcode_no_analyzer: '',
            b_address1: '',
            b_country: '',
            b_street: '',
            b_city: '',
            b_county: '',

            s_postcode: '',
            s_postcode_no_analyzer: '',
            s_address1: '',
            s_country: '',
            s_street: '',
            s_city: '',
            s_county: '',

            use_same_address: 1,

            mobile: '',
            mobile_no_analyzer: '',

            terms_agreement: 1,
            signup_ip: req.ip,

            date_joined: req.date,
            date_last_login: '1980-01-01 00:00:00',
            date_last_logout: '1980-01-01 00:00:00',
            activated_date: '1980-01-01 00:00:00',

            pwd_reset_token_creation_date: '1980-01-01 00:00:00',
            pwd_reset_token: '',

            title: req.body.title,

            profile_img: '',
            account_status: 0,
            access_level: 0,
            root: 0,

            activation_code: req.activation_code,
            user_guide: 1,
            emailme:0,
            textme:0,
            push_notification:0,
            pinterest:'',
            facebook:'',
            google_plus:'',
        }
    })
}
module.exports.addActivationCode = async (req) => {
    return await req.client.update({
        index: 'users',
        type: '_doc',
        id: req.activation_code,
        body: {
            doc: {
                activation_code: req.activation_code,
            }
        }
    })
}
module.exports.updateAccountPassword = async (req) => {
    return await req.client.update({
        index: 'users',
        type: '_doc',
        id: req.session.body.id,
        body: {
            doc: {
                passwd: req.body.password,
            }
        }
    })
}
module.exports.activateUser = async (req) =>{
    return await req.client.update({
        index: 'users',
        type: '_doc',
        id: req.query.code,
        body: {
            doc: {
                activation_code: '',
            }
        }
    })
}
module.exports.updateAccountNotificationsDetails = async (req) => {

    req.session.body.email = req.body.email;
    req.session.body.mobile = req.body.mobile;
    req.session.body.emailme = req.body.emailme;
    req.session.body.textme = req.body.textme;

    return await req.client.update({
        index: 'users',
        type: '_doc',
        id: req.session.body.id,
        body: {
            doc: {
                email: req.body.email,
                email_no_analyzer: req.body.email,
                mobile: req.body.mobile,
                mobile_no_analyzer: req.body.mobile,
                emailme: req.body.emailme,
                textme: req.body.textme,
            }
        }
    })
}

module.exports.updateAccountDetails = async (req) => {

    req.session.body.title = req.body.title;
    req.session.body.first_name = req.body.first_name;
    req.session.body.last_name = req.body.last_name;
    req.session.body.username = req.body.username;

    req.session.body.b_postcode = req.body.postcode;
    req.session.body.b_address1 = req.body.address_1;
    req.session.body.b_country = req.body.country;
    req.session.body.b_street = req.body.street;
    req.session.body.b_city = req.body.town;
    req.session.body.b_county = req.body.county;

    return await req.client.update({
        index: 'users',
        type: '_doc',
        id: req.session.body.id,
        body: {
            doc: {
                title: req.body.title,
                first_name: req.body.first_name,
                first_name_no_analyzer: req.body.first_name,
                last_name: req.body.last_name,
                last_name_no_analyzer: req.body.last_name,
                username: req.body.username,

                b_postcode: req.body.postcode,
                b_postcode_no_analyzer: req.body.postcode,
                b_address1: req.body.address_1,
                b_country: req.body.country,
                b_street: req.body.street,
                b_city: req.body.town,
                b_county: req.body.county,
            }
        }
    })
}
module.exports.getUserByIdEx = (req) => {
    return new Promise((resolve, reject)=>{
        req.client.search({
            index: 'users',
            q: `_id: "${req.body.id}"`
        }).then((res)=>{

            resolve(res);

        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err))
    })
}
module.exports.getUserById = (req) => {
    return new Promise((resolve, reject)=>{
        req.client.search({
            index: 'users',
            q: `_id: "${req.session.body.id}"`
        }).then((res)=>{

            resolve(res);

        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err))
    })
}
module.exports.getUserByIdEx2 = (req) => {
    return new Promise((resolve, reject)=>{
        req.client.search({
            index: 'users',
            q: `_id: "${req.body.id}"`
        }).then((res)=>{

            resolve(res);

        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err))
    })
}
module.exports.getUserByEmail = (req) =>{
    return new Promise((resolve,reject)=>{
        req.client.search({
            index: 'users',
            type: '_doc',
            body:{
                from: 0,
                size: 1,
                query:{
                    bool:{
                        filter: {
                            term: {email_no_analyzer:req.body.email,}
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
