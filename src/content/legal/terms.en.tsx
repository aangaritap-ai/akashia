import { Link } from "@/i18n/navigation";
import { LEGAL } from "@/lib/legal";

export default function TermsEn() {
  return (
    <>
      <p>
        <em>
          This is a translation. If there is any difference, the Spanish version
          prevails.
        </em>
      </p>
      <p>
        These terms govern the use of Akashia (akashia.app), operated by{" "}
        {LEGAL.owner}, {LEGAL.city}. By creating an account or using the site you
        accept them.
      </p>

      <h2>1. What Akashia is</h2>
      <p>
        A service to leave messages and memories to your loved ones, schedule
        their delivery, share stories and keep memorial pages. Today it is free
        and at an early stage: its features may change.
      </p>

      <h2>2. Your account</h2>
      <p>
        You must be over 18, give truthful information and look after your way of
        logging in. You are responsible for what is done from your account.
      </p>

      <h2>3. Guardians and deliveries</h2>
      <ul>
        <li>
          You choose your guardians. Their confirmation of a death triggers,
          after a waiting period, the delivery of the corresponding capsules.
          Choose them carefully.
        </li>
        <li>
          Falsely confirming a death is forbidden and may have legal
          consequences.
        </li>
        <li>
          We make reasonable efforts to deliver on time, but we can’t guarantee
          it: it depends on correct email addresses, external providers and the
          continuity of the service. Akashia does not replace a will and has no
          effect as a legal document. Keep a copy of anything irreplaceable.
        </li>
      </ul>

      <h2>4. Your content</h2>
      <p>
        It remains yours. You authorize us to store, show and send it only to
        provide the service according to your settings. You must have the right
        to post it and the permission of the people who appear in it.
      </p>

      <h2>5. What is not allowed</h2>
      <ul>
        <li>Illegal, violent, sexual, hateful or harassing content.</li>
        <li>Any content that puts minors at risk.</li>
        <li>Impersonating people or publishing others’ private data.</li>
        <li>Sending unsolicited advertising or trying to breach the service.</li>
      </ul>
      <p>
        We may remove content or suspend accounts that break these rules. To
        report something, write to {LEGAL.contact}.
      </p>

      <h2>6. Availability and liability</h2>
      <p>
        The service is offered as is. To the extent permitted by law, we are not
        liable for indirect damages or for interruptions or losses caused by
        third parties or force majeure. Nothing here limits the rights that
        Colombian law grants you as a consumer.
      </p>

      <h2>7. Closing</h2>
      <p>
        You can stop using Akashia and delete your account from your profile
        whenever you want. If the service were to close, we would give reasonable
        notice so you can recover your content.
      </p>

      <h2>8. Privacy, changes and applicable law</h2>
      <p>
        Data processing is described in the{" "}
        <Link href="/privacidad">privacy policy</Link>. We will publish changes to
        these terms here. They are governed by the laws of the Republic of
        Colombia.
      </p>
    </>
  );
}
