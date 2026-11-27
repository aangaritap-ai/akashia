import { LEGAL } from "@/lib/legal";

export default function PrivacyEn() {
  return (
    <>
      <p>
        <em>
          This is a translation. If there is any difference, the Spanish version
          prevails.
        </em>
      </p>
      <p>
        This policy explains what personal data Akashia (akashia.app) processes,
        what for and what you can do with it, under Colombian Law 1581 of 2012
        and its regulations.
      </p>

      <h2>1. Data controller</h2>
      <p>
        {LEGAL.owner}, {LEGAL.city}. Contact for anything related to your data:{" "}
        {LEGAL.contact}.
      </p>

      <h2>2. What data we process</h2>
      <ul>
        <li>
          <strong>Your account:</strong> first name, last name, phone, city and
          email (required); profile photo if you upload one, preferred language,
          sign-up date and last log-in. Your password is stored irreversibly
          encrypted. If you fill them in, also your cover photo, the text about
          you, your motto and the day and month of your birthday (we don’t store
          the year). We use your phone only to contact you about your account,
          its security and deliveries: it is not shown to other users or used for
          advertising.
        </li>
        <li>
          <strong>What you create:</strong> capsules (text, audio or video),
          messages and photos on memorial pages, stories, special dates and
          reactions.
        </li>
        <li>
          <strong>Other people’s data that you enter:</strong> the name, email
          and chosen email language of guardians and recipients, and the names
          and dates of your special dates. By entering them you confirm that you
          are allowed to.
        </li>
        <li>
          <strong>Connections and notifications:</strong> who you follow, who
          follows you, which stories you have seen, which ones you like and your
          notifications.
        </li>
        <li>
          <strong>Technical data:</strong> our providers record data such as IP
          address and browser to operate and protect the service. To stop abuse
          we briefly keep a code derived from the IP address.
        </li>
      </ul>

      <h2>3. If you sign in with Google</h2>
      <p>
        We receive from Google your name, your verified email and an identifier
        of your account. We use them only to create your Akashia account and let
        you log in. We don’t access your emails, contacts or files, we don’t sell
        that data and we don’t use it for advertising. Our use of information
        received from Google APIs complies with the{" "}
        <a href="https://developers.google.com/terms/api-services-user-data-policy">
          Google API Services User Data Policy
        </a>
        , including its Limited Use requirements.
      </p>

      <h2>4. What we use the data for</h2>
      <ul>
        <li>To create and protect your account.</li>
        <li>
          To keep your content and deliver it to recipients on the date you
          choose or after your guardians confirm.
        </li>
        <li>
          To send the service’s own emails and notices: invitations, deliveries,
          password recovery and reminders.
        </li>
        <li>To show what you post to those who should see it.</li>
        <li>To prevent abuse and meet legal obligations.</li>
      </ul>
      <p>
        We don’t show advertising, we don’t use third-party analytics tools and
        we don’t sell personal data.
      </p>

      <h2>5. Who can see your content</h2>
      <ul>
        <li>
          <strong>Profile:</strong> your name, photo, cover, text and motto are
          public on your page. Your city is shown only if you turn it on, and
          your birthday only to your approved followers if you turn it on.
        </li>
        <li>
          <strong>Capsules:</strong> you and, once delivered, their recipients.
        </li>
        <li>
          <strong>Stories</strong> (photos and videos): you and the followers you
          approve, for 24 hours. They are then hidden and deleted in the next daily cleanup.
        </li>
        <li>
          <strong>New on Akashia:</strong> people with an account can see the
          name and photo of those who signed up in the last 30 days.
        </li>
        <li>
          <strong>Mutual connections:</strong> in follow requests and
          suggestions, other people with an account can see how many connections
          they share with you, and the photo of some of them.
        </li>
        <li>
          <strong>Memorial pages and feed:</strong> they are public, except
          messages marked as private, which only the page owner can see.
        </li>
        <li>
          <strong>Paw Prints (pet pages):</strong> they are public, with the same
          rules as memorial pages.
        </li>
        <li>
          <strong>Special dates:</strong> only you.
        </li>
        <li>
          <strong>Photos, audio and video:</strong> they are stored under
          hard-to-guess links. Anyone with the link can open the file.
        </li>
        <li>
          <strong>Administration:</strong> the data controller has technical
          access to the database to run the service and uses it only when
          necessary. Content is not end-to-end encrypted.
        </li>
      </ul>

      <h2>6. Providers and international transfer</h2>
      <p>
        To operate we use providers that process data on our behalf, mainly in
        the United States: Vercel (hosting and files), Neon (database), Resend
        (email), Cloudflare (domain) and Google (only if you sign in with
        Google). By using Akashia you authorize this international transfer.
      </p>

      <h2>7. How long we keep it</h2>
      <p>
        For as long as your account exists or as needed to complete the
        deliveries you scheduled and meet legal obligations. You can delete your
        account and its content from your profile; capsules already delivered
        remain with those who received them. Our providers’ technical copies are
        deleted on their own schedules. We also make our own backup copies, which
        we keep for about three months.
      </p>

      <h2>8. Cookies</h2>
      <p>
        We only use the cookies needed to start and keep your session securely
        and to remember the language you chose. Your browser also stores locally
        the reactions you mark and the people suggestions you hide.
      </p>

      <h2>9. Your rights</h2>
      <p>
        You can know, update and correct your data; ask for proof of your
        authorization; learn how we use it; withdraw your authorization or ask
        for deletion where applicable; and access it free of charge. Write to{" "}
        {LEGAL.contact}. Enquiries are answered within 10 business days
        (extendable by 5) and complaints within 15 business days (extendable by
        8). If you are not satisfied, you can go to the Superintendence of
        Industry and Commerce of Colombia.
      </p>

      <h2>10. Minors</h2>
      <p>
        Accounts are for people over 18. If you post content showing minors, you
        confirm that you have permission from whoever represents them and that
        you respect their rights.
      </p>

      <h2>11. Changes</h2>
      <p>
        If we change this policy we will publish the new version here and, if the
        change is significant, we will let you know.
      </p>
    </>
  );
}
