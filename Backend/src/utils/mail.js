import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "MarketPulse",
            link: "https://localhost:5173"
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
    const emailHTML = mailGenerator.generate(options.mailgenContent);

    const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "698026777ddb70",
            pass: "d5c34792fa02a8"
        }
    });

    const mail = {
        from: "teamMarketPulse@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHTML,
    }

    try {
        await transport.sendMail(mail)
    } catch (error) {
        console.error("Something went wrong ", error);
    }

}


const emailVerificationMail = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to MarketPulse ! Excited to have you on board ",
            action: {
                instructions: "To verify yourself as user please click the following button",
                button: {
                    color: "#10b981",
                    text: "Verify",
                    link: verificationUrl
                },
            },
            outro: "If you need help, please reply back to this email"
        }
    }
}

const resetPasswordMail = (username, resetPasswordUrl) => {
    return {
        body: {
            name: username,
            intro: "We received the request to change the password",
            action: {
                instructions: "To change your current password please click the following button",
                button: {
                    color: "#10b981",
                    text: "Reset",
                    link: resetPasswordUrl
                },
            },
            outro: "If the request is not initiated by you, kindly ignore the mail"
        }
    }
}

export {
    emailVerificationMail,
    resetPasswordMail,
    sendEmail
}