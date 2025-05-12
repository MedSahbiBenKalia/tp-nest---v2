export interface SendEmailInterface {
    from?: string;
    to: string;
    subject: string;
    html: string;
    text?: string;
    
}