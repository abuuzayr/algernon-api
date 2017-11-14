import * as sendgrid from "sendgrid";
import { mail as helper } from "sendgrid";
import config from "../../config";

export const sendMail = ({
  fromEmail = config.defaultEmail,
  toEmail,
  subject,
  content,
  contentType = "text/html"
}: {
  fromEmail?: string;
  toEmail: string;
  subject: string;
  content: string;
  contentType?: string;
}) => {
  if (process.env.ENABLE_SENDGRID !== "0") {
    const mail = new helper.Mail(
      new helper.Email(fromEmail),
      subject,
      new helper.Email(toEmail),
      new helper.Content(contentType, content));
    const sg = sendgrid(config.sendgridKey);
    const request = sg.emptyRequest({
      method: "POST",
      path: "/v3/mail/send",
      body: mail.toJSON()
    });
    return sg.API(request);
  }
  return Promise.resolve({ statusCode: 202 });
};
