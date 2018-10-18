const _ = require('lodash')

module.exports.getSearchResults = (getBlogs=null) =>{

    let search_arr = [];

    search_arr.push({
        'thumb_img_1': '50254.homepage.jpg',
        'main': '50254.homepage.jpg',
        'name': 'How to Install & Use Photoshop Actions',
        'category': 'E-Commerce',
        'date': 'May 26, 2016',
     });

     search_arr.push({
         'thumb_img_1': '50220.homepage.jpg',
         'main': '50220.homepage.jpg',
         'name': 'How to Install & Use Photoshop Actions',
         'category': 'Portfolio',
         'date': 'May 26, 2016',
      });

      search_arr.push({
          'thumb_img_1': '50254.homepage.jpg',
          'main': '50313.pic.jpg',
          'name': 'How to Install & Use Photoshop Actions',
          'category': 'Admin',
          'date': 'May 26, 2016',
       });

       // search_arr.push({
       //     'maxPrice': 75,
       //     'price_obj': true,
       //  });

    return search_arr;
}

module.exports.getFromSearchQueryCategories = (search_obj=null,req) =>{

    let category_arr = [];
    let checked = false;

    search_obj.forEach((category_obj)=>{
        if (!_.isEmpty(category_obj.category)) {

            if (_.includes(req.query.categories,category_obj.category)) {
                checked = true;
            }else {
                checked = false;
            }

            // checked

            category_arr.push({
                'name':category_obj.category,
                'tmp_name':category_obj.category.toLowerCase().replace(/\s/g, '-'),
                'checked' : checked
            });
        }
    });
    category_arr = _.uniq(category_arr);
    return category_arr;
}
