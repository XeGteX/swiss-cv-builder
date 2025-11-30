
export interface EmailService {
    sendEmail(to: string, subject: string, html: string): Promise<void>;
}

export class ConsoleEmailService implements EmailService {
    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        console.log(`[EmailService] Sending email to ${to}`);
        console.log(`[Subject] ${subject}`);
        console.log(`[Body] ${html}`);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// Singleton instance
export const emailService = new ConsoleEmailService();
