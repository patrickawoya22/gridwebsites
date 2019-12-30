const nodemailer = require('nodemailer')
const activation_email_template = require('./Http/helpers/activation_email_template');
const contact_us_email_template = require('./Http/helpers/contact_us_email_template');
const contact_seller_email_template = require('./Http/helpers/contact_seller_email_template');
const order_email_template = require('./Http/helpers/order_email_template');
const review_reply_email_template = require('./Http/helpers/review_reply_email_template');

module.exports.sendReviewReplyEmail = async (req) => {

    return 0;
    // let transporter = nodemailer.createTransport(
    //     {
    //         host: req.MAIL_HOST,
    //         port: req.MAIL_PORT,
    //         // secure: account.smtp.secure,
    //         auth: {
    //             user: req.MAIL_USERNAME,
    //             pass: req.MAIL_PASSWORD
    //         },
    //         logger: false,
    //         debug: false // include SMTP traffic in the logs
    //     },
    //     {
    //         // default message fields
    //
    //         // sender info
    //         from: `Grid Websites`,
    //         headers: {
    //             // 'X-Laziness-level': 1000 // just an example header, no need to use this
    //         }
    //     }
    // );
    //
    // let emailProcess = await transporter.sendMail(review_reply_email_template.getMessage(req));
    // transporter.close();
    // // return [];
    // return emailProcess;

};
module.exports.sendContactSellerEmail = async (req) => {

    let transporter = nodemailer.createTransport(
        {
            host: req.MAIL_HOST,
            port: req.MAIL_PORT,
            // secure: account.smtp.secure,
            auth: {
                user: req.MAIL_USERNAME,
                pass: req.MAIL_PASSWORD
            },
            logger: false,
            debug: false // include SMTP traffic in the logs
        },
        {
            // default message fields

            // sender info
            from: `Grid Websites`,
            headers: {
                // 'X-Laziness-level': 1000 // just an example header, no need to use this
            }
        }
    );

    let emailProcess = await transporter.sendMail(contact_seller_email_template.getMessage(req));
    transporter.close();
    // return [];
    return emailProcess;
};

module.exports.sendAccountActivationEmail = async (req) => {

    let transporter = nodemailer.createTransport(
        {
            host: req.MAIL_HOST,
            port: req.MAIL_PORT,
            // secure: account.smtp.secure,
            auth: {
                user: req.MAIL_USERNAME,
                pass: req.MAIL_PASSWORD
            },
            logger: false,
            debug: false // include SMTP traffic in the logs
        },
        {
            // default message fields

            // sender info
            from: `Grid Websites`,
            headers: {
                // 'X-Laziness-level': 1000 // just an example header, no need to use this
            }
        }
    );
    let emailProcess =   await transporter.sendMail(activation_email_template.getMessage(req));
    transporter.close();
    // return [];
    return emailProcess;
};

module.exports.sendContactUsEmail = async (req) => {

    let transporter = nodemailer.createTransport(
        {
            host: req.MAIL_HOST,
            port: req.MAIL_PORT,
            // secure: account.smtp.secure,
            auth: {
                user: req.MAIL_USERNAME,
                pass: req.MAIL_PASSWORD
            },
            logger: false,
            debug: false // include SMTP traffic in the logs
        },
        {
            // default message fields

            // sender info
            from: `Grid Websites Contact Us Page`,
            headers: {
                // 'X-Laziness-level': 1000 // just an example header, no need to use this
            }
        }
    );
    let emailProcess =   await transporter.sendMail(contact_us_email_template.getMessage(req));
    transporter.close();
    // return [];
    return emailProcess;
};
module.exports.sentOrderEmail = async (req) => {

    let transporter = nodemailer.createTransport(
        {
            host: req.MAIL_HOST,
            port: req.MAIL_PORT,
            // secure: account.smtp.secure,
            auth: {
                user: req.MAIL_USERNAME,
                pass: req.MAIL_PASSWORD
            },
            logger: false,
            debug: false // include SMTP traffic in the logs
        },
        {
            // default message fields

            // sender info
            from: `Grid Websites Order`,
            headers: {
                // 'X-Laziness-level': 1000 // just an example header, no need to use this
            }
        }
    );
    let emailProcess =   await transporter.sendMail(order_email_template.getMessage(req));
    transporter.close();
    // return [];
    return emailProcess;
};