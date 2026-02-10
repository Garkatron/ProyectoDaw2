import { Resend } from 'resend';
import { requiredEnv } from './../utils/utils.js';
import bcrypt from "bcrypt";
const resend = new Resend(requiredEnv("RESEND_KEY"));

export default async function sendEmail(emailto, code) {
  const verificationLink = `${requiredEnv("FRONTEND_URL")}/emailcode`;

  const { data } = await resend.emails.send({
    from: requiredEnv("RESEND_EMAIL_FROM"),
    to: emailto,
    subject: '✉️ Verifica tu dirección de email',
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificación de Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Container principal -->
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                Verifica tu Email
              </h1>
            </td>
          </tr>
          
          <!-- Contenido -->
          <tr>
            <td style="padding: 40px;">
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                ¡Hola! 👋
              </p>
              
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                Gracias por registrarte. Para completar tu registro y activar tu cuenta, necesitamos verificar tu dirección de email.
              </p>
              
              <!-- Código de verificación -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px;">
                <p style="margin: 0 0 10px; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                  Tu código de verificación
                </p>
                <p style="margin: 0; font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${code}
                </p>
              </div>
              
              <!-- Botón CTA -->
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${verificationLink}" 
                   style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                  Verificar mi Email
                </a>
              </div>
              
              <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                O copia y pega este enlace en tu navegador:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #f8f9fa; border-radius: 6px; word-break: break-all;">
                <a href="${verificationLink}" style="color: #667eea; text-decoration: none; font-size: 13px;">
                  ${verificationLink}
                </a>
              </p>
              
              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <!-- Info de seguridad -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                  ⚠️ <strong>Nota de seguridad:</strong> Este código expira en 24 horas. Si no solicitaste este email, puedes ignorarlo de forma segura.
                </p>
              </div>
              
              <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6;">
                Si tienes algún problema, no dudes en contactarnos.
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 13px;">
                © ${new Date().getFullYear()} Limpora. Todos los derechos reservados.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Este es un email automático, por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
    `,
  });

  return data;
}


export async function generateVerificationCode() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedCode = await bcrypt.hash(code, 10);
  return { code, hashedCode };
}
