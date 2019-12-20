const _ = require('lodash')

module.exports.getMessage = (req) => {


    let body = `
            <!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Joined Successfully</title>
    </head>
    <body style="background:#f3f3f3;">
        <table tyle="background-color: #f3f3f3;font-family: arial, helvetica, sans-serif;font-size:18px;line-height:1.5;" data-width="600" dir="ltr" data-mobile="true" width="100%" bgcolor="#f3f3f3" border="0" cellpadding="0" cellspacing="0" >
            <tbody>
                <tr>
                    <td style="margin:0;padding:0;" valign="top">
                        <table tyle="border-width: 30px 23px 60px; border-style: solid; border-color: rgb(255, 255, 255); width: 600px;" width="600" align="center" bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0">
                            <thead><!--./start header-->
                                <tr>
                                    <th>
                                        <table cellpadding="30">
                                            <tbody>
                                                <tr>
                                                    <td align="left"><a href="#"><img src="https://encraze.com/img/logo/encraze.png" alt="Contact Grid websites" width="130" ></a></td>
                                                    <td align="right">
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </th>

                                </tr>
                            </thead><!--./End header-->
                            <tbody>
                                <tr>
                                    <td colspan="2">
                                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tbody>
                                                <tr>
                                                   <td align="center" style="border-top:1px solid #f3f3f3;"></td>
                                                </tr>
                                             </tbody>
                                        </table>
                                    </td>
                                </tr>
                                <tr><!--section 1-->
                                    <td colspan="2">
                                        <table cellpadding="30" style="font-family: arial, helvetica, sans-serif;font-size:16px;line-height:1;">
                                            <tbody>
                                                <tr>
                                                    <td style="padding-bottom: 0px;">
                                                        <br>
                                                        Dear <span id="name">${_.startCase(req.body.first_name)}</span>, <br>
                                                        <p style="padding-top:15px;margin-bottom:0;"><strong>Welcome to <span id="company-name2">Grid websites</span>!</strong></p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr><!-- ./section 1 -->

                                <tr><!-- ./section 3 -->
                                    <td colspan="2">
                                        <table cellpadding="30" style="font-family: arial, helvetica, sans-serif;font-size:16px;line-height:1.5;">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <p style="margin-top:0;">
                                                        Thank you for creating your account with us.                                                
                                                        </p>
                                                        <p>
                                                        In order for us to keep you updated on orders, notifications and special offers we need to verify your email address. Please click on the below to activate your account.
</p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr><!-- ./section 3 -->
                                <tr><!-- ./section 4 -->
                                    <td colspan="2">
                                        <table cellpadding="30" style="font-family: arial, helvetica, sans-serif;font-size:16px;line-height:1.5;text-align: center;width:100%;">
                                            <tbody>
                                                <!--<tr>
                                                    <td>
                                                        You are now ready to set up your account and start receiving leads immediately. There is a <strong><a href="#" style="color:#1EA0F2;" >GET STARTED</a></strong> section to assist.
                                                    </td>
                                                </tr>-->
                                                <tr>
                                                    <td style="padding-top:0">
                                                        <a href="http://localhost:3000/activation?code=${req.activation_code}" 
                                                        style="color:#428BCA;font-size:1.5rem;text-decoration: none;">Click here to activate your account</a>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr><!-- ./section 4 -->
                            </tbody>
                            <tfoot><!-- ./footer -->
                                <tr cellpadding="10">
                                    <td colspan="2">
                                        <table style="font-size:15px;" width="100%" cellpadding="10">
                                            <tbody>
                                                <tr>
                                                    <td align="center" colspan="2">
                                                        <p>
                                                            © <span id="year">${(new Date()).getFullYear()}</span> Grid websites. All Rights Reserved.
                                                        </p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tfoot><!-- ./footer -->
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </body>
</html>

`;

    // Comma separated list of recipients
    return {
        to: `${_.startCase(req.body.first_name)} ${_.startCase(req.body.last_name)} ${req.body.email}`,

        // Subject of the message
        subject: 'New Grid Websites Account',

        // plaintext body
        text: `Dear ${_.startCase(req.body.first_name)}, Thank you for creating your account with us Grid websites. Please visit the follow link to 
activate your account <a href="http://localhost:3000/activation?code=${req.activation_code}">http://localhost:3000/activation?code=${req.activation_code}</a>.`,
        // HTML body
        html: body,
    }
}
