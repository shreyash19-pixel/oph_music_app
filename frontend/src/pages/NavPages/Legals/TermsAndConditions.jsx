import React from "react";
import { Helmet } from "react-helmet";

// Reusable Section component
const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-2xl font-semibold text-[#5DC9DE] mb-2">{title}</h2>
    {children}
  </section>
);

const TermsAndConditions = () => {
  return (
    <>
      <Helmet>
        <title>Terms and Conditions - OPH Community</title>
        <meta
          name="description"
          content="Read the official Terms and Conditions and Artist Agreement for the OPH Music Community Platform."
        />
      </Helmet>

      <div className="px-6 lg:px-10 xl:px-16 pt-32 pb-10 bg-black text-white min-h-screen">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-[#5DC9DE]">
            Terms and Conditions of the OPH Music Community Platform
          </h1>
          <p className="mb-4">
            Welcome to the OPH Music Community Platform. By accessing or using
            the OPH Music Community Platform, including but not limited to both
            the website and the artist portal, you (the "User" or "Artist")
            agree to abide by and be bound by these Terms and Conditions
            ("Terms"). Please read these Terms carefully before proceeding with
            any use of the Platform. If you do not agree to these Terms, you
            should refrain from using the Platform.
          </p>
          <Section title="1. General Overview">
            <ul className="list-disc ml-6">
              <li>
                OPH community is an open-source network collaboration platform
                that is a fully technology-driven, one-stop solution designed to
                support an artist’s journey from start to finish. The platform
                with no middlemen, providing direct access and a pre-booking
                system for music releases. It ensures 100% revenue and ownership
                remain with the artists and offers additional benefits such as
                competitions, events, and educational learning opportunities. To
                access the Platform, you agree to abide by these Terms.
              </li>
            </ul>
          </Section>

          <Section title="2. Website Composition and Functions">
            <p className="mb-4">
              The Platform website has six main sections: Home, Event, Artists,
              Resources, Leaderboard, and Contact. Each section offers different
              services and functionalities, as follows:{" "}
            </p>
            <ul className="list-disc ml-6">
              <li className="mt-2">
                <strong>Homepage : </strong>
                The Home page gives an overview of the user statistics on the
                Platform with videos, podcasts, artist songs, showcases, and
                rankings. It also features a media player for artist songs,
                tutorials, and calls to action to encourage users to join the
                Platform. The data is covered under Section 43 of the IT Act,
                2000 ("IT Act, 2000").
              </li>
              <li className="mt-2">
                <strong>Event Page : </strong>
                The Event page gives all information regarding upcoming and past
                events held by OPH, which include the registration and payment
                gateway for participation in the event. Rewards of the events
                will be provided offline and no online data of the financial
                details will be collected. The transactions are also according
                to Section 10A of the IT Act, 2000, through which electronic
                transactions get legal recognition.
              </li>
              <li className="mt-2">
                <strong>Artists Page : </strong>
                This page is for displaying rankings, artist profiles, and media
                content by artists. Automatic calculations are involved with
                ranking data and no adjustments allowed through manual entries.
                Personal data use is subjected to Section 72 of the IT Act,
                2000, for data privacy protection.
              </li>
              <li className="mt-2">
                <strong>Leaderboard Page : </strong>
                Artist uploads song performances with metrics and rankings.
                There is a showcase of artist profiles that include public
                viewing of the data of performance on their songs.
              </li>
              <li className="mt-2">
                <strong>Resources Page : </strong>
                The Resources page contains artist stories, podcasts, tutorials,
                and other relevant learning content.
              </li>
              <li className="mt-2">
                <strong>Contact Page : </strong>
                The Contact page enables the Platform to connect with its
                artists. The contact form captures personal information such as
                full name, email address, mobile number, and Instagram handle.
                Such information is protected under Rule 4 of the IT Rules,
                2011.
              </li>
            </ul>
          </Section>

          <Section title="3. Artist Portal and Services">
            <p className="mb-4">
              An artist portal allows artists to edit their profiles and
              services by their own accounts. An artist, who registers, agrees
              to:{" "}
            </p>
            <ul className="list-disc ml-6">
              <li className="mt-2">
                <strong>Registration Process : </strong>
                Artists will be required to provide valid personal details and
                supporting documents, such as an Aadhar card, bio, signature,
                and bank account details, for verification. After successful
                verification, an account will be generated. Registration is done
                after taking consent for the use of Aadhar for verification
                under Section 7 of the Aadhaar Act, 2016.
              </li>
              <li className="mt-2">
                <strong>Song Submission : </strong>
                Artists can submit their songs through two project patterns:
                <br />
                <b> New Project Pattern : </b> Songs that have never been
                uploaded elsewhere can be released solely on the OPH platform.
                The copyright will belong to the artist, but he or she will
                assign rights to OPH to upload and publish the song. The revenue
                will be paid directly to the artist.
                <br />
                <b>Hybrid Project Pattern : </b>Songs already released elsewhere
                can be uploaded to OPH. The artist owns the copyright but gives
                OPH permission to upload and distribute the song. Artists cannot
                file copyright infringement against OPH. The money generated
                from the song will be paid directly to the artist. These terms
                comply with the Copyright Act, 1957.
              </li>
            </ul>
          </Section>

          <Section title="4. Revenue and Payment Terms">
            <ul className="list-disc ml-6">
              <li>
                Artists will receive their money from the song submission within
                10-15 days of the withdrawal request. The Indian Contract Act,
                1872, does not refund event participation fees, membership
                payments, and song registration fees.
              </li>
            </ul>
          </Section>

          <Section title="5. Content and Copyright">
            <ul className="list-disc ml-6">
              <li>
                Artists will receive their money from the song submission within
                10-15 days of the withdrawal request. The Indian Contract Act,
                1872, does not refund event participation fees, membership
                payments, and song registration fees.
              </li>
            </ul>
          </Section>

          <Section title="6. Responsibilities of Artists">
            <ul className="list-disc ml-6">
              <li>
                Artists must abide by the services offered by the Platform.
                Artists shall not request changes or dictate terms relating to
                the services of the Platform. OPH may modify its pricing or
                services at any time, subject to Section 37 of the Indian
                Contract Act, 1872.
              </li>
            </ul>
          </Section>

          <Section title="7. Event Participation">
            <ul className="list-disc ml-6">
              <li>
                Artists are liable to pay non-refundable participation fees for
                events. Rewards from events will be processed offline, and
                artists will provide the necessary details for disbursement as
                required by Section 10 of the Indian Contract Act, 1872.
              </li>
            </ul>
          </Section>

          <Section title="8. Limitation of Liability">
            <ul className="list-disc ml-6">
              <li>
                OPH is not responsible or liable for any damage, loss, or
                dispute arising out of the use of the Platform. Artists agree to
                indemnify OPH from all claims connected with the uploading of
                content, ranking, or distribution of revenue under Section 73 of
                the Indian Contract Act, 1872.
              </li>
            </ul>
          </Section>

          <Section title="9. Terms Modifications">
            <ul className="list-disc ml-6">
              <li>
                OPH reserves the right to modify or update these Terms at its
                discretion. Continued use of the Platform constitutes acceptance
                of the updated Terms, in compliance with Rule 5 of the IT Rules,
                2011.
              </li>
            </ul>
          </Section>

          <Section title="10. Service Availability and Charges">
            <ul className="list-disc ml-6">
              <li>
                Blocking dates for weekends is free, but it may charge later.
                Date changes will attract a fee of INR 100. According to Section
                10 of the Indian Contract Act, 1872, changes are permissible up
                to one week before the date scheduled.
              </li>
            </ul>
          </Section>
          <Section title="11. Revenue and Payments">
            <ul className="list-disc ml-6">
              <li>
                Artists can take the revenue after processing periods. Service
                charges, such as Song Registration Forms, are non-refundable as
                per Section 2(1)(r) of the Consumer Protection Act, 2019.
              </li>
            </ul>
          </Section>

          <Section title="12. Transparency and Data">
            <ul className="list-disc ml-6">
              <li>
                Live data, including rankings and KPIs, will be updated
                according to the specified schedule. Artists cannot request
                additional data or proof beyond what is displayed. This is
                governed under Section 72 of the IT Act, 2000.
              </li>
            </ul>
          </Section>
          <Section title="13. Tickets and Requests">
            <ul className="list-disc ml-6">
              <li>
                Requests for modifications under wrong categories will be
                declined without compromise, based on the Indian Contract Act,
                1872.
              </li>
            </ul>
          </Section>

          <Section title="14. Liabilities and Responsibilities">
            <ul className="list-disc ml-6">
              <li>
                OPH shall not be liable for defamation or negative publicity due
                to an artist's public profile, as stated in Section 499 of the
                Indian Penal Code.
              </li>
            </ul>
          </Section>

          <Section title="15. Eligibility for TV Publishing">
            <ul className="list-disc ml-6">
              <li>
                The OPH team determines the eligibility for TV publishing. Only
                eligible artists may be considered for publishing, in accordance
                with Section 38 of the Copyright Act, 1957.
              </li>
            </ul>
          </Section>

          <Section title="16. Data Collection">
            <ul className="list-disc ml-6">
              <li>
                Data collected from users participating in events will solely be
                used for promotional and engagement purposes, in compliance with
                the IT Rules, 2011.
              </li>
            </ul>
          </Section>

          <Section title="17. Governing Law and Dispute Resolution">
            <ul className="list-disc ml-6">
              <li>
                These Terms are subject to Indian law. Any dispute shall be
                settled by arbitration or conciliation in accordance with the
                Arbitration and Conciliation Act, 1996.
              </li>
            </ul>
          </Section>

          <Section title="18. Calendar Rules">
            <ul className="list-disc ml-6">
              <li>
                Artists cannot choose the dates already blocked for releasing a
                song. Once a submission has been rejected for errors or failing
                to comply with requirements, all money paid for reservation of
                dates shall be non-refundable. Artist must re-block a new date
                of release for future submissions.
              </li>
            </ul>
          </Section>

          <Section title="19. Fair Treatment">
            <ul className="list-disc ml-6">
              <li>
                All artists are treated equally, and no special treatment is
                given to any particular individual so that it can be fair and
                transparent.
              </li>
            </ul>
          </Section>

          <Section title="20. Use of the Platform">
            <ul className="list-disc ml-6">
              <li>
                Artists shall be responsible for knowing how to use the Platform
                properly. All transactions are final and cannot be cancelled
                unless otherwise stated, and it follows Section 2(h) of the
                Indian Contract Act, 1872.
              </li>
            </ul>
          </Section>

          <Section title="21. General Duties">
            <ul className="list-disc ml-6">
              <li>
                Settlement is NOT allowed for OPH in case any registered user or
                artist does not participate in events. All notifications sent to
                the artists will be on purely work-related matters.
              </li>
            </ul>
          </Section>

          <Section title="22. Submission Rules">
            <ul className="list-disc ml-6">
              <li>
                Artist submitting "Free for Profit Beats" in wrong categories
                will attract strikes. Post-publication copyright violations will
                attract the strikes as given by the Copyright Act, 1957.
              </li>
            </ul>
          </Section>

          <Section title="23. Analytics and Metrics">
            <ul className="list-disc ml-6">
              <li>
                Metrics and analytics are calculated transparently. Regular
                updates within the specified timeframes are there. In case of
                delay in analytics, there will be visible revenue supplied.
              </li>
            </ul>
          </Section>

          <Section title="24. Ticket Policy">
            <ul className="list-disc ml-6">
              <li>
                Those requests raised under incorrect categories will be
                declined according to the Indian Contract Act, 1872.
              </li>
            </ul>
          </Section>

          <Section title="25. Forms and Updates">
            <ul className="list-disc ml-6">
              <li>
                The update of the forms, like sign-up and song registration,
                shall be processed within 24 to 48 hours.
              </li>
            </ul>
          </Section>

          <Section title="26. Intellectual Property">
            <ul className="list-disc ml-6">
              <li>
                All intellectual property rights of the Platform are protected
                under the Copyright Act, 1957. Any unauthorized use is strictly
                prohibited.
              </li>
            </ul>
          </Section>

          <Section title="27. Refunds and Corrections">
            <ul className="list-disc ml-6">
              <li>
                Refunds will be issued only in certain conditions. Artists can
                request basic changes but should note that most changes will not
                be accommodated.
              </li>
            </ul>
          </Section>

          <Section title="28. Leaderboard and Ranking Rules">
            <ul className="list-disc ml-6">
              <li>
                Rankings on the leaderboard, based on performance metrics, are
                final and non-negotiable.
              </li>
            </ul>
          </Section>
          <Section title="29. Account Management & Security">
            <ul className="list-disc ml-6">
              <li>
                Artists are solely responsible for maintaining the
                confidentiality of their account credentials, including but not
                limited to passwords.
              </li>
              <li>
                OPH shall not be liable for any unauthorized access due to the
                negligence of Artists.
              </li>
              <li>
                OPH reserves the right to suspend or deactivate accounts, with
                prior notice, in cases of policy violations, including but not
                limited to fraud, hate speech, or breach of applicable laws.
              </li>
            </ul>
          </Section>

          <Section title="30. Content Guidelines & Moderation">
            <ul className="list-disc ml-6">
              <li>
                Artists shall not upload content that infringes on intellectual
                property rights, includes explicit material, or violates any
                applicable law in India, including the Information Technology
                Act, 2000.
              </li>
              <li>
                OPH reserves the right to remove any content violating these
                guidelines without prior notice. Artists shall have the right to
                appeal such removal.
              </li>
            </ul>
          </Section>

          <Section title="31. Third-Party Platforms">
            <ul className="list-disc ml-6">
              <li>
                OPH shall not be held liable for any actions taken by
                third-party platforms, such as removal of content by streaming
                services (e.g., Spotify).
              </li>
              <li>
                The availability of caller tunes is subject to the discretion of
                telecom providers, and OPH shall bear no responsibility in this
                regard.
              </li>
            </ul>
          </Section>

          <Section title="32. Updates & Maintenance">
            <ul className="list-disc ml-6">
              <li>
                OPH shall notify Artists of scheduled downtime at least 48 hours
                in advance.
              </li>
              <li>
                OPH reserves the right to add, modify, or remove features
                without prior notice.
              </li>
            </ul>
          </Section>

          <Section title="33. Force Majeure">
            <ul className="list-disc ml-6">
              <li>
                OPH shall not be held liable for any delays or failures in
                performance due to force majeure events, including but not
                limited to natural disasters, pandemics, or government
                restrictions.
              </li>
            </ul>
          </Section>

          <Section title="34. Age Restrictions">
            <ul className="list-disc ml-6">
              <li>
                Artists must be at least 18 years of age or provide verifiable
                parental/legal guardian consent to use the Platform.
              </li>
            </ul>
          </Section>

          <Section title="35. Governing Law & Jurisdiction">
            <ul className="list-disc ml-6">
              <li>
                These T&Cs shall be governed by and construed in accordance with
                the laws of India.
              </li>
              <li>
                Any disputes arising under these T&Cs shall be subject to the
                exclusive jurisdiction of the courts in Mumbai, Maharashtra.
              </li>
            </ul>
          </Section>

          <Section title="36. Limitation of Liability">
            <ul className="list-disc ml-6">
              <li>
                OPH shall bear no liability for any acts, omissions, or conduct
                of the Artist. The Artist assumes full responsibility for their
                actions in all circumstances.
              </li>
              <li>
                OPH shall not be liable for indirect, incidental, or
                consequential damages, including but not limited to lost
                opportunities or revenue.
              </li>
            </ul>
          </Section>

          <Section title="37. Beta Features">
            <ul className="list-disc ml-6">
              <li>
                Artists acknowledge that beta features may have limitations, and
                they use such features at their own risk.
              </li>
            </ul>
          </Section>

          <Section title="38. Updates to T&Cs">
            <ul className="list-disc ml-6">
              <li>
                Any changes to these T&Cs shall be communicated to Artists via
                email or the Portal.
              </li>
              <li>
                Continued use of the Platform following updates constitutes
                acceptance of the revised T&Cs.
              </li>
            </ul>
          </Section>

          <Section title="39. Disclaimers">
            <ul className="list-disc ml-6">
              <li>
                OPH does not guarantee success, exposure, or revenue for
                Artists.
              </li>
              <li>
                All services are provided on an "as-is" basis without warranties
                of any kind.
              </li>
            </ul>
          </Section>

          <Section title="40. Intellectual Property Infringement">
            <ul className="list-disc ml-6">
              <li>
                OPH shall implement a DMCA policy outlining the process for
                reporting and countering infringement claims.
              </li>
              <li>
                Artists shall ensure their content does not infringe upon
                third-party intellectual property rights.
              </li>
            </ul>
          </Section>

          <Section title="41. Disclaimer on Upcoming Features">
            <ul className="list-disc ml-6">
              <li>
                Some features displayed on the sign-up page are planned for
                future release. These upcoming features are currently under
                development and may be introduced progressively as part of
                future updates to the platform.
              </li>
            </ul>
          </Section>

          <Section title="42. Use of Third-Party Analytics Tools for Service Optimization">
            <ul className="list-disc ml-6">
              <li>
                We utilize third-party software tools such as Microsoft Clarity,
                Google Analytics, and Google Tag Manager to better understand
                user behavior and enhance the quality of our services. These
                tools help us analyze user interactions, improve user
                experience, and optimize our offerings in line with user needs.
              </li>
            </ul>
          </Section>

          <Section title="43. Performance Metrics and Non-Disputability Clause">
            <ul className="list-disc ml-6">
              <li>
                The services outlined by the Company are subject to specific
                performance metrics. These metrics may be requested by the
                artist from the Company and shall be considered final and
                binding. The artist shall not have the right to dispute or
                challenge these metrics at any stage. All such provisions fall
                strictly under the scope of the Company’s Terms and Conditions.
              </li>
            </ul>
          </Section>

          <Section title="44. Language & Communication">
            <ul className="list-disc ml-6">
              <li>
                These T&Cs are provided in English, and all disputes shall be
                resolved in English.
              </li>
              <li>
                Official communications shall be conducted exclusively via
                email, WhatsApp, or the Platform.
              </li>
            </ul>
          </Section>

          <Section title="45. No Partnership/Agency">
            <ul className="list-disc ml-6">
              <li>
                Nothing in these T&Cs shall be deemed to create any partnership,
                agency, or employment relationship between OPH and Artists.
              </li>
            </ul>
          </Section>

          <Section title="46. Survival Clause">
            <ul className="list-disc ml-6">
              <li>
                Certain provisions, including but not limited to ownership and
                liability clauses, shall survive termination of an Artist’s
                account.
              </li>
            </ul>
          </Section>

          <Section title="47. Feedback & Dispute Resolution">
            <ul className="list-disc ml-6">
              <li>Artists may submit feedback via OPH’s support channels.</li>
              <li>
                Disputes shall follow an escalation process, including mediation
                and arbitration as per the Arbitration and Conciliation Act,
                1996.
              </li>
            </ul>
          </Section>

          <Section title="48. Ownership & Intellectual Property">
            <ul className="list-disc ml-6">
              <li>
                Artists retain full ownership of their music, videos, and all
                other content created or uploaded to the Platform, in accordance
                with Section 17 of the Copyright Act, 1957, which vests
                ownership of original works with the creator.
              </li>
              <li>
                OPH shall obtain only a limited, non-exclusive, royalty-free
                license to distribute, market, and promote the Artist’s content
                for the benefit of the Artist, as permitted under Section 30 of
                the Copyright Act, 1957, which governs licensing agreements.
              </li>
            </ul>
          </Section>

          <Section title="49. Revenue & Payments">
            <ul className="list-disc ml-6">
              <li>
                Artists shall receive 100% of their earnings from audio and
                video monetization, in compliance with Section 18 of the Indian
                Contract Act, 1872, which ensures lawful consideration for
                services rendered.
              </li>
              <li>
                A detailed breakdown of revenue sources, including but not
                limited to streaming, downloads, and licensing, shall be made
                available to Artists on the Platform.
              </li>
              <li>
                There shall be no minimum withdrawal thresholds or hidden fees,
                and payment processing timelines shall be defined as 10–15
                business days from the date of revenue generation, in accordance
                with the Payment and Settlement Systems Act, 2007, which
                regulates payment timelines and transparency.
              </li>
            </ul>
          </Section>

          <Section title="50. Platform Stability">
            <ul className="list-disc ml-6">
              <li>
                OPH guarantees a minimum monthly platform availability of 99%,
                with compensation mechanisms for prolonged downtime, in
                accordance with the Consumer Protection Act, 2019, which
                safeguards consumer rights and provides for compensation in case
                of service deficiencies.
              </li>
            </ul>
          </Section>

          <Section title="51. Educational Resources">
            <ul className="list-disc ml-6">
              <li>
                All learning materials provided by OPH are the exclusive
                property of OPH, and OPH retains full ownership and intellectual
                property rights over them, as per the Copyright Act, 1957.
              </li>
              <li>
                Members are granted a limited, non-exclusive, non-transferable
                license to use these materials solely for personal,
                non-commercial purposes.
              </li>
            </ul>
          </Section>

          <Section title="52. Contact Us">
            <ul className="list-disc ml-6">
              <li>
                For any question or complaint, you can contact OPH using the
                contact details available on the Contact Page. Communications
                will be covered by Section 72A of the IT Act, 2000.
              </li>
            </ul>
          </Section>

          <Section title="53. Acknowledgement">
            <ul className="list-disc ml-6">
              <li>
                You acknowledge having read, understood, and agreeing to the
                Terms and Conditions every time you access the OPH Community
                Platform.
              </li>
            </ul>
          </Section>

          <Section title="54. Compliance">
            <ul className="list-disc ml-6">
              <li>
                This document ensures compliance with the relevant Indian laws
                while safeguarding the rights and obligations of the artists as
                well as the Platform.
              </li>
            </ul>
          </Section>

          <h1 className="text-4xl font-bold mb-6 text-[#5DC9DE]">
            OPH Community Artist Agreement
          </h1>
          <p className="mb-4">
            This Artist Agreement (the "Agreement") is entered into by and between OPH Community (hereinafter referred to as "OPH Community" or "Platform") and the individual artist (hereinafter referred to as the "Artist"), collectively referred to as the "Parties." By registering for and participating in OPH Community, the Artist agrees to be bound by the following terms and conditions. This Agreement shall be deemed a legally binding contract upon the Artist's submission and registration with OPH Community.
          </p>

          <Section title="1. Acceptance of Changes">
            <p>
              The Artist accepts and agrees that the dates, features, and all other details of the event related to OPH Community are subject to alteration, cancellation, or change without prior notice by OPH Community at its discretion. The Artist agrees to follow any such changes.
            </p>
          </Section>

          <Section title="2. Event Terms Acceptance">
            <p>
              Upon registration to any event organized by OPH Community, the Artist agrees to be bound by all the terms and conditions of such events as may be applicable. The parties mutually and explicitly acknowledge and agree that the registration and participation in any event form the basis of a valid contract within the realm of Section 10 of the Indian Contract Act, 1872, wherein their consent to the terms forms the foundation of the contract.
            </p>
          </Section>

          <Section title="3. Consent to Terms">
            <p>
              By checking the checkbox or otherwise agreeing to and continuing the registration or submission process, the Artist agrees and consents to all terms and conditions of this Agreement, establishing a binding legal relationship between the parties.
            </p>
          </Section>

          <Section title="4. Updatable Profile on Chargeable Terms">
            <p>
              The Artist acknowledges and agrees that any updation, amendment, or change to the Artist's profile made on OPH Community may be on chargeable terms at the discretion of the Platform at any given time.
            </p>
          </Section>

          <Section title="5. Ranking Transparency">
            <p>
              The Artist understands and agrees that all rankings shown on leaderboards, spotlight pages, or any other ranking systems in OPH Community are calculated based on particular performance metrics. The Artist also understands that such rankings cannot be contested.
            </p>
          </Section>

          <Section title="6. Refund Decisions">
            <p>
              Artist shall be bounded by OPH Community's refund policy. Any disputes arose between them shall be submitted to the review team for its final decision which shall be binding upon both parties. Artist further acknowledges that refunds, if granted, will follow the provisions of Section 72 of the Indian Contract Act, 1872 and is to be provided only when paid either by mistake or due to coercion.
            </p>
          </Section>

          <Section title="7. Management Authority">
            <p>
              The Artist acknowledges that once they join OPH Community, the Platform shall have exclusive authority over all decisions, actions, and management of the Artist’s participation. The Artist agrees that no requests for changes to Platform decisions will be entertained by OPH Community.
            </p>
          </Section>

          <Section title="8. Strike Policy">
            <p>
              The Artist agrees to adhere to OPH Community's strike policy wherein three (3) strikes may lead to deactivation of the Artist's account. The Artist accepts that OPH Community has the protection accorded by Section 79 of the Information Technology Act, 2000, and will act only as an intermediary unless such due diligence is not followed.
            </p>
          </Section>

          <Section title="9. Correct Submissions">
            <p>
              The Artist covenants to ensure all submissions, without limitation, by way of illustration and not by way of limitation, content, projects, materials, are entered under the appropriate project type, and are to be accurate. The Artist holds the Platform harmless for any and all errors, or discrepancies arising from submitted content.
            </p>
          </Section>

          <Section title="10. Data Security">
            <p>
              The Artist consents to OPH Community’s implementation of reasonable security measures to safeguard the personal data provided by the Artist during registration. The Platform agrees to comply with Section 43A of the Information Technology Act, 2000, in protecting personal data from unauthorized access or misuse.
            </p>
          </Section>

          <Section title="11. General Agreement">
            <p>
              The Artist agrees as follows: 
              <ul>
                <li>a. To accept and be bound by the Terms and Conditions outlined in this Agreement.</li>
                <li>b. To provide accurate, truthful, and updated information at the time of registration and participating.</li>
                <li>c. To grant OPH Community permission to use details from the Artist for purposes such as uploading, release, distribution, and marketing. These may include, but are not limited to, advertising.</li>
              </ul>
            </p>
          </Section>

          <Section title="12. Content Submission and Obligations">
            <p>
              The Artist agrees to:
              <ul>
                <li>a. Provide 100% copyright-free content for new projects or initiatives.</li>
                <li>b. Grant OPH Community the right to modify, distribute, and use the submitted content, including videos, images, and other marketing materials, for promotional and other purposes in accordance with the platform's policies.</li>
              </ul>
            </p>
          </Section>

          <Section title="13. Rights and Ownership">
            <p>
              The Artist grants OPH Community full and exclusive rights to release, host, and distribute the Artist's content across all relevant platforms, including television, digital media, and any other distribution channels. The Artist acknowledges that OPH Community retains all intellectual property rights with respect to the Platform and its services.
            </p>
          </Section>

          <Section title="14. Revenue Sharing Agreement">
            <p>
              The Artist will comply with the revenue sharing model of OPH Community prevailing at the time of registration or participation and accept that the same may be altered from time to time with due notice. All withdrawals of income will be governed by the timeliness and taxation policies of the Platform, consistent with the extant laws so far as Section 194J of the Income Tax Act, 1961 is concerned among others.
            </p>
          </Section>

          <Section title="15. Indemnification">
            <p>
              Artist will indemnify, defend, and hold harmless OPH Community, its affiliates, agents, employees, and representatives from any and all claims, damages, losses, or liabilities arising from or related to the Artist's use of the Platform, including but not limited to violations of this Agreement or applicable laws.
            </p>
          </Section>

          <Section title="16. Fees & Refunds">
            <p>
              One-time fees and per-song fees are non-refundable except under specific circumstances, as governed by Section 56 of the Indian Contract Act, 1872, which deals with the doctrine of frustration and impossibility of performance.
            </p>
          </Section>

          <Section title="17. Service Commitments">
            <p>
              Service Level Agreements (SLAs) shall govern marketing, creative deliverables, and distribution timelines, ensuring accountability as per Section 73 of the Indian Contract Act, 1872, which provides for compensation in case of breach of contract. OPH shall handle licensing and logistics for TV releases at no additional cost to the Artist, subject to prior written approval from the Artist, in compliance with the Cinematograph Act, 1952, and the Copyright Act, 1957.
            </p>
          </Section>

          <Section title="18. Data Privacy & Usage">
            <p>
              OPH shall comply with the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, to ensure the protection of Artists’ personal and sensitive data. Artists’ data shall be used solely for Platform operations and shall not be sold, shared, or disclosed to third parties without explicit consent, as mandated under Section 43A of the Information Technology Act, 2000.
            </p>
          </Section>

          <Section title="19. Termination & Content Removal">
            <p>
              Artists may terminate their accounts at any time, and all content shall be removed or archived upon written request, in compliance with Section 5 of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. The term "Lifetime" shall refer to the operational life of OPH. In the event of platform shutdown, Artists shall receive a minimum of 90 days’ prior notice, as per Section 56 of the Indian Contract Act, 1872, which governs the termination of agreements due to impossibility of performance.
            </p>
          </Section>

          <Section title="20. Community & Conduct">
            <p>
              Artists shall adhere to community guidelines prohibiting hate speech, discriminatory behavior, and unethical collaborations, in compliance with Section 79 of the Information Technology Act, 2000, which mandates the removal of unlawful content. Criteria for competitions hosted by OPH shall be published transparently and made accessible to all participants, in accordance with the Prize Competitions Act, 1955.
            </p>
          </Section>

          <Section title="21. Support & Communication">
            <p>
              Support requests shall be responded to within 48 hours, with ticket resolution within 72 hours, as per Section 10 of the Indian Contract Act, 1872, which mandates that all agreements must be made with free consent and lawful consideration.
            </p>
          </Section>

          <Section title="22. Exclusivity & Portability">
            <p>
              Artists remain free to use other platforms, services, or tools for their work. No exclusivity requirements shall be imposed on Artists by OPH, in compliance with the Competition Act, 2002, which prohibits anti-competitive agreements.
            </p>
          </Section>

          <Section title="23. Documentation Fees">
            <p>
              A non-refundable, one-time documentation fee is required for lifetime membership, as governed by Section 74 of the Indian Contract Act, 1872, which deals with liquidated damages and penalties.
            </p>
          </Section>

          <Section title="24. Acknowledgement">
            <p>
              By registering and participating in OPH Community, the Artist hereby acknowledges and agrees to all the terms and conditions contained in this Agreement. In case of any queries or clarifications, the Artist may reach out to [Insert Contact Information].
            </p>
            <p>
              This Agreement shall be governed by the laws of India and any dispute arising out of or in connection with this Agreement shall be subject to arbitration in accordance with the Arbitration and Conciliation Act, 1996.
            </p>
          </Section>
          <h1 className="text-4xl font-bold mb-6 text-[#5DC9DE] mt-10">Non-Objection Certificate</h1>

          <Section title="Introduction">
            <p>I, as an artist, do hereby declare and certify that I have thoroughly read, understood, and unequivocally accept the Terms & Conditions, as well as the agreement put forth by the OPH Community. I further affirm that I have no objections whatsoever to the contents of the said Terms & Conditions or the obligations outlined therein.</p>
          </Section>

          <Section title="1. Personal and Professional Information">
            <p>I have voluntarily provided all personal and professional details during the signup process, and I hereby declare that the information shared by me is accurate, truthful, and complete to the best of my knowledge.</p>
          </Section>

          <Section title="2. Permission for Data Usage">
            <p>I grant explicit permission to OPH Community to display, use, and process the details I have shared as per their requirements for the purposes of their initiative, program, or any other related activities.</p>
          </Section>

          <Section title="3. Usage of Shared Details">
            <p>I have no objection to the usage, publication, or dissemination of my shared details as per the scope of the Terms & Conditions agreed upon.</p>
          </Section>

          <Section title="4. Services for Song">
            <p>I affirm that I have no objection to the submission, distribution, release, upload, promotion, marketing, and all services provided by the OPH Community Platform for my song.</p>
          </Section>

          <Section title="5. Ownership of the Song">
            <p>I warrant that I am the sole and exclusive owner of all rights, title, and interest in the Song. I confirm that I am the sole creator of the Song.</p>
          </Section>

          <Section title="6. Authorization for Distribution and Promotion">
            <p>I authorize OPH Community to undertake all necessary actions related to the distribution, release, upload, promotion, marketing, and other services of the Song on the OPH Community Platform. This authorization includes actions undertaken at their sole discretion and in the manner they deem appropriate.</p>
          </Section>

          <Section title="7. Scope of Authorization">
            <p>Authorization explicitly includes, but is not limited to: (a) Distributing the Song on digital and/or physical platforms. (b) Promoting the Song through any and all marketing channels. (c) Performing any other actions incidental to or associated with the Song's release.</p>
          </Section>

          <Section title="8. No Further Claims">
            <p>By granting this authorization, I agree not to assert any further claims, demands, or objections regarding the use of the Song as described above.</p>
          </Section>

          <Section title="9. Voluntary Signing">
            <p>I am signing this NOC voluntarily, without any coercion, undue influence, or misrepresentation by any party.</p>
          </Section>

          <Section title="10. Affirmation of Acceptance">
            <p>By checking the checkbox and making the payment, the artist affirms that they accept all the terms and conditions stated above and have provided their consent. This action shall also be considered equivalent to signing this declaration.</p>
          </Section>

          <Section title="11. Certification">
            <p>This certificate is issued in good faith as a formal declaration of my consent and agreement with OPH Community and its associated activities. I understand that this document establishes a clear and mutual understanding of the obligations and rights between both parties.</p>
          </Section>
        </div>
        </div>
    </>
  );
};

export default TermsAndConditions;
