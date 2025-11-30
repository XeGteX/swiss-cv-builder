
export class ConsoleEmailService {
    async sendEmail(to, subject, html) {
        console.log(`[EmailService] Sending email to ${to}`);
        console.log(`[Subject] ${subject}`);
        console.log(`[Body] ${html}`);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}
// Singleton instance
export const emailService = new ConsoleEmailService();
