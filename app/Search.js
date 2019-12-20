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
};
