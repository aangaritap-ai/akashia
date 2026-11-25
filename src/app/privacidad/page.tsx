import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Política de privacidad — Akashia" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de privacidad">
      <p>
        Esta política explica qué datos personales trata Akashia
        (akashia.app), para qué y qué puedes hacer con ellos, conforme a la Ley
        1581 de 2012 y sus normas reglamentarias en Colombia.
      </p>

      <h2>1. Responsable</h2>
      <p>
        {LEGAL.owner}, {LEGAL.city}. Contacto para todo lo relacionado con tus
        datos: {LEGAL.contact}.
      </p>

      <h2>2. Qué datos tratamos</h2>
      <ul>
        <li>
          <strong>Tu cuenta:</strong> nombre, correo, foto de perfil si la
          subes, fecha de registro y de último ingreso. La contraseña se guarda
          cifrada de forma irreversible.
        </li>
        <li>
          <strong>Lo que creas:</strong> cápsulas (texto, audio o video),
          mensajes y fotos en páginas memoriales, historias, fechas especiales y
          reacciones.
        </li>
        <li>
          <strong>Datos de otras personas que tú registras:</strong> nombre y
          correo de guardianes y destinatarios, y los nombres y fechas de tus
          fechas especiales. Al registrarlos confirmas que puedes hacerlo.
        </li>
        <li>
          <strong>Relaciones y avisos:</strong> a quién sigues, quién te sigue,
          qué historias has visto y tus notificaciones.
        </li>
        <li>
          <strong>Datos técnicos:</strong> nuestros proveedores registran datos
          como la dirección IP y el navegador para operar y proteger el
          servicio.
        </li>
      </ul>

      <h2>3. Si entras con Google</h2>
      <p>
        Recibimos de Google tu nombre, tu correo verificado y un identificador
        de tu cuenta. Los usamos únicamente para crear tu cuenta de Akashia y
        permitirte ingresar. No accedemos a tus correos, contactos ni archivos,
        no vendemos esos datos y no los usamos para publicidad. El uso de la
        información recibida de las API de Google cumple la{" "}
        <a href="https://developers.google.com/terms/api-services-user-data-policy">
          Política de Datos de Usuario de los Servicios API de Google
        </a>
        , incluidos sus requisitos de uso limitado.
      </p>

      <h2>4. Para qué usamos los datos</h2>
      <ul>
        <li>Crear y proteger tu cuenta.</li>
        <li>
          Guardar tus contenidos y entregarlos a los destinatarios en la fecha
          que elijas o tras la confirmación de tus guardianes.
        </li>
        <li>
          Enviar correos y avisos propios del servicio: invitaciones,
          entregas, recuperación de contraseña y recordatorios.
        </li>
        <li>Mostrar tus publicaciones a quienes corresponda.</li>
        <li>Prevenir abusos y cumplir obligaciones legales.</li>
      </ul>
      <p>
        No mostramos publicidad, no usamos herramientas de analítica de
        terceros y no vendemos datos personales.
      </p>

      <h2>5. Quién puede ver tu contenido</h2>
      <ul>
        <li>
          <strong>Cápsulas:</strong> tú y, cuando se entreguen, sus
          destinatarios.
        </li>
        <li>
          <strong>Historias:</strong> tú y los seguidores que apruebes, durante
          24 horas. Luego se ocultan y se borran en la siguiente limpieza
          diaria.
        </li>
        <li>
          <strong>Páginas memoriales y feed:</strong> son públicos, salvo los
          mensajes marcados como privados, que solo ve la persona dueña de la
          página.
        </li>
        <li>
          <strong>Fechas especiales:</strong> solo tú.
        </li>
        <li>
          <strong>Fotos, audios y videos:</strong> se guardan con enlaces
          difíciles de adivinar. Quien tenga el enlace puede abrir el archivo.
        </li>
        <li>
          <strong>Administración:</strong> el responsable tiene acceso técnico a
          la base de datos para operar el servicio y solo lo usa cuando es
          necesario. El contenido no está cifrado de extremo a extremo.
        </li>
      </ul>

      <h2>6. Proveedores y transferencia internacional</h2>
      <p>
        Para funcionar usamos proveedores que tratan datos por encargo nuestro,
        principalmente en Estados Unidos: Vercel (alojamiento y archivos), Neon
        (base de datos), Resend (correos), Cloudflare (dominio) y Google (solo
        si entras con Google). Al usar Akashia autorizas esa transmisión y
        transferencia internacional.
      </p>

      <h2>7. Cuánto tiempo los conservamos</h2>
      <p>
        Mientras tu cuenta exista o sea necesario para cumplir las entregas que
        programaste y las obligaciones legales. Puedes pedir la eliminación de
        tu cuenta y sus contenidos. Las copias técnicas de los proveedores se
        eliminan según sus propios plazos.
      </p>

      <h2>8. Cookies</h2>
      <p>
        Usamos solo las cookies necesarias para iniciar y mantener tu sesión de
        forma segura. Tu navegador también guarda localmente las reacciones que
        marcas.
      </p>

      <h2>9. Tus derechos</h2>
      <p>
        Puedes conocer, actualizar y rectificar tus datos; pedir prueba de la
        autorización; saber cómo los usamos; revocar la autorización o pedir que
        se eliminen cuando sea procedente; y acceder a ellos gratuitamente.
        Escribe a {LEGAL.contact}. Las consultas se responden en máximo 10 días
        hábiles (prorrogables 5) y los reclamos en máximo 15 días hábiles
        (prorrogables 8). Si no quedas conforme, puedes acudir a la
        Superintendencia de Industria y Comercio.
      </p>

      <h2>10. Menores de edad</h2>
      <p>
        Las cuentas son para mayores de 18 años. Si publicas contenido en el que
        aparecen menores, confirmas que tienes autorización de quien los
        representa y que respetas sus derechos.
      </p>

      <h2>11. Cambios</h2>
      <p>
        Si cambiamos esta política publicaremos la nueva versión aquí y, si el
        cambio es importante, te avisaremos.
      </p>
    </LegalPage>
  );
}
