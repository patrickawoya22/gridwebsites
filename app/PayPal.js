const moment = require('moment');
const date = moment();

module.exports.addPayPalCheckoutInformation = async (req, paymentObj) => {

    const data = {

        order_id: '',
        user_id:(req.session.isLoggedin)?req.session.body.id:req.DEFAULT_USER_ID,

        payment_status: 'initialised',
        payer_id: '',
        token: '',

    };

    return await req.client.index({
        index: req.env.GW_PAYPAL_CHECKOUT,
        type: '_doc',
        body: data
    });
};

module.exports.getPayPalCheckoutInformationById = async (req, id) => {

    return await req.client.search({
        index: req.env.GW_PAYPAL_CHECKOUT,
        q: `_id:"${id}"`
    });
};

module.exports.updatePayPalCheckoutInformation = async (req, _id, paymentObj) => {

    const date_created = moment(paymentObj.create_time).format('YYYY-MM-DD HH:mm:ss');

    const data = {

        paypal_payment_id: paymentObj.id,
        httpStatusCode: paymentObj.httpStatusCode,

        payment_status: 'pending',

        intent: paymentObj.intent,
        state: paymentObj.state,

        transactions: paymentObj.transactions,
        links: paymentObj.links,

        date_created,
        date_last_updated: date_created,
    };

    return await req.client.update({
        index: req.env.GW_PAYPAL_CHECKOUT,
        type: '_doc',
        id: _id,
        body: {
            doc: data
        }
    });
};
module.exports.updatePayPalCheckoutStatusAndOrderId = async (req, _id, payment_status, order_id) => {

    const date_last_updated = moment(date).format('YYYY-MM-DD HH:mm:ss');

    const data = {
        payment_status,
        date_last_updated,
        order_id,
    };

    return await req.client.update({
        index: req.env.GW_PAYPAL_CHECKOUT,
        type: '_doc',
        id: _id,
        body: {
            doc: data
        }
    });
};