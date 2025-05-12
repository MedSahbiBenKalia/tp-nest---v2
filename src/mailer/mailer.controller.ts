import { Controller, Get } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Get('send-test-email')
  async sendTestEmail() {
    const result = await this.mailerService.sendMail({
      to: 'medsahbibenkalaia@gmail.com',
      subject: 'Test Email',
      html: '<h1>Hello from NestJS Mailer</h1>',
      text: 'This is a test email sent from NestJS using Nodemailer.',
    });
    return {
      message: 'Test email sent successfully',
      result,
    };
  }
}
