const _ = require('lodash');

module.exports.getMessage = (req) => {

    let body = `Order ID: ${req.body.order_id}<br/>
               User Id: ${(req.session.isLoggedin) ? req.session.body.id : req.DEFAULT_USER_ID} <br/>`;

    // Comma separated list of recipients
    return {
        to: `Patrick Kakande gridtechservice@gmail.com`,

        // Subject of the message
        subject: 'Grid Websites order',

        // plaintext body
        text: `Order ID: ${req.body.order_id}<br/>
               User Id: ${(req.session.isLoggedin) ? req.session.body.id : req.DEFAULT_USER_ID} <br/>`,

        html: body,
    }
};
