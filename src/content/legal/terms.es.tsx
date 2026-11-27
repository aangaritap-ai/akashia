import { Link } from "@/i18n/navigation";
import { LEGAL } from "@/lib/legal";

export default function TermsEs() {
  return (
    <>
      <p>
        Estos términos regulan el uso de Akashia (akashia.app), operado por{" "}
        {LEGAL.owner}, {LEGAL.city}. Al crear una cuenta o usar el sitio los
        aceptas.
      </p>

      <h2>1. Qué es Akashia</h2>
      <p>
        Un servicio para dejar mensajes y recuerdos a tus seres queridos,
        programar su entrega, compartir historias y mantener páginas
        memoriales. Hoy es gratuito y está en etapa inicial: sus funciones
        pueden cambiar.
      </p>

      <h2>2. Tu cuenta</h2>
      <p>
        Debes ser mayor de 18 años, dar información verdadera y cuidar tu forma
        de ingreso. Eres responsable de lo que se haga desde tu cuenta.
      </p>

      <h2>3. Guardianes y entregas</h2>
      <ul>
        <li>
          Tú eliges a tus guardianes. Su confirmación de un fallecimiento activa,
          después de un periodo de espera, la entrega de las cápsulas
          correspondientes. Elígelos con cuidado.
        </li>
        <li>
          Confirmar falsamente un fallecimiento está prohibido y puede tener
          consecuencias legales.
        </li>
        <li>
          Hacemos esfuerzos razonables por entregar a tiempo, pero no podemos
          garantizarlo: depende de correos correctos, de proveedores externos y
          de la continuidad del servicio. Akashia no reemplaza un testamento ni
          tiene efectos de documento legal. Conserva copia de lo que sea
          irremplazable.
        </li>
      </ul>

      <h2>4. Tu contenido</h2>
      <p>
        Sigue siendo tuyo. Nos autorizas a guardarlo, mostrarlo y enviarlo
        únicamente para prestar el servicio según lo que configures. Debes tener
        derecho a publicarlo y contar con el permiso de las personas que
        aparecen en él.
      </p>

      <h2>5. Lo que no se permite</h2>
      <ul>
        <li>Contenido ilegal, violento, sexual, de odio o de acoso.</li>
        <li>Cualquier contenido que ponga en riesgo a menores.</li>
        <li>Suplantar personas o publicar datos privados de terceros.</li>
        <li>Enviar publicidad no solicitada o intentar vulnerar el servicio.</li>
      </ul>
      <p>
        Podemos retirar contenido o suspender cuentas que incumplan estas
        reglas. Para reportar algo escribe a {LEGAL.contact}.
      </p>

      <h2>6. Disponibilidad y responsabilidad</h2>
      <p>
        El servicio se ofrece tal como está. En la medida que la ley lo permita,
        no respondemos por daños indirectos ni por interrupciones o pérdidas
        causadas por terceros o fuerza mayor. Nada de esto limita los derechos
        que la ley colombiana te reconoce como consumidor.
      </p>

      <h2>7. Cierre</h2>
      <p>
        Puedes dejar de usar Akashia y eliminar tu cuenta desde tu perfil
        cuando quieras. Si el servicio fuera a cerrar, avisaremos con antelación
        razonable para que puedas recuperar tu contenido.
      </p>

      <h2>8. Privacidad, cambios y ley aplicable</h2>
      <p>
        El tratamiento de datos se describe en la{" "}
        <Link href="/privacidad">política de privacidad</Link>. Publicaremos aquí
        los cambios a estos términos. Se rigen por las leyes de la República de
        Colombia.
      </p>
    </>
  );
}
