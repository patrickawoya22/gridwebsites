const _ = require(`lodash`);
const ba64 = require("ba64");
const fs = require('fs');
const resizeImg = require('resize-img');
const each = require('sync-each');
const users = require(`./Users`);
const product = require(`./Products`);

module.exports.addNewProduct = async (req) =>{

    return await req.client.index({
        index: req.env.GW_PRODUCTS,
        type: '_doc',
        body: {
            name:req.body.name,
            name_no_analyzer:req.body.name,
            brand:'',
            keyword: req.body.name + ' ' + req.body.type,
            publish:0,
            vat:0,
            language_id:'',
            main_category:req.body.category,
            video:'',
            quantity:0,
            stock_status:1,
            offer:0,
            main_category_no_analyzer:req.body.category,
            language_code:req.body.language_code,
            language:req.body.language,
            price: parseFloat(req.body.price),
            offer_price: parseFloat(req.body.discount_price),
            built_price: parseFloat(req.body.built_price),
            hosting_price: parseFloat(req.body.hosting_price),
            extra:req.body.extra,
            version:req.body.version,
            features:req.body.features,
            category:req.body.category,
            type:req.body.type,
            code_quality:req.body.code_quality,
            description:req.body.description,
            date_created:req.date,
            offer_start_date:'1980-01-01 00:00:00',
            offer_end_date:'1980-01-01 00:00:00',
            date_last_updated:req.date,
            order_counts:0,
            user_reviews:0,
            rating_average:0,
            overviews:0,
            supplier:((req.session.isLoggedin) ? req.session.body.id : req.DEFAULT_USER_ID),
            finder:'',
        }
    })

};
module.exports.updateProductOrderCounts = async (req, cartObj) => {

    let promises = [];

    if (cartObj.hits.total > 0) {

        cartObj.hits.hits.forEach((item) => {

            req.body.ref = item._id;

            promises.push(
                updateActualProductOrderCounts(req, item).then((response) => {
                    return response;
                }).catch((error) => {
                    throw error;
                })
            );
        });

    } else {
        return [];
    }
};
const updateActualProductOrderCounts = async (req, cartProductObj) => {

    const product_id = cartProductObj._source.product_id;

    req.body.ref = product_id;

    const currentProductObj = await product.searchUserProductsById(req).catch((error) => {throw error});

    if (currentProductObj.hits.total === 1) {

        const order_counts = parseFloat(currentProductObj.hits.hits[0]._source.order_counts) + parseFloat(cartProductObj._source.quantity);

        const data = {
            order_counts
        };

        return await req.client.update({
            index: req.env.GW_PRODUCTS,
            type: '_doc',
            id: product_id,
            body: {
                doc: data
            }
        });

    } else {
        throw new Error(`Error 29038973! no product matching cart product id!`);
    }

};
module.exports.addNewProductImageToDB = async (req) => {

    return await req.client.index({
        index: 'product_images',
        type: '_doc',
        body: {
            name:`${req.name}.png`,
            name_no_analyzer:`${req.name}.png`,
            product_id:req.body.ref,
            user_id:((req.session.isLoggedin) ? req.session.body.id : req.DEFAULT_USER_ID),
            sort:req.sort,
            date_created:req.date,
            date_last_updated:req.date,
        }
    })
};
module.exports.addNewProductImageToFile = (req) => {

    return new Promise((resolve,reject) => {

        let base64Data = req.body.image_data;

        ba64.writeImage(req.modulePath+`/public/img/project/img-origin/${req.name}`, base64Data, function(err){
            if (err) throw err;
            resolve(`Image saved successfully`);

            resizeImg(fs.readFileSync(req.modulePath+`/public/img/project/img-origin/${req.name}.png`), {width: 846, height: 512}).then(buf => {
                fs.writeFileSync(req.modulePath+`/public/img/project/img-main/${req.name}.png`, buf);
            });

            resizeImg(fs.readFileSync(req.modulePath+`/public/img/project/img-origin/${req.name}.png`), {width: 406, height: 246}).then(buf => {
                fs.writeFileSync(req.modulePath+`/public/img/project/img-thumb/${req.name}.png`, buf);
            });

        });

    });
};

module.exports.getUserTemplateImagesByTemplateId = (req) => {
    return new Promise((resolve,reject)=>{
        req.client.search({
            index: 'product_images',
            type: '_doc',
            body:{
                sort: [{ 'sort': { 'order': 'ASC' } }],
                query:{
                    bool:{
                        must:[{
                            match:{
                                user_id:((req.session.isLoggedin) ? req.session.body.id : req.DEFAULT_USER_ID),
                            },
                            match:{
                                product_id:req.body.ref,
                            }
                        }],
                    }
                }
            },
        }).then((body)=>{
            resolve(body)
        }, (error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err))
    });
};

module.exports.getMyProductByID = (req) => {
    return new Promise((resolve, reject)=>{
        if (req.params.id.toString().toLowerCase()==='add') {
            resolve([])
        } else {
            req.client.search({
                index: req.env.GW_PRODUCTS,
                q: `_id: "${req.params.id}"`
            }).then((res)=>{

                if (res.hits.total>0) {
                    getProductImages(req).then((res2)=>{
                        res.hits.hits[0]._source.image_obj = res2;
                        resolve(res);
                    }).catch(err => console.error(err))
                }else{
                    resolve(res);
                }

            },(error)=>{
                console.trace(error.message)
            }).catch(err => console.error(err))
        }
    })
};

const getProductImages = (req) => {
    return new Promise((resolve,reject)=>{
        req.client.search({
            index: 'product_images',
            type: '_doc',
            body:{
                sort: [{ 'sort': { 'order': 'ASC' } }],
                query:{
                    bool:{
                        must:{
                            match:{
                                product_id:req.params.id,
                            }
                        },
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

module.exports.getAutoCompleteProducts = (req) => {

    let productJson = [];

    return new Promise((resolve,reject)=>{
        req.client.search({
            index: req.env.GW_PRODUCTS,
            type: '_doc',
            body:{
                query:{
                    bool:{
                        must:{
                            multi_match: {
                                query: req.query.q,
                                type: 'cross_fields',
                                analyzer: 'standard',
                                operator: 'and',
                                fields: ['main_category', 'name^10'],
                            },
                        },
                    }
                }
            }
        }).then((body)=>{

            if (body.hits.total > 0) {
                body.hits.hits.forEach((item) => {

                    productJson.push({
                        value: `${item._source.name} - ${item._source.main_category}`,
                        data: item._id,
                        name: item._source.name,
                    });

                });

            } else {
                productJson.push({
                    value: 'No matching results',
                    data: 'No matching results'
                });
            }

            resolve(productJson);

        }, (error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err))
    })
};

module.exports.updateProductDetails = async (req) => {

    return await req.client.update({
        index: req.env.GW_PRODUCTS,
        type: '_doc',
        id: req.body.ref,
        body: {
            doc: {
                name:req.body.name,
                name_no_analyzer:req.body.name,
                language_code:req.body.language_code,
                language:req.body.language,
                price: parseFloat(req.body.price),
                offer_price: parseFloat(req.body.discount_price),
                built_price: parseFloat(req.body.built_price),
                hosting_price: parseFloat(req.body.hosting_price),
                extra:req.body.extra,
                version:req.body.version,
                features:req.body.features,
                category:req.body.category,
                keyword:req.body.name +' '+ req.body.type,
                type:req.body.type,
                main_category:req.body.category,
                main_category_no_analyzer:req.body.category,
                code_quality:req.body.code_quality,
                description:req.body.description,
                date_last_updated:req.date,
            }
        }
    })
};

module.exports.getProductsBySupplier = (req) => {

    return new Promise((resolve,reject)=>{
        req.client.search({
            index: req.env.GW_PRODUCTS,
            type: '_doc',
            body:{
                from: req.from,
                size: req.size,
                query:{
                    bool:{
                        must:{
                            match:{
                                supplier:((req.session.isLoggedin) ? req.session.body.id : req.DEFAULT_USER_ID),
                            }
                        },
                    }
                }
            }
        }).then((body) => {

            if (body.hits.total>0) {

                let i = 0;

                each(body.hits.hits,
                    function (product_obj,next) {

                        req.params.id = product_obj._id;

                        getProductImages(req).then((res2)=>{

                            req.body.id = body.hits.hits[i]._source.supplier;

                            users.getUserByIdEx(req).then((res3)=>{
                                body.hits.hits[i]._source.image_obj = res2;
                                body.hits.hits[i]._source.user_obj = res3;
                                body.hits.hits[i]._source.user_obj.hits.hits[0]._source.last_name_short = body.hits.hits[i]._source.user_obj.hits.hits[0]._source.last_name.substring(0, 1);
                                body.hits.hits[i]._source.url_name = body.hits.hits[i]._source.name.toString().replace(/ /g, '+');
                                i++;
                                next();
                            })
                        }).catch(err => console.error(err));

                    },
                    function (err,transformedItems) {
                        /**
                         * success callback
                         */
                        resolve(body)
                    }
                );
            }else{
                resolve(body);
            }

        }, (error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err))
    });
};
module.exports.searchUserProductsById = (req) => {
    return new Promise((resolve, reject)=>{
        if (req.body.ref.toString().trim()==='') {
            resolve([])
        } else {
            req.client.search({
                index: req.env.GW_PRODUCTS,
                q: `_id: "${req.body.ref}"`
            }).then((res)=>{

                resolve(res);

            },(error)=>{
                console.trace(error.message)
            }).catch(err => console.error(err))
        }
    });
};

module.exports.deleteProductImage = async (req) => {
    return await req.client.delete({
        index: 'product_images',
        type: '_doc',
        id: req.body.image_id,
    });
};
module.exports.getProductImageById = (req) => {

    return new Promise((resolve, reject)=>{
        req.client.search({
            index: 'product_images',
            q: `_id: "${req.body.image_id}"`
        }).then((res)=>{

            resolve(res);

        },(error)=>{
            console.trace(error.message)
        }).catch(err => reject(err))
    });
};
module.exports.getProducts = (req) => {
    return new Promise((resolve,reject)=>{
        req.client.search({
            index: req.env.GW_PRODUCTS,
            type: '_doc',
            body:{
                from: req.from,
                size: req.size,
                query:{
                    bool:{
                        must:{
                            match:{
                                category:req.category,
                            }
                        },
                    }
                }
            }
        }).then((body)=>{

            if (body.hits.total>0) {

                let i = 0;

                each(body.hits.hits,
                    function (product_obj,next) {

                        req.params.id = product_obj._id;

                        getProductImages(req).then((res2)=>{

                            req.body.id = body.hits.hits[i]._source.supplier;

                            users.getUserByIdEx(req).then((res3)=>{
                                body.hits.hits[i]._source.image_obj = res2;
                                body.hits.hits[i]._source.user_obj = res3;
                                body.hits.hits[i]._source.user_obj.hits.hits[0]._source.last_name_short = body.hits.hits[i]._source.user_obj.hits.hits[0]._source.last_name.substring(0, 1);
                                body.hits.hits[i]._source.url_name = body.hits.hits[i]._source.name.toString().replace(/ /g, '+');
                                i++;
                                next();
                            })
                        }).catch(err => console.error(err))

                    },
                    function (err,transformedItems) {
                        /**
                         * success callback
                         */
                        resolve(body)
                    }
                );
            }else{
                resolve(body);
            }
        }, (error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err))
    })
};
module.exports.getCategoriesFromSearchedResults = (searchResults,req) =>{

    let category_arr = [];
    let checked = false;

    searchResults.hits.hits.forEach((category_obj) => {

        if (!_.isEmpty(category_obj._source.category)) {

            if (_.includes(req.query.categories,category_obj._source.category)) {
                checked = true;
            }else {
                checked = false;
            }

            // checked

            category_arr.push({
                'name':category_obj._source.category,
                'tmp_name':category_obj._source.category.toLowerCase().replace(/\s/g, '-'),
                'checked' : checked
            });
        }
    });

    category_arr = _.uniqWith(category_arr, _.isEqual);
    return category_arr;
};
module.exports.searchProducts = (req) => {
    let categoriesObj = req.query.categories && req.query.categories.toString().trim().length > 0 ? req.query.categories.split(',') : [] ;
    const priceObj = req.query.price && req.query.price.toString().trim().length > 0 ? req.query.price.split('-') : [] ;
    let sortObj = req.query.sort && req.query.sort.toString().trim().length > 0 ? req.query.sort.split(':') : [] ;
    let queryArray = [];
    let queryArray2 = [];
    let sortAction = '';
    let sortStr1 = '';
    let sortStr2 = '';

    if (!_.isEmpty(sortObj)) {
        sortAction = !_.isEmpty(sortObj[0])?sortObj[0].trim().toLowerCase():'';
        sortObj = !_.isEmpty(sortObj[1])?sortObj[1].split('to'):sortObj;
        sortStr1 = !_.isEmpty(sortObj[0])?sortObj[0].trim().toLowerCase() : '' ;
    } else {
        sortObj = [];
    }

    console.log(sortStr1);

    if (!_.isEmpty(sortObj)&&!_.isEmpty(sortAction)) {
        if (sortAction == 'price' && sortStr1 == 'low') {
            sortObj = {
                offer_price: {
                    order: 'ASC',
                }
            };
        } else if (sortAction == 'price' && sortStr1 == 'high') {
            sortObj = {
                offer_price: {
                    order: 'DESC',
                }
            };
        } else if (sortStr1 == 'relevance') {
            sortObj = '_score';
        } else if (sortStr1 == 'avg. customer review') {
            sortObj = {
                user_reviews: {
                    order: 'DESC',
                }
            };
        } else {
            sortObj = '_score';
        }
    } else {
        sortObj = '_score';
    }

    queryArray.push({
        multi_match: {
            query: req.query.q,
            type: 'cross_fields',
            analyzer: 'standard',
            operator: 'and',
            fields: ['main_category^5', 'description', 'main_category_no_analyzer^4', 'name^10', 'keyword^6'],
        },
    });

    categoriesObj.forEach((item) => {
        categoriesObj = item.split('|');
        categoriesObj.forEach((item2) => {
            categoriesObj = item2.split(':');
            categoriesObj.forEach((item3, index3) => {
                if (item3.length > 1 && !_.isEmpty(categoriesObj[index3+1]) && +categoriesObj[index3+1]===0) {
                    queryArray2.push({
                        multi_match: {
                            query: item3,
                            type: 'cross_fields',
                            analyzer: 'standard',
                            operator: 'and',
                            fields: ['main_category'],
                        },
                    });
                }
            });
        });
    });

    if (!_.isEmpty(priceObj) && priceObj.length > 1) {
        queryArray.push({
            range: {
                offer_price: {
                    gt : priceObj[0],
                    lt : priceObj[1]
                }
            }
        });
    }

    return new Promise((resolve,reject)=>{
        req.client.search({
            index: req.env.GW_PRODUCTS,
            type: '_doc',
            body:{
                from: req.from,
                size: req.size,
                sort: sortObj,
                query:{
                    bool:{
                        must: queryArray,
                        must_not: queryArray2
                    }
                }
            }
        }).then((body)=>{

            if (body.hits.total>0) {

                let i = 0;

                each(body.hits.hits,
                    function (product_obj,next) {

                        req.params.id = product_obj._id;

                        getProductImages(req).then((res2)=>{

                            req.body.id = body.hits.hits[i]._source.supplier;

                            users.getUserByIdEx(req).then((res3)=>{
                                body.hits.hits[i]._source.image_obj = res2;
                                body.hits.hits[i]._source.user_obj = res3;
                                body.hits.hits[i]._source.user_obj.hits.hits[0]._source.last_name_short = body.hits.hits[i]._source.user_obj.hits.hits[0]._source.last_name.substring(0, 1);
                                body.hits.hits[i]._source.url_name = body.hits.hits[i]._source.name.toString().replace(/ /g, '+');
                                i++;
                                next();
                            })
                        }).catch(err => console.error(err));

                    },
                    function (err,transformedItems) {
                        /**
                         * success callback
                         */
                        resolve(body)
                    }
                );
            }else{
                resolve(body);
            }
        }, (error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err));
    });
};