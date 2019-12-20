const _ = require('lodash');

module.exports.getMessage = (req) => {


    let body = `
     Name: ${req.body.title} ${req.body.first_name} ${req.body.last_name} <br/>
     Email: ${req.body.email} <br/>
     Mobile: ${req.body.mobile} <br/><br/>
     ${req.body.message}`;

    // Comma separated list of recipients
    return {
        to: `${_.startCase(req.body.first_name)} ${_.startCase(req.body.last_name)} ${req.MAIL_USERNAME}`,

        // Subject of the message
        subject: 'Grid Websites Contact us Email',

        // plaintext body
        text: `Name: ${req.body.title} ${req.body.first_name} ${req.body.last_name} <br/>
     Email: ${req.body.email} <br/>
     Mobile: ${req.body.mobile} <br/><br/>
     ${req.body.message}`,

        html: body,
    }
};
