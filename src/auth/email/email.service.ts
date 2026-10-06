import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer'
@Injectable()
export class EmailService {
    private readonly transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,       
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    async sendActivationEmail(to, link) {
         await this.transporter.sendMail({
                from: process.env.MAIL_USER,
                to,
                subject: 'Активация аккаунта на LexiDrill',
                text: '',
                html:`
                    <div>
                        <h1>Для активации перейдите по ссылке</h1>
                        <a href = "${link}">${link}</a>
                    </div>
                `
            })
    }
}
