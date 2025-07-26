import React from "react";
import { Helmet } from "react-helmet";

// Section component for reusability
const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-2xl font-semibold text-[#5DC9DE] mb-2">{title}</h2>
    {children}
  </section>
);

const RefundPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Refund Policy - OPH Community</title>
        <meta name="description" content="Learn about the terms and conditions under which refund requests are processed for services rendered by the OPH Community." />
      </Helmet>

      <div className="px-6 lg:px-10 xl:px-16 pt-32 pb-10 bg-black text-white min-h-screen">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-[#5DC9DE]">Refund Policy</h1>

          {/* Section 1 */}
          <Section title="1. Introduction">
            <ul className="list-disc ml-6">
              <li>This Refund Policy governs the terms and conditions under which refund requests are processed for services rendered by the Company. By making a payment, the user acknowledges and agrees to the provisions set forth herein. [Refer to: Indian Contract Act, 1872].</li>
            </ul>
          </Section>

          {/* Section 2 */}
          <Section title="2. General Policy">
            <ul className="list-disc ml-6">
              <li>All refund requests shall be subject to a thorough review and approval process in accordance with the terms of service and applicable policies.</li>
              <li>Refunds shall only be granted under circumstances expressly stipulated in the relevant agreements between the parties. [Refer to: Consumer Protection Act, 2019].</li>
            </ul>
          </Section>

          {/* Section 3 */}
          <Section title="3. Membership Fees">
            <ul className="list-disc ml-6">
              <li>All one-time membership fees paid during artist registration are non-refundable.</li>
            </ul>
          </Section>

          {/* Section 4 */}
          <Section title="4. Event Participation Fees">
            <ul className="list-disc ml-6">
              <li>Fees paid to participate in events (e.g., competitions, workshops) are non-refundable, even if the artist cancels participation or the event is rescheduled.</li>
            </ul>
          </Section>

          {/* Section 5 */}
          <Section title="5. Song Submission & Registration">
            <ul className="list-disc ml-6">
              <li>Fees for song submissions (New/Hybrid Projects) are non-refundable once the submission is processed.</li>
            </ul>
          </Section>

          {/* Section 6 */}
          <Section title="6. Technical Errors">
            <ul className="list-disc ml-6">
              <li>If a payment error occurs (e.g., duplicate charges), artists may request a refund within 7 days by contacting support. Refunds will be processed within 15 business days after verification. [Refer to: Payment and Settlement Systems Act, 2007].</li>
            </ul>
          </Section>

          {/* Section 7 */}
          <Section title="7. Revenue Withdrawals">
            <ul className="list-disc ml-6">
              <li>Artists retain 100% revenue from their work. After deduction from third-party platforms. Withdrawal requests are processed in 10–15 days, but OPH is not liable for delays caused by third-party payment gateways. [Refer to: Payment and Settlement Systems Act, 2007].</li>
            </ul>
          </Section>

          {/* Section 8 */}
          <Section title="8. Eligibility for Refunds">
            <ul className="list-disc ml-6">
              <li>Refunds shall not be granted once the service has been fully rendered and delivered.</li>
              <li>Any refund issued may be subject to the deduction of applicable processing fees. [Refer to: Consumer Protection Act, 2019].</li>
            </ul>
          </Section>

          {/* Section 9 */}
          <Section title="9. No Refund Policy">
            <ul className="list-disc ml-6">
              <li>All payments made to the Company shall be deemed final and non-refundable. Notwithstanding the foregoing, the OPH Community team reserves the sole and absolute discretion to consider and grant exceptions in extraordinary circumstances.</li>
            </ul>
          </Section>

          {/* Section 10 */}
          <Section title="10. Exceptional Cases">
            <ul className="list-disc ml-6">
              <li>Refunds may be issued solely in cases where the service has not been provided in accordance with the agreed-upon terms and conditions.</li>
            </ul>
          </Section>

          {/* Section 11 */}
          <Section title="11. Refund Request Process">
            <ul className="list-disc ml-6">
              <li>A formal request for a refund must be submitted by the user within forty-eight (48) hours of payment.</li>
              <li>Refund requests shall be initiated by submitting a formal ticket along with valid and verifiable proof of claim.</li>
              <li>The Company shall review and respond to the refund request within forty-eight (48) business hours.</li>
              <li>In the event that a refund is approved, the funds shall be processed and disbursed within ten (10) to fifteen (15) business days from the date of approval. [Refer to: Consumer Protection Act, 2019].</li>
            </ul>
          </Section>
        </div>
      </div>
    </>
  );
};

export default RefundPolicy;
