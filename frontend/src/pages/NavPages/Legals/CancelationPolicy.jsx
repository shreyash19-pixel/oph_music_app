import React from "react";
import { Helmet } from "react-helmet";

// Section component for reusability
const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-2xl font-semibold text-[#5DC9DE] mb-2">{title}</h2>
    {children}
  </section>
);

const CancellationPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Cancellation Policy - OPH Community</title>
        <meta name="description" content="Understand our cancellation terms, refund eligibility, event policy, and how OPH handles service or account terminations." />
      </Helmet>

      <div className="px-6 lg:px-10 xl:px-16 pt-32 pb-10 bg-black text-white min-h-screen">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-[#5DC9DE]">Cancellation Policy</h1>

          {/* Section 1 */}
          <Section title="1. Introduction">
            <ul className="list-disc ml-6">
              <li>This Cancellation Policy governs the terms under which users may request cancellations, as well as the circumstances under which the Company may terminate services. By using our services, users agree to abide by the terms set forth herein. [Refer to: Indian Contract Act, 1872].</li>
            </ul>
          </Section>

          {/* Section 2 */}
          <Section title="2. Cancellation Requests">
            <ul className="list-disc ml-6">
              <li>Users may submit a formal request for cancellation of services in accordance with the terms and conditions stipulated in their respective agreements.</li>
              <li>Cancellation requests submitted after the full setup, performance, or delivery of the service shall not be eligible for any refund. No exceptions shall be made once the service has been rendered in whole or in substantial part.</li>
            </ul>
          </Section>

          {/* Section 3 */}
          <Section title="3. Advance Payment Cancellation">
            <ul className="list-disc ml-6">
              <li>If a user cancels a service before its commencement, a partial refund may be granted at the sole discretion of the Company, subject to applicable terms and conditions.</li>
              <li>No refunds shall be issued for cancellations occurring after the initiation of the service.</li>
            </ul>
          </Section>

          {/* Section 4 */}
          <Section title="4. Hybrid & New Agreement Cancellations">
            <ul className="list-disc ml-6">
              <li>Users who have entered into hybrid or newly executed agreements shall be subject to the cancellation provisions explicitly outlined in their respective contractual agreements.</li>
            </ul>
          </Section>

          {/* Section 5 */}
          <Section title="5. Cancellation by the Company">
            <ul className="list-disc ml-6">
              <li>The Company reserves the exclusive right to terminate or cancel services, with immediate effect, in instances where a user is found to be in breach of the Terms and Conditions or any other applicable policies. [Refer to: Indian Contract Act, 1872].</li>
            </ul>
          </Section>

          {/* Section 6 */}
          <Section title="6. Effect of Cancellation">
            <ul className="list-disc ml-6">
              <li>All payments made prior to cancellation shall be deemed non-refundable, and the user shall not be entitled to any reimbursement or restitution.</li>
            </ul>
          </Section>

          {/* Section 7 */}
          <Section title="7. Event Cancellations">
            <ul className="list-disc ml-6">
              <li>If artists are unable to participate in an event, fees will not be refunded. OPH reserves the right to cancel or reschedule events and will notify users promptly.</li>
            </ul>
          </Section>

          {/* Section 8 */}
          <Section title="8. Account Deactivation">
            <ul className="list-disc ml-6">
              <li>Artists can request account deactivation via the Artist Portal or contact form. All associated data (e.g., songs, profiles) will be archived, but non-refundable fees remain forfeited.</li>
            </ul>
          </Section>

          {/* Section 9 */}
          <Section title="9. Termination by OPH">
            <ul className="list-disc ml-6">
              <li>OPH may terminate accounts for violations of terms (e.g., fraud, policy breaches) without refund. Artists will receive prior notice unless immediate action is required for legal or security reasons. [Refer to: IT Act, 2000 and Indian Contract Act, 1872].</li>
            </ul>
          </Section>
        </div>
      </div>
    </>
  );
};

export default CancellationPolicy;
