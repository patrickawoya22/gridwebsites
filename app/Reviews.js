const users = require('./Users');
const replies = require('./ReviewsReplies');

module.exports.addUserReview = async (req) => {
    return await req.client.index({
        index: req.env.GW_REVIEWS,
        type: '_doc',
        body: {
            product_id:req.product_obj.hits.hits[0]._id,
            user_id: req.session.body.id,
            rating: parseInt(req.body.rate_input)<=5?parseInt(req.body.rate_input):5,
            review: req.body.comment.trim(),
            reviewer_name: req.session.body.first_name+' '+req.session.body.last_name.substring(0, 1),
            review_status:0,
            total_replies:0,
            date_created_no_analyzer:req.date,
            date_created:req.date,
            date_last_updated:req.date,
        }
    });
};
module.exports.addReviewsOnProducts = async (req) => {

    return await req.client.update({
        index: req.env.GW_PRODUCTS,
        type: '_doc',
        id: req.body.ref,
        body: {
            doc: {
                user_reviews: req.current_review_total,
                rating_average:req.rating_average,
            }
        }
    });
};

module.exports.searchProductReviews = (req) => {
    return new Promise((resolve,reject)=>{
        req.client.search({
            index: req.env.GW_REVIEWS,
            type: '_doc',
            body:{
                from: req.from,
                size: req.size,
                sort: [{ 'date_created': { 'order': 'DESC' } }],
                query:{
                    bool:{
                        filter: {
                            term: {product_id:req.body.ref,}
                        }
                    }
                }
            }
        }).then((body)=>{
            if (body.hits.total>0) {
                body.hits.hits.map((review_obj,index)=>{

                    req.body.id = review_obj._source.user_id;

                    req.body.review_id = review_obj._id;

                    replies.getAllReviewRepliesEx2(req).then((res2)=>{

                        // console.log(req.body.review_id, res2);

                        body.hits.hits[index]._source.replays_obj = res2;

                        // console.log(body.hits.hits[index]._source.replays_obj,' xxxx ',res2);

                        users.getUserByIdEx2(req).then((res)=>{

                            if(res.hits.total>0){

                                body.hits.hits[index]._source.user_obj = res;
                                body.hits.hits[index]._source.profile_img = res.hits.hits[0]._source.profile_img?res.hits.hits[0]._source.profile_img:`user.svg`;
                                body.hits.hits[index]._source.reviewer_name = `${res.hits.hits[0]._source.first_name} ${res.hits.hits[0]._source.last_name.substring(0,1)}`;

                                body.hits.hits[index]._source.rating_stars = '';
                                let j = 0;

                                for(let i = 0; i < review_obj._source.rating; i++){
                                    body.hits.hits[index]._source.rating_stars += '<img' +
                                        ' src="/img/icon/mark-as-favorite-star.svg" width="18" alt="star ratings">';
                                    j++;
                                }
                                while(j<5){
                                    body.hits.hits[index]._source.rating_stars += '<img' +
                                        ' src="/img/icon/mark-as-favorite-star1.svg" width="18" alt="star ratings">';
                                    j++;
                                }

                                if (req.session.isLoggedin && review_obj._source.user_id===req.session.body.id){
                                    body.hits.hits[index]._source.is_user = true;
                                } else {
                                    body.hits.hits[index]._source.is_user = false;
                                }
                            }
                            resolve(body);
                        });
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


module.exports.getReviewByID = (req) => {
    return new Promise((resolve, reject)=>{
        req.client.search({
            index: req.env.GW_REVIEWS,
            q: `_id: "${req.body.review_id}"`
        }).then((res)=>{

            resolve(res);

        },(error)=>{
            console.trace(error.message)
        }).catch(err => console.error(err))
    })
};

module.exports.deleteReview = async (req) => {
    return await req.client.delete({
        index: req.env.GW_REVIEWS,
        type: '_doc',
        id: req.body.review_id
    });
};

module.exports.getAllProductReviews = (req) => {
    return new Promise((resolve,reject)=>{
        req.client.search({
            index: req.env.GW_REVIEWS,
            type: '_doc',
            body:{
                query:{
                    bool:{
                        filter: {
                            term: {product_id:req.body.ref,}
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