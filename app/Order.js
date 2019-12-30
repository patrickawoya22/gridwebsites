const moment = require('moment');
const date = moment();
const _ = require(`lodash`);

module.exports.addNewOrder = async (req, cartObj, payment_method, payment_id) => {

    const quantity = cartObj.hits.total;
    let order_status = 0;
    let tmp_order_status = 6;

    if (quantity > 0) {

        let order_items = [];
        let total_price = 0;
        let orderStatus = [];

        const date_created = moment(date).format('YYYY-MM-DD HH:mm:ss');

        cartObj.hits.hits.forEach((item, index) => {

            order_items.push(item);

            if (item._source.built_price > 0) {
                tmp_order_status = 1;
                order_items[index]._source.build_status = 1; // {1 => In process, 2 => Reviewed, 3 => Testing, 4 Completed, 5 Cancelled}
            } else {
                order_items[index]._source.build_status = 0; // not required
            }

            if (item._source.hosting_price > 0) {
                order_items[index]._source.hosting_status = 1; // {1 => In process, 2 => Setting up, 3 Completed, 4 Cancelled}
            } else {
                order_items[index]._source.hosting_status = 0; // not required
            }

            order_items[index]._source.order_status = tmp_order_status;

            orderStatus.push({order_status: tmp_order_status});

            total_price += ( item._source.offer_price + item._source.built_price + item._source.hosting_price );
        });

        orderStatus = _.orderBy(orderStatus, ['order_status'], ['asc']);

        order_status = orderStatus[0].order_status;

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
            index: req.env.GW_ORDERS,
            type: '_doc',
            body: data,
        });

    } else {
        throw new Error(`Error code 938398791! No items found in cart [${(req.session.isLoggedin)?req.session.body.id:req.DEFAULT_USER_ID}]`);
    }
};

module.exports.getStatusCode = (status) => {
    const order_status = {
        1 : 'Order has been received',
        2 : 'Cancelled',
        3 : 'Finalising',
        4 : 'Designing in progress',
        5 : 'Setting up docker hosting',
        6 : 'Completed',
    };
    return order_status[status];
};

module.exports.updateOrderStatus = async (req, _id, product_id, order_status) => {

    const order_obj = await getOrderByOrderId(req, _id).catch(error => { throw new Error(error)});

    let tmpOrdersObj = {};
    let order_items = [];
    let orderStatus = [];

    if (order_obj.hits.total > 0) {

        order_obj.hits.hits[0]._source.order_items.forEach((item) => {
            tmpOrdersObj = item;
            if (item._source.product_id === product_id) {
                tmpOrdersObj._source.order_status = order_status;
            }
            order_items.push(tmpOrdersObj);

            orderStatus.push({order_status: tmpOrdersObj._source.order_status});

        });

        let data = {
            order_items
        };

        await req.client.update({
            index: req.env.GW_ORDERS,
            type: '_doc',
            id: _id,
            body: {
                doc: data
            }
        });

        orderStatus = _.orderBy(orderStatus, ['order_status'], ['asc']);

        order_status = orderStatus[0].order_status;

        data = {
            order_status
        };

        return await req.client.update({
            index: req.env.GW_ORDERS,
            type: '_doc',
            id: _id,
            body: {
                doc: data
            }
        });

    } else {
        throw new Error(`Error code 309338022! Order not found.`);
    }
};

const getOrderByOrderId = (req, _id) => {
    return new Promise((resolve, reject) => {
        req.client.search({
            index: req.env.GW_ORDERS,
            q: `_id: "${_id}"`
        }).then((res) => {

            resolve(res);

        },(error) => {
            reject(error);
            console.trace(error.message)
        }).catch(err => console.error(err))
    });
};

module.exports.getOrderByPaymentId = async (req, payment_id) => {

    return await  req.client.search({
        index: req.env.GW_ORDERS,
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
module.exports.checkValidOrderByOrderIdAndProductCode = async (req) => {
    const order_obj = await getValidOrderByOrderIdAndProductCode(req);
    let isValid = true;

    if (order_obj.hits.total > 0) {
        order_obj.hits.hits.forEach(item => {
            item._source.order_items.forEach(item2 => {
                if (item2._source.product_id === req.params.product_id && +item2._source.order_status === 2) {
                    isValid = false;
                }
            });
        });
        return isValid;
    } else {
        throw new Error(`Error 33094009! No file found`);
    }
};
const getValidOrderByOrderIdAndProductCode = async (req) => {
    return await  req.client.search({
        index: req.env.GW_ORDERS,
        type: '_doc',
        body:{
            query:{
                bool:{
                    must: [
                        {
                            match:
                                {
                                _id: req.params.order_id,
                            }
                        },
                        {
                            match:
                                {
                                'order_items._source.product_id': req.params.product_id,
                            }
                        }
                    ]
                    // ,must_not: {
                    //     match: {
                    //         'order_items._source.order_status': 2,
                    //     }
                    // }
                }
            }
        }
    });
};
module.exports.getOrderedProductByUserId = async (req) => {
    return await  req.client.search({
        index: req.env.GW_ORDERS,
        type: '_doc',
        body:{
            sort: {
                date_created: {
                    order: 'DESC',
                },
            },
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
module.exports.getOrderByProductImageName = async (req) => {
    return await  req.client.search({
        index: req.env.GW_ORDERS,
        type: '_doc',
        body:{
            query:{
                bool:{
                    must: {
                        match: {
                            'order_items._source.image1': req.body.name.replace(/.png/g, '').replace(/.jpg/g, '').replace(/.gif/g, '').replace(/.svg/g, '').replace(/.jpeg/g, ''),
                        }
                    }
                }
            }
        }
    });
};
module.exports.getOrderStatus = () => {

};