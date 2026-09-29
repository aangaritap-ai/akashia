const wrap = (title: string, body: string) => `
<div style="background:#FAF6EF;padding:48px 24px;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid rgba(31,26,15,0.1);border-radius:16px;padding:40px;color:#221D16;">
    <div style="color:#B8935A;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:12px;">Akashia</div>
    <h1 style="font-size:24px;margin:0 0 20px;color:#221D16;">${title}</h1>
    <div style="font-size:15px;line-height:1.7;color:#4A4436;">${body}</div>
  </div>
</div>`;

export function guardianInviteEmail(opts: {
  guardianName: string;
  ownerName: string;
  confirmUrl: string;
}) {
  return wrap(
    "Te han designado como guardián",
    `<p>Hola ${opts.guardianName},</p>
     <p><strong>${opts.ownerName}</strong> te ha elegido como una de las personas de confianza en Akashia,
     un lugar donde guarda mensajes para sus seres queridos.</p>
     <p>Si en algún momento ${opts.ownerName} llegara a fallecer, tu confirmación (junto a la de otro guardián,
     si los hay) ayuda a que sus mensajes se entreguen a quienes ama.</p>
     <p><a href="${opts.confirmUrl}" style="display:inline-block;background:#1B3A5C;color:#FAF6EF;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;">Ver mi rol de guardián</a></p>
     <p style="color:#8A8172;font-size:13px;">No necesitas hacer nada ahora. Solo guarda este correo.</p>`
  );
}

export function passwordResetEmail(opts: { name: string; resetUrl: string }) {
  return wrap(
    "Recupera tu contraseña",
    `<p>Hola ${opts.name},</p>
     <p>Recibimos una solicitud para restablecer tu contraseña en Akashia. Si fuiste tú, haz clic abajo:</p>
     <p><a href="${opts.resetUrl}" style="display:inline-block;background:#1B3A5C;color:#FAF6EF;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;">Elegir nueva contraseña</a></p>
     <p style="color:#8A8172;font-size:13px;">Este enlace vence en 1 hora. Si no fuiste tú, ignora este correo.</p>`
  );
}

export function guardianConfirmedNoticeEmail(opts: {
  ownerName: string;
  guardianName: string;
}) {
  return wrap(
    "Un guardián confirmó tu fallecimiento",
    `<p>${opts.guardianName} confirmó en Akashia el fallecimiento de ${opts.ownerName}.</p>`
  );
}

export function capsuleDeliveredEmail(opts: {
  recipientName: string;
  senderName: string;
  title: string;
  textContent?: string | null;
  mediaUrl?: string | null;
  mediaType?: "AUDIO" | "VIDEO" | null;
}) {
  const mediaBlock = opts.mediaUrl
    ? `<p><a href="${opts.mediaUrl}" style="color:#1B3A5C;font-weight:600;">Escuchar / ver el mensaje (${opts.mediaType === "VIDEO" ? "video" : "audio"})</a></p>`
    : "";
  const textBlock = opts.textContent
    ? `<div style="white-space:pre-line;background:#F3EEE3;border-radius:10px;padding:20px;margin-top:12px;">${opts.textContent}</div>`
    : "";
  return wrap(
    `Un mensaje de ${opts.senderName} para ti`,
    `<p>Hola ${opts.recipientName},</p>
     <p><strong>${opts.senderName}</strong> dejó este mensaje para ti en Akashia: "${opts.title}"</p>
     ${textBlock}
     ${mediaBlock}`
  );
}
