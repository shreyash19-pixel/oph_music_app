import React from "react";
import { Helmet } from "react-helmet";

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-2xl font-semibold text-[#5DC9DE] mb-2">{title}</h2>
    {children}
  </section>
);

const Disclaimer = () => {
  return (
    <>
      <Helmet>
        <title>Disclaimer - OPH Community</title>
        <meta name="description" content="Read OPH Community's disclaimer regarding our services and legal compliance." />
      </Helmet>

      <div className="px-6 lg:px-10 xl:px-16 pt-32 pb-10 bg-black text-white min-h-screen">

        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-[#5DC9DE]">Disclaimer</h1>

          <Section title="1. Introduction">
            <p>This Disclaimer sets forth the limitations of liability, conditions of service usage, and legal compliance requirements governing access to and use of our website and services. By accessing or utilizing our platform, users expressly acknowledge and agree to the terms stipulated herein. If you do not agree with any part of this Disclaimer, you must refrain from using our services.</p>
            <p className="mt-2">Scope: This Disclaimer applies to the website, artist portal, and offline interactions. [Refer to: Indian Contract Act, 1872].</p>
          </Section>

          <Section title="2. Content Responsibility">
            <p>Artists retain 100% ownership of their work but grant OPH the right to distribute, showcase, and monetize it. OPH is not liable for copyright disputes arising from Hybrid Projects (re-released songs). [Refer to: Copyright Act, 1957].</p>
          </Section>

          <Section title="3. Limitation of Liability">
            <p>The Company does not warrant that its services will be uninterrupted, error-free, or free from defects. To the fullest extent permitted by law, the Company shall not be held liable for any direct, indirect, incidental, consequential, punitive, or special damages arising out of or in connection with the use of its services, including but not limited to loss of profits, data, business opportunities, or goodwill. [Refer to: Indian Contract Act, 1872].</p>
          </Section>

          <Section title="4. Service Usage">
            <p>Users acknowledge and accept that the availability, functionality, and quality of services may be affected by external factors beyond the Company's control, including but not limited to technical issues, third-party service disruptions, or force majeure events.</p>
          </Section>

          <Section title="5. Legal Compliance">
            <p>Users agree to comply with all applicable laws, regulations, and industry standards when accessing or using the Company's services. Any violation of such laws or regulations may result in the suspension or termination of services without prior notice. [Refer to: IT Act, 2000].</p>
          </Section>

          <Section title="6. Service Availability">
            <p>The Company strives to maintain 24/7 access to its services but disclaims responsibility for any downtime due to scheduled maintenance, technical difficulties, or third-party service failures.</p>
          </Section>

          <Section title="7. No Warranty">
            <p>The Company's website and services are provided on an "as is" and "as available" basis, without any express or implied warranties of any kind, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, or non-infringement. The Company expressly disclaims any representations or guarantees regarding the reliability, security, or timeliness of its services.</p>
          </Section>

          <Section title="8. Third-Party Links">
            <p>The Company's website may contain links to third-party websites for user convenience. The Company does not endorse, control, or assume responsibility for the content, accuracy, legality, or reliability of such third-party websites, nor shall it be liable for any damages resulting from their use. Users access such links at their own risk.</p>
          </Section>

          <Section title="9. Financial Transactions">
            <p>OPH is not responsible for losses resulting from payment gateway errors, currency fluctuations, or delays in bank processing. [Refer to: Payment and Settlement Systems Act, 2007].</p>
          </Section>

          <Section title="10. Event Outcomes">
            <p>Event results, including rankings and rewards, are final. OPH disclaims liability for disputes arising from judging criteria, rankings, or rewards.</p>
          </Section>

          <Section title="11. Educational Resources">
            <p>Any tutorials, podcasts, and resources available on the platform are for general guidance. OPH does not guarantee specific outcomes such as career growth, revenue, or success in competitions.</p>
          </Section>

          <Section title="12. Legal Compliance (User Responsibility)">
            <p>Artists are solely responsible for complying with applicable laws, including tax filings, copyright licenses, and other legal obligations. OPH is not liable for legal actions arising from user-generated content. [Refer to: Copyright Act, 1957 and Income Tax Act, 1961].</p>
          </Section>

          <Section title="13. Upcoming Features">
            <p>Some features shown on the platform are planned for future release. These features are under development and may be rolled out gradually. Users should not rely on these features until they are officially launched.</p>
          </Section>

          <Section title="14. Risk Acknowledgement">
            <p>Use of the platform is at the user's own risk. OPH disclaims liability for any data loss, unauthorized access, or damages resulting from using the platform.</p>
          </Section>

          <Section title="15. Disclaimer Updates">
            <p>We may modify, amend, or update this Disclaimer at any time. Any significant changes to the terms of this Disclaimer will be communicated to users via email or notification on the platform. Continued use of the services after any changes will constitute acceptance of the revised terms.</p>
          </Section>

          <Section title="16. Contact Information">
            <p>For any queries or concerns regarding this Disclaimer, you can contact us at <a href="mailto:support@ophcommunity.com" className="text-[#5DC9DE] underline">support@ophcommunity.com</a></p>
          </Section>
        </div>
      </div>
    </>
  );
};

export default Disclaimer;
