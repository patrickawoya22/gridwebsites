const users = require('./Users');

module.exports.addReviewReply = async (req) => {
    return await req.client.index({
        index: req.env.GW_REVIEW_REPLIES,
        type: '_doc',
        body: {
            product_id:req.product_obj.hits.hits[0]._id,
            review_id: req.body.review_id,
            user_id: req.session.body.id,
            rating: 0,
            review: req.body.name.trim(),
            reviewer_name: req.session.body.first_name+' '+req.session.body.last_name.substring(0, 1),
            review_status:0,
            date_created_no_analyzer:req.date,
            date_created:req.date,
            date_last_updated:req.date,
        }
    })
};

module.exports.getAllReviewRepliesEx2 = (req) => {
    return new Promise((resolve,reject)=>{
        req.client.search({
            index: req.env.GW_REVIEW_REPLIES,
            type: '_doc',
            body:{
                query:{
                    bool:{
                        filter: {
                            term: {review_id:req.body.review_id,}
                        }
                    }
                }
            }
        }).then((body)=>{

            if (body.hits.total>0) {

                body.hits.hits.map((review_obj,index)=>{

                    users.getUserByIdEx2(req).then((res)=>{

                        if(res.hits.total>0){

                            body.hits.hits[index]._source.user_obj = res;
                            body.hits.hits[index]._source.profile_img = res.hits.hits[0]._source.profile_img?res.hits.hits[0]._source.profile_img:`user.svg`;
                            body.hits.hits[index]._source.reviewer_name = `${res.hits.hits[0]._source.first_name} ${res.hits.hits[0]._source.last_name.substring(0,1)}`;

                            if (req.session.isLoggedin && review_obj._source.user_id===req.session.body.id){
                                body.hits.hits[index]._source.is_user = true;
                            } else {
                                body.hits.hits[index]._source.is_user = false;
                            }
                        }

                        resolve(body);
                    });
                });
            } else {
                resolve(body);
            }

        }, (error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err));
    });
};

module.exports.deleteReview = async (req) => {
    return await req.client.delete({
        index: req.env.GW_REVIEW_REPLIES,
        type: '_doc',
        id: req.body.review_reply_id
    });
};

module.exports.getReviewReplyById = (req) => {
    return new Promise((resolve, reject)=>{
        req.client.search({
            index: req.env.GW_REVIEW_REPLIES,
            q: `_id: "${req.body.review_reply_id}"`
        }).then((res)=>{

            resolve(res);

        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err))
    })
};



module.exports.getAllReviewReplies = (req) => {
    return new Promise((resolve,reject)=>{
        req.client.search({
            index: req.env.GW_REVIEW_REPLIES,
            type: '_doc',
            body:{
                query:{
                    bool:{
                        filter: {
                            term: {review_id:req.body.review_id,}
                        }
                    }
                }
            }
        }).then((body)=>{
            resolve(body)
        }, (error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err));
    });
};