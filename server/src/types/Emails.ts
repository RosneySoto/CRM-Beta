export interface EmailOptions {
   to: string;
   subject: string;
   html: string;
   attachments?: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
   }>;
}