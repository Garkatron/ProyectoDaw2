import { Resend } from 'resend';
import { requiredEnv } from './../utils/utils';
import bcrypt from "bcrypt";
const resend = new Resend(requiredEnv("RESEND_KEY"));

export default async function sendVerifycationEmail(emailto, code) {

  const { data } = await resend.emails.send({
    from: requiredEnv("RESEND_EMAIL_FROM"),
    to: emailto,
    subject: 'Email Verifycation',
    html: `<strong>${code}</strong>`,
  });

  return data;
}

export async function generateVerificationCode() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedCode = await bcrypt.hash(code, 10);
  return { code, hashedCode };
}
