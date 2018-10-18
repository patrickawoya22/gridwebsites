

module.exports.getBlogs = (getBlogs=null) =>{

    let blogs_arr = [];

    blogs_arr.push({
        'thumb_img_1': '50254.homepage.jpg',
        'main': '50254.homepage.jpg',
        'name': 'How to Install & Use Photoshop Actions',
        'date': 'May 26, 2016',
     });

     blogs_arr.push({
         'thumb_img_1': '50220.homepage.jpg',
         'main': '50220.homepage.jpg',
         'name': 'How to Install & Use Photoshop Actions',
         'date': 'May 26, 2016',
      });

      blogs_arr.push({
          'thumb_img_1': '50254.homepage.jpg',
          'main': '50313.pic.jpg',
          'name': 'How to Install & Use Photoshop Actions',
          'date': 'May 26, 2016',
       });

    return blogs_arr;
}
