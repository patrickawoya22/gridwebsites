const utility = require(`./Utility`);
const _ = require(`lodash`);
const each = require('sync-each');
const cart = require(`./Cart`);

module.exports.updateOfflineCartCookie = (req) => {
    return new Promise((resolve,reject)=>{
        cart.getCartItemsByUserId(req).then((res)=>{
            if (res.hits.total>0) {

                each(res.hits.hits,
                    function (cart_obj,next) {

                        req.cart_obj = cart_obj;

                        updateCartCookieId(req).then(()=>{
                            next();
                        });

                    },
                    function (err,transformedItems) {
                        /**
                         * success callback
                         */
                        resolve(1)
                    }
                );

                // res.hits.hits.map((cart_obj)=>{
                //
                // })
            } else {
                resolve(0)
            }
        })
    });
};

module.exports.updateOfflineCartItems = (req) => {
    return new Promise((resolve,reject)=>{
        getMyOfflineCartItems(req).then((res)=>{
            if (res.hits.total>0) {

                each(res.hits.hits,
                    function (cart_obj,next) {

                        req.cart_obj = cart_obj;

                        updateCartUserId(req).then(()=>{
                            next();
                        });

                    },
                    function (err,transformedItems) {
                        /**
                         * success callback
                         */
                        resolve(1)
                    }
                );

                // res.hits.hits.map((cart_obj)=>{
                //
                // })
            } else {
                resolve(0)
            }
        })
    });
};

module.exports.synchronizeCart = async (req) => {

    const cartObj = await getMyOfflineCartItems(req).catch(error => console.log(error));

    let promises = [];

    if (cartObj.hits.total > 0) {
        cartObj.hits.hits.forEach((item) => {
            if (_.isEmpty(item._source.user_id)) {

                req.cart_obj = item;

                promises.push(
                    updateCartUserId(req).then((response) => {
                        return response;
                    }).catch((error) => {
                        throw error;
                    })
                );
            }
        });
    }

    return new Promise((resolve, reject) => {
        if (!_.isEmpty(promises)) {
            Promise.all(promises).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        } else {
            resolve([]);
        }
    });
};

module.exports.remoteDuplicates = (req) => {
    return new Promise((resolve,reject)=>{

        let duplicate_items = [];

        cart.getCartItemsByCookieId(req).then((res)=>{
            if (res.hits.total>0) {

                each(res.hits.hits,
                    function (cart_obj,next) {

                        req.cart_obj = cart_obj;

                        req.params.id = cart_obj._source.product_id;

                        getCartItemsByProductId(req).then((res2)=>{
                            if (res2.hits.total > 1){
                                req.cart_obj = res2.hits.hits[0];
                                if (!_.findKey(duplicate_items, { product_id: res2.hits.hits[0]._source.product_id })) {
                                    duplicate_items.push({
                                        _id:res2.hits.hits[0]._id,
                                        product_id:res2.hits.hits[0]._source.product_id,
                                    });
                                }
                            }
                            next();
                        });

                    },
                    function (err,transformedItems) {
                        /**
                         * success callback
                         */
                        req.duplicate_items = duplicate_items;

                        deleteDuplicates(req).then(()=>{
                            resolve(1)
                        }).catch(err => console.error(err))
                    }
                );

                // res.hits.hits.map((cart_obj)=>{
                //
                // })
            } else {
                resolve(0)
            }
        })
    });
};

const deleteDuplicates = (req) => {
    return new Promise((resolve, reject)=>{
        each(req.duplicate_items,
            function (duplicates,next) {

                req.item_id = duplicates._id;
                deleteDuplicate(req).then(()=>{
                    next();
                }).catch(err => console.error(err))
            },
            function (err,transformedItems) {
                resolve(1)
            }
         );
    })
}

const deleteDuplicate = async (req) => {
    return await req.client.delete({
        index: req.env.GW_CART,
        type: '_doc',
        id: req.item_id
    });
};

module.exports.deleteCartItem = async (req) => {
    return await req.client.delete({
        index: req.env.GW_CART,
        type: '_doc',
        id: req.body.ref
    });
};

module.exports.deleteCartByIds = async (req, cartObj) => {

    let promises = [];

    if (cartObj.hits.total > 0) {

        cartObj.hits.hits.forEach((item) => {

            req.body.ref = item._id;

            promises.push(
                cart.deleteCartItem(req).then((response) => {
                    return response;
                }).catch((error) => {
                    throw error;
                })
            );
        });

        return new Promise((resolve, reject) => {

            Promise.all(promises).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });

        });

    } else {
        return [];
    }
};

module.exports.getCartById = (req) => {
    return new Promise((resolve, reject)=>{
        req.client.search({
            index: req.env.GW_CART,
            q: `_id: "${req.body.ref}"`
        }).then((res)=>{

            resolve(res);

        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err))
    });
};

const updateCartCookieId =  async (req) => {
    return await req.client.update({
        index: req.env.GW_CART,
        type: '_doc',
        id: req.cart_obj._id,
        body: {
            doc: {
                cart_cookie:req.cookies.cookieName,
            }
        }
    })
};

const updateCartUserId =  async (req) => {
    return await req.client.update({
        index: req.env.GW_CART,
        type: '_doc',
        id: req.cart_obj._id,
        body: {
            doc: {
                user_id: (req.session.isLoggedin)?req.session.body.id:req.DEFAULT_USER_ID,
            }
        }
    })
};

const getMyOfflineCartItems = (req) => {
    return new Promise((resolve,reject)=>{
        req.client.search({
            index: req.env.GW_CART,
            type: '_doc',
            body:{
                query:{
                    bool:{
                        must:[
                            {
                                match:{
                                    user_id:'',
                                },
                            },
                        ],
                        filter: {
                            term: {cart_cookie:req.cookies.cookieName,}
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
};
module.exports.getCartItemsByCookieId = (req) => {
    return new Promise((resolve,reject)=>{
        req.client.search({
            index: req.env.GW_CART,
            type: '_doc',
            body:{
                query:{
                    bool:{
                        filter: {
                            term: {cart_cookie:req.cookies.cookieName,}
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
};
module.exports.getCartItemsByCookieIdEx = (req,res) => {
    return new Promise((resolve,reject)=>{

        if (_.isEmpty(req.cookies.cookieName)&&req.session.isLoggedin) {

            cart.getCartItemsByUserId(req).then((res2)=>{
                if (_.isEmpty(req.cookies.cookieName)&&res2.hits.total>0) {
                    req.body.cookieName = res2.hits.hits[0]._source.cart_cookie;
                    utility.setCartCookie(req, res);
                    resolve(res2);
                }else{
                    resolve(res2);
                }
            });


        } else {

            if (_.isEmpty(req.cookies.cookieName)){
                req.cookies.cookieName = '';
            }

            req.client.search({
                index: req.env.GW_CART,
                type: '_doc',
                body:{
                    query:{
                        bool:{
                            filter: {
                                term: {cart_cookie:req.cookies.cookieName ? req.cookies.cookieName : '' ,}
                            }
                        }
                    }
                }
            }).then((body)=>{
                resolve(body)
            }, (error)=>{
                console.trace(error.message)
            }).catch(err => console.error(err))
        }
    })
};
const getCartItemsByProductId = (req) => {
    return new Promise((resolve,reject)=>{
        req.client.search({
            index: req.env.GW_CART,
            type: '_doc',
            body:{
                sort: [{ 'date_last_updated': { 'order': 'ASC' } }],
                query:{
                    bool:{
                        filter: {
                            term: {product_id:req.params.id,}
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
};
module.exports.getCartItemsByUserId = (req) => {
    return new Promise((resolve,reject)=>{
        req.client.search({
            index: req.env.GW_CART,
            type: '_doc',
            body:{
                query:{
                    bool:{
                        filter: {
                            term: {user_id:((req.session.isLoggedin) ? req.session.body.id : req.DEFAULT_USER_ID)}
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
};
module.exports.addOrderToCart = async (req) => {
    return await req.client.index({
        index: req.env.GW_CART,
        type: '_doc',
        body: {
            cart_cookie: req.cookies.cookieName,
            cart_version: utility.getDateAsNumber(),
            product_id:req.products_obj.hits.hits[0]._id,
            user_id:(req.session.isLoggedin)?req.session.body.id:req.DEFAULT_USER_ID,
            price:parseFloat(req.products_obj.hits.hits[0]._source.price),
            offer_price:parseFloat(req.products_obj.hits.hits[0]._source.offer_price),
            quantity:1,
            offer:req.products_obj.hits.hits[0]._source.offer,
            built_price: req.body.designed?parseFloat(req.products_obj.hits.hits[0]._source.built_price): 0.00,
            hosting_price: req.body.hosted?parseFloat(req.products_obj.hits.hits[0]._source.hosting_price): 0.00,
            hosted:req.body.hosted,
            designed:req.body.designed,
            image1:req.products_obj.hits.hits[0]._source.image_obj.hits.hits[0]._source.name,
            product_name:req.products_obj.hits.hits[0]._source.name,
            main_category:req.products_obj.hits.hits[0]._source.main_category,
            date_created:req.date,
            date_last_updated:req.date,
        }
    });
};

module.exports.updateCart = async (req,res2) => {

    return await req.client.update({
        index: req.env.GW_CART,
        type: '_doc',
        id: res2.hits.hits[0]._id,
        body: {
            doc: {
                price:parseFloat(req.products_obj.hits.hits[0]._source.price),
                offer_price:parseFloat(req.products_obj.hits.hits[0]._source.offer_price),
                quantity:1,
                offer:req.products_obj.hits.hits[0]._source.offer,
                built_price: req.body.designed? parseFloat(req.products_obj.hits.hits[0]._source.built_price): 0.00,
                hosting_price: req.body.hosted? parseFloat(req.products_obj.hits.hits[0]._source.hosting_price): 0.00,
                hosted:req.body.hosted,
                designed:req.body.designed,
                image1:req.products_obj.hits.hits[0]._source.image_obj.hits.hits[0]._source.name,
                product_name:req.products_obj.hits.hits[0]._source.name,
                main_category:req.products_obj.hits.hits[0]._source.main_category,
                date_last_updated:req.date,
            }
        }
    });
};

module.exports.getMyCartProductByCookieId = (req) =>{
    return new Promise((resolve,reject)=>{
        req.client.search({
            index: req.env.GW_CART,
            type: '_doc',
            body:{
                query:{
                    bool:{
                        must:[
                            {
                                match:{
                                    product_id:req.body.ref,
                                },
                            },
                        ],
                        filter: {
                            term: {cart_cookie:req.cookies.cookieName,}
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
};

module.exports.getMyCartItemsByUserId = (req) =>{
    return new Promise((resolve,reject)=>{
        req.client.search({
            index: req.env.GW_CART,
            type: '_doc',
            body:{
                query:{
                    bool:{
                        filter: {
                            term: {user_id:(req.session.isLoggedin)?req.session.body.id:req.DEFAULT_USER_ID,}
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
};