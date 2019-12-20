$(document).on('ready page:load', function () {
    $(document).foundation();
});
$(document).on('page:change', function () {
    $(document).foundation('equalizer', 'reflow');
});

var getUrlParameter = function getUrlParameter(sParam) {
   var sPageURL = decodeURIComponent(window.location.search.substring(1)),
       sURLVariables = sPageURL.split('&'),
       sParameterName,
       i;

   for (i = 0; i < sURLVariables.length; i++) {
       sParameterName = sURLVariables[i].split('=');

       if (sParameterName[0] === sParam) {
           return sParameterName[1] === undefined ? true : sParameterName[1];
       }
   }
};
$('.pointer.low').mouseup(function() {
    console.log('change links');
});
var controller = {
    removeProductReview:function(title,action,id){

        $('#dialog-confirm').show();
        $( function() {
            $( "#dialog-confirm" ).dialog({
                resizable: false,
                height: "auto",
                width: 400,
                modal: true,
                buttons: {
                    [$('#confirm').val()]: function() {
                        $( this ).dialog( "close" );
                    },
                    // [""+confirm+""]: function() {
                    //     //console.log('#'+action+'-'+id);
                    // }
                }
            });
        });

    }, getCategories : function () {
        return new Promise(function (resolve, reject) {
            var url = '';
            searchProducts.currentCategories.forEach(function(item){
                setTimeout(function () {
                    url += item.categories+':'+(searchProducts.selectedCategories.indexOf(item.categories) > -1 ? 1 : 0)+'|';
                },1);
            });
            setTimeout(function () {
                resolve(url);
            },10)
        });
    }
    // getCategories : function(new_category=null){
    //     if (new_category==null) {
    //         var tmpCategory = getUrlParameter('categories');
    //         if (typeof tmpCategory == 'undefined') {
    //             return '';
    //         } else {
    //             return tmpCategory;
    //         }
    //     }else {
    //         if (typeof getUrlParameter('categories') == 'undefined') {
    //             return new_category;
    //         }
    //         var action = 'add';
    //         if (getUrlParameter('categories').match(new_category)!=null) {
    //             action = 'remove';
    //         }
    //
    //         var tmp_str = getUrlParameter('categories')+','+new_category;
    //         tmp_str = tmp_str.split(',').clean('');
    //         var unique_str = [];
    //         $.each(tmp_str, function(i, el){
    //             if($.inArray(el, unique_str) === -1&&action=='add'||new_category!=el) unique_str.push(el);
    //         });
    //         var _str = '';
    //         var first_run = true;
    //
    //         unique_str.forEach(function(str){
    //             if (first_run) {
    //                 _str += str;
    //                 first_run = false;
    //             }else {
    //                 _str += ','+str;
    //             }
    //         });
    //         return _str;
    //     }
    // }
    ,getPriceRage : function(){
        var minPrice = $('.pointer-label.low').html();
        var maxPrice = $('.pointer-label.high').html();
        return minPrice+'-'+maxPrice;
    },getSort : function(){
        if (typeof getUrlParameter('sort') == 'undefined') {
            return '';
        }else {
            return getUrlParameter('sort');
        }
    },getSearch : function(){
        if (typeof getUrlParameter('q') == 'undefined') {
            return '';
        }else {
            return getUrlParameter('q');
        }
    },loadUrl : function(){
        this.getCategories().then(function (categoriesResponse) {
            window.location.replace(window.location.pathname+'?q='+controller.getSearch()+'&sort='+controller.getSort()+'&categories='+categoriesResponse+'&price='+controller.getPriceRage());
        }).catch(function (error) {
            alert(error);
        });
    }
};

Array.prototype.clean = function(deleteValue) {
   for (var i = 0; i < this.length; i++) {
     if (this[i] == deleteValue) {
       this.splice(i, 1);
       i--;
     }
   }
   return this;
 };
