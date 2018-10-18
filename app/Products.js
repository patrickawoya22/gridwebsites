
const _ = require(`lodash`);

module.exports.addNewProduct = async (req) =>{

    return await req.client.index({
        index: 'products',
        type: '_doc',
        body: getProductJson(req)
    })

}

module.exports.getProductByID = (req,id) => {
    return new Promise((resolve,reject)=>{
        return req.client.get({
            id: id,
            index: 'products',
            type: '_doc',
        }).then((body)=>{
            resolve(body)
        },(error)=>{
            console.trace(error.message,'eeeezzxx')
        }).catch(err => console.error(err))
    })
}

module.exports.updateProductDetails = async (req) =>{

    return await req.client.update({
        index: 'products',
        type: '_doc',
        body: {
            doc: getProductJson(req)
        }
    })

}

module.exports.getTemplates = (req=null,description='all') =>{

    let temp_arr = [];

    let created_by_field = req.session.LanguagePack.selected_pack.hits.hits[0]._source.created_by_field;

    if (_.isEmpty(req.session.LanguagePack.selected_pack.hits.hits[0]._source.created_by_field)){
        created_by_field = req.session.LanguagePack.defualt_pack.hits.hits[0]._source.created_by_field;
    }

    temp_arr.push({
        'thumb_img_1': 'dashboard.png',
        'main_img': 'dashboard.png',
        'creator':'Patrick KAKANDE',
        'category_1':'Dashboard',
        created_by_field,
    });

    temp_arr.push({
        'thumb_img_1': 'dashboard.png',
        'main_img': 'dashboard.png',
        'creator':'Patrick KAKANDE',
        'category_1':'Dashboard',
        created_by_field,
    });

    temp_arr.push({
        'thumb_img_1': 'dashboard.png',
        'main_img': 'dashboard.png',
        'creator':'Patrick KAKANDE',
        'category_1':'Dashboard',
        created_by_field,
    });

    if (description==='email') {

        temp_arr = [];
        temp_arr.push({
            'thumb_img_1': '58d9619daa920d07209924e6_portfolio wireframe.jpg',
             'main_img': '58d9619daa920d07209924e6_portfolio wireframe.jpg',
             'creator':'Patrick KAKANDE',
             'category_1':'Dashboard',
             created_by_field,
        });
        temp_arr.push({
            'thumb_img_1': '58531d7356ce728d0ed603a9_milton-thumb.jpg',
             'main_img': '58531d7356ce728d0ed603a9_milton-thumb.jpg',
             'creator':'Patrick KAKANDE',
             'category_1':'Dashboard',
             req:req,
        });
        temp_arr.push({
            'thumb_img_1': '58531d7356ce728d0ed605a7_escape@2x.jpg',
             'main_img': '58531d7356ce728d0ed605a7_escape@2x.jpg',
             'creator':'Patrick KAKANDE',
             'category_1':'Dashboard',
             created_by_field,
        });
        temp_arr.push({
            'thumb_img_1': '58d96228a9b7cbf61f6b0815_business wireframe copy.jpg',
             'main_img': '58d96228a9b7cbf61f6b0815_business wireframe copy.jpg',
             'creator':'Patrick KAKANDE',
             'category_1':'Dashboard',
             created_by_field,
        });
    }

    return temp_arr;
}

const getProductJson = (req) =>{
    return {
        name:req.body.name,
        language_code:req.body.language_code,
        language:req.body.language,
        price:req.body.price,
        discount_price:req.body.discount_price,
        built_price:req.body.built_price,
        hosting_price:req.body.hosting_price,
        extra:req.body.extra,
        features:req.body.features,
        category:req.body.category,
        code_quality:req.body.code_quality,
        description:req.body.description,
    }
}
