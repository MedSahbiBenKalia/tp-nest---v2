import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { SendEmailInterface } from 'src/interfaces/mail.interface';
@Injectable()
export class MailerService {
    constructor(private readonly ConfigService: ConfigService) {}
    mailTransport(){
        const transporter = nodemailer.createTransport({
            host: this.ConfigService.get('MAIL_HOST'),
            port: this.ConfigService.get('MAIL_PORT'),
            secure: this.ConfigService.get('MAIL_SECURE') === 'true',
            auth: {
                user: this.ConfigService.get('MAIL_USERNAME'),  
                pass: this.ConfigService.get('MAIL_PASSWORD'), 
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        return transporter;
    }

    async sendMail(sendEmailInterface : SendEmailInterface){
        const transporter = this.mailTransport();
        const options : Mail.Options ={
            from: sendEmailInterface.from ?? {
                address: this.ConfigService.get('DEFAULT_FROM_NAME'),
                name: this.ConfigService.get('APP_NAME') || '', 
            } as Mail.Address,
            to: sendEmailInterface.to, 
            subject: sendEmailInterface.subject, 
            text: sendEmailInterface.text, 
            html: sendEmailInterface.html, 
        };

        try{
            const result = await transporter.sendMail(options)
            return result;
        }
        catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email');
        }
    }

}
