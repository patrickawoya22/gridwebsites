const moment = require('moment');
const date = moment();

module.exports.addFile = async (req, name, product_id) => {

    const sort = 0;
    const date_created = moment(date).format('YYYY-MM-DD HH:mm:ss');

    const data = {
        name,
        name_no_analyzer: name,
        product_id,
        sort,
        user_id:(req.session.isLoggedin)?req.session.body.id:req.DEFAULT_USER_ID,
        date_created,
        date_last_updated: date_created,
    };

    return await req.client.index({
        index: req.env.GW_PRODUCT_ZIP_FILES,
        type: '_doc',
        body: data,
    });

};

module.exports.addNewProductZipFileAccessUsers = async (req, cartObj, order_id) => {

    const date_created = moment(date).format('YYYY-MM-DD HH:mm:ss');

    let promises = [];

    cartObj.hits.hits.forEach((item) => {

        promises.push(
            processAddNewProductZipFileAccessUsers(req, item._source.product_id, date_created, order_id).then((response) => {
                return response;
            }).catch((error) => {
                throw new Error(error);
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

};

const processAddNewProductZipFileAccessUsers = async (req, product_id, date_created, order_id) => {

    req.params.id = product_id;

    const file_obj = await getFilesProductId(req).catch((error) => {throw new Error(error);});

    if (file_obj.hits.total > 0) {

        const file_id = file_obj.hits.hits[0]._id;

        const data = {
            product_id,
            file_id,
            order_id,
            user_id: (req.session.isLoggedin) ? req.session.body.id : req.DEFAULT_USER_ID,
            date_created,
            date_last_updated: date_created,
        };

        return await req.client.index({
            index: req.env.GW_PRODUCT_ZIP_FILE_ACCESS_USERS,
            type: '_doc',
            body: data,
        });

    } else {
        throw new Error(`Error code 130390489! No file found.`);
    }

};

module.exports.updateFileName = async (req, _id, name) => {

    const data = {
        name,
        name_no_analyzer:name
    };

    return await req.client.update({
        index: req.env.GW_PRODUCT_ZIP_FILES,
        type: '_doc',
        id: _id,
        body: {
            doc: data
        }
    });
};
module.exports.deleteProductFile = async (req) => {
    return await req.client.delete({
        index: req.env.GW_PRODUCT_ZIP_FILES,
        type: '_doc',
        id: req.body.file_id,
    });
};
module.exports.getUserFilesUserId = async (req, user_id) => {

    return await  req.client.search({
        index: req.env.GW_PRODUCT_ZIP_FILES,
        type: '_doc',
        body:{
            sort: {
                date_created: {
                    order: 'DESC',
                },
            },
            query:{
                bool:{
                    must: [
                        {
                            match: {
                                user_id:user_id,
                            }
                        },{
                            match: {
                                product_id: req.params.id,
                            }
                        },
                    ],
                }
            }
        }
    })
};
module.exports.getProductZipFileAccessUsersByOrderCodeAndProductId = async (req) => {

    return await  req.client.search({
        index: req.env.GW_PRODUCT_ZIP_FILE_ACCESS_USERS,
        type: '_doc',
        body:{
            sort: {
                date_created: {
                    order: 'DESC',
                },
            },
            query:{
                bool:{
                    must: [
                        {
                            match: {
                                user_id:(req.session.isLoggedin)?req.session.body.id:req.DEFAULT_USER_ID,
                            }
                        },{
                            match: {
                                product_id: req.params.product_id,
                            }
                        },{
                            match: {
                                order_id: req.params.order_id,
                            }
                        },
                    ],
                }
            }
        }
    })
};
const getFilesProductId = async (req) => {

    return await  req.client.search({
        index: req.env.GW_PRODUCT_ZIP_FILES,
        type: '_doc',
        body:{
            sort: {
                date_created: {
                    order: 'DESC',
                },
            },
            query:{
                bool:{
                    must: [
                        {
                            match: {
                                product_id: req.params.id,
                            }
                        },
                    ],
                }
            }
        }
    })
};
module.exports.getProductZipFileAccessUsersByFileId = async (req) => {

    return await  req.client.search({
        index: req.env.GW_PRODUCT_ZIP_FILE_ACCESS_USERS,
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
                            file_id:req.body.file_id,
                        }
                    }
                }
            }
        }
    })
};
module.exports.getFileByFileId = (req) => {

    return new Promise((resolve, reject)=>{
        req.client.search({
            index: req.env.GW_PRODUCT_ZIP_FILES,
            q: `_id: "${req.body.file_id}"`
        }).then((res)=>{

            resolve(res);

        },(error)=>{
            console.trace(error.message)
        }).catch(err => reject(err))
    });
};
