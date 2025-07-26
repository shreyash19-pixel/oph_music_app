import React from "react";
import { Helmet } from "react-helmet";

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-2xl font-semibold text-[#5DC9DE] mb-2">{title}</h2>
    {children}
  </section>
);

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - OPH Community</title>
        <meta name="description" content="Read how OPH Community collects, uses, and protects your data under IT Act, Aadhaar Act, and GDPR guidelines." />
      </Helmet>

      <div className="px-6 lg:px-10 xl:px-16 pt-32 pb-10 bg-black text-white min-h-screen">

        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-[#5DC9DE]">Privacy Policy</h1>

          <Section title="1. Introduction">
            <p>This Privacy Policy ("Policy") governs the manner in which we collect, use, store, and disclose personal information in connection with the use of our services. By accessing or using our platform, you acknowledge that you have read, understood, and agree to be bound by the terms of this Policy. If you do not agree with any part of this Policy, you must refrain from using our services.</p>
            <p className="mt-2">Scope: This Policy applies to the website, artist portal, and offline interactions (e.g., event winner data collection). [Refer to: Information Technology Act, 2000 (IT Act) and Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011].</p>
          </Section>

          <Section title="2. Data Collection & Usage">
            <p><strong>Directly Provided Data:</strong></p>
            <ul className="list-disc ml-6 my-2">
              <li>Website: Contact form (name, email, phone, Instagram handle), event registration details, media player interactions.</li>
              <li>Artist Portal: Personal/professional details (name, Aadhar card, bio, bank details, signature), song metadata, payment info.</li>
              <li>Offline: Addresses and bank details for event winners.</li>
            </ul>
            <p><strong>Automatically Collected Data:</strong></p>
            <ul className="list-disc ml-6 my-2">
              <li>Usage metrics (e.g., song plays, engagement for rankings), cookies, IP addresses, device info.</li>
              <li>Communications data, including emails, inquiries, and feedback.</li>
            </ul>
            <p><strong>Purpose of Data Collection:</strong></p>
            <ul className="list-disc ml-6 my-2">
              <li>Deliver and enhance services, facilitate transactions, and provide essential communications.</li>
              <li>Communication: Responding to inquiries, updates about events/platform changes.</li>
              <li>Analytics: Generating leaderboards, improving platform features.</li>
              <li>Legal Compliance: Fraud prevention, regulatory obligations.</li>
            </ul>
            <p>We do not sell, lease, or share personal data with third parties, except as required by law. [Refer to: IT Act, 2000 and Aadhaar Act, 2016].</p>
          </Section>

          <Section title="3. Use of Information">
            <ul className="list-disc ml-6">
              <li>To provide, maintain, and improve our services.</li>
              <li>To facilitate and process payments and financial transactions.</li>
              <li>To communicate service updates, marketing promotions, and other relevant information.</li>
              <li>To comply with legal, regulatory, or contractual obligations. [Refer to: IT Act, 2000 and Payment and Settlement Systems Act, 2007].</li>
            </ul>
          </Section>

          <Section title="4. Data Protection">
            <ul className="list-disc ml-6">
              <li>We implement administrative, technical, and physical security measures, including encryption (SSL), access controls, and regular audits.</li>
              <li>Sensitive Data Protection: Aadhar, bank details, and signatures (e.g., PCI DSS compliance for payments). [Refer to: Aadhaar Act, 2016 and IT Act, 2000].</li>
              <li>Breach Notification: Commitment to inform users of breaches as required by law. [Refer to: IT Act, 2000].</li>
              <li>Users are responsible for maintaining the confidentiality of their login credentials.</li>
            </ul>
          </Section>

          <Section title="5. Third-Party Sharing">
            <ul className="list-disc ml-6">
              <li>We do not sell, trade, or rent personal data.</li>
              <li>Personal data may be shared with third-party service providers strictly for business functions, such as payment processing, fraud prevention, and compliance.</li>
              <li>Service Providers: Payment processors, hosting services, analytics tools.</li>
              <li>Public Profiles: Artist names, photos, locations, and social links displayed publicly.</li>
              <li>Legal Requirements: Disclosures required by law or to protect rights. [Refer to: IT Act, 2000 and Indian Contract Act, 1872].</li>
              <li>Event Partners: If third parties co-host events, data-sharing practices will be clarified.</li>
            </ul>
          </Section>

          <Section title="6. Consent & Updates">
            <ul className="list-disc ml-6">
              <li>By accessing or using our services, you provide explicit consent to this Policy.</li>
              <li>We reserve the right to modify or update this Policy. Any material changes shall be communicated to users.</li>
              <li>Continued use of our services following modifications constitutes acceptance of the revised terms. [Refer to: IT Act, 2000].</li>
            </ul>
          </Section>

          <Section title="7. Legal Basis for Processing (GDPR Compliance)">
            <ul className="list-disc ml-6">
              <li>Consent: For sensitive data (Aadhar, bank details) and cookies.</li>
              <li>Contractual Necessity: To fulfill membership/event agreements.</li>
              <li>Legitimate Interest: Platform analytics, security, and service improvements. [Refer to: IT Act, 2000 and GDPR (if applicable)].</li>
            </ul>
          </Section>

          <Section title="8. User Rights">
            <ul className="list-disc ml-6">
              <li>Access/Correction: Artists can update profiles via the portal.</li>
              <li>Deletion: Request account deletion (non-refundable fees remain).</li>
              <li>Data Portability: Export data upon request.</li>
              <li>Withdraw Consent: Opt out of non-essential processing (e.g., marketing emails). [Refer to: IT Act, 2000].</li>
            </ul>
          </Section>

          <Section title="9. Cookies & Tracking">
            <ul className="list-disc ml-6">
              <li>Types Used: Session cookies (login), analytics (Google Analytics), media player tracking.</li>
              <li>Management: Opt-out instructions via browser settings or a cookie banner. [Refer to: IT Act, 2000].</li>
            </ul>
          </Section>

          <Section title="10. International Data Transfers">
          <ul className="list-disc ml-6">
              <li>If data is stored/processed outside users’ jurisdiction (e.g., AWS servers), safeguards such as GDPR Standard Contractual Clauses will apply. [Refer to: IT Act, 2000].</li>
            </ul>
            
          </Section>

          <Section title="11. Data Retention">
          <ul className="list-disc ml-6">
              <li>Retention Period: Bank details retained until account deletion + legal period.</li>
              <li>Deletion Process: Inactive accounts are handled securely. [Refer to: IT Act, 2000].</li>
            </ul>
          </Section>

          <Section title="12. Policy Updates">
          <ul className="list-disc ml-6">
              <li>Notification: Changes communicated via email/platform announcements.</li>
              <li>Effective Date: Latest revision date will be displayed.</li>
            </ul>
          </Section>

          <Section title="13. Contact Information">
          <ul className="list-disc ml-6">
          <li>For queries regarding data, contact <a href="mailto:support@ophcommunity.com" className="text-[#5DC9DE] underline">support@ophcommunity.com</a></li>

              
            </ul>
          </Section>

          <Section title="OPH-Specific Considerations">
            <ul className="list-disc ml-6">
              <li>Aadhar Compliance: Adherence to India’s Aadhar Act (e.g., masking numbers, limiting usage to verification). [Refer to: Aadhaar Act, 2016].</li>
              <li>Public Leaderboards: Performance metrics (reach/engagement) determine rankings; artists cannot opt out.</li>
              <li>Offline Data: Collection/storage practices for event winner details (e.g., secure physical records).</li>
              <li>Revenue Transparency: Withdrawal requests trigger 10–15-day processing; financial terms are detailed separately in the Terms of Service. [Refer to: Payment and Settlement Systems Act, 2007].</li>
            </ul>
          </Section>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
