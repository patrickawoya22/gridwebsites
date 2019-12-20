const moment = require('moment');
const date = moment();

module.exports.addNewOrder = async (req, cartObj, payment_method, payment_id) => {

    const quantity = cartObj.hits.total;
    const order_status = 0;

    if (quantity > 0) {

        let order_items = [];
        let total_price = 0;

        const date_created = moment(date).format('YYYY-MM-DD HH:mm:ss');

        cartObj.hits.hits.forEach((item, index) => {

            order_items.push(item);

            if (item._source.built_price > 0) {
                order_items[index]._source.build_status = 1; // {1 => In process, 2 => Reviewed, 3 => Testing, 4 Completed, 5 Cancelled}
            } else {
                order_items[index]._source.build_status = 0; // not required
            }

            if (item._source.hosting_price > 0) {
                order_items[index]._source.hosting_status = 1; // {1 => In process, 2 => Setting up, 3 Completed, 4 Cancelled}
            } else {
                order_items[index]._source.hosting_status = 0; // not required
            }
            total_price += ( item._source.offer_price + item._source.built_price + item._source.hosting_price );
        });

        const data = {
            payment_method,
            order_items,
            payment_id,
            order_status,
            quantity,
            total_price,
            user_id:(req.session.isLoggedin)?req.session.body.id:req.DEFAULT_USER_ID,
            date_created,
            date_last_updated: date_created,
        };

        return await req.client.index({
            index: 'orders',
            type: '_doc',
            body: data,
        });

    } else {
        return [];
    }
};

module.exports.updateOrderStatus = async (req, _id, order_status) => {

    const data = {
        order_status
    };

    console.log(_id,data);

    return await req.client.update({
        index: 'orders',
        type: '_doc',
        id: _id,
        body: {
            doc: data
        }
    });
};

module.exports.getOrderByPaymentId = async (req, payment_id) => {

    return await  req.client.search({
        index: 'orders',
        type: '_doc',
        body:{
            query:{
                bool:{
                    filter: {
                        term: {
                            payment_id:payment_id,
                        }
                    }
                }
            }
        }
    })
};
module.exports.getOrderedProductByUserId = async (req) => {
    return await  req.client.search({
        index: 'orders',
        type: '_doc',
        body:{
            query:{
                bool:{
                    must: {
                        match: {
                            user_id: ((req.session.isLoggedin) ? req.session.body.id : req.DEFAULT_USER_ID),
                        }
                    }
                }
            }
        }
    })
};
module.exports.getOrderStatus = () => {

};