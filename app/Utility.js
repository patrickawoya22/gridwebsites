const cart = require('./Cart');
const products = require(`./Products`);
const utility = require(`./utility`);

module.exports.getDateAsNumber = () => {
    let d = new Date();
    return d.getTime();
};
module.exports.setCartCookie = (req, res) => {
    let randomNumber=Math.random().toString();
    randomNumber=randomNumber.substring(2,randomNumber.length);
    let cart_cookie_id = req.body.cookieName?req.body.cookieName:randomNumber+'-'+(utility.getDateAsNumber().toString());

    res.cookie('cookieName',cart_cookie_id, { maxAge: 2678400000, httpOnly: true });
    req.cookies.cookieName = cart_cookie_id;
};
module.exports.processCart = (req, res) => {

    cart.remoteDuplicates(req).then(() => {

       cart.getMyCartProductByCookieId(req).then((res2)=>{

           if (res2.hits.total===0) {

               req.params.id = req.body.ref;

               products.getMyProductByID(req).then((res3)=>{

                   if (res3.hits.total>0) {

                       req.products_obj = res3;

                       cart.addOrderToCart(req).then(()=>{
                           res.status(200).json({
                               body: req.body,
                           });
                       }).catch(err => console.error(err))
                   } else {
                       res.status(200).json({
                           error: [
                               {
                                   param:`order`,
                                   msg:`Item not found or sold out.`
                               }
                           ]
                       });
                   }
               }).catch(err => console.error(err))

           } else {

               req.params.id = req.body.ref;

               products.getMyProductByID(req).then((res3)=>{

                   if (res3.hits.total>0) {

                       req.products_obj = res3;

                       cart.updateCart(req,res2).then((response)=>{
                           res.status(200).json({
                               body: req.body,
                           });
                       }).catch(err => console.error(err))

                   } else {
                       res.status(200).json({
                           error: [
                               {
                                   param:`order`,
                                   msg:`Item not found or sold out.`
                               }
                           ]
                       });
                   }
               }).catch(err => console.error(err))

               // res.status(200).json({
               //     error: [
               //         {
               //             param:`order`,
               //             msg:`Item already added to your cart. <a href="/cart">View Cart</a>`,
               //         }
               //     ]
               // });
           }
       }).catch(err => console.error(err))
   }).catch(err => console.error(err))
};