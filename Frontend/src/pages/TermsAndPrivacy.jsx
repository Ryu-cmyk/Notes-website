 
export function TermsOfService() {
  return (
    <PageLayout title="Terms of Service" subtitle="">
      <p style={{ marginBottom: "2rem", color: "var(--gray-600)" }}>
        By creating an account on {SITE_NAME}, you agree to these terms. Please read them carefully.
      </p>
 
      <Section title="1. Who Can Use This Platform">
        <p>
          {SITE_NAME} is intended for students enrolled in BCA programs. You must provide accurate
          information when registering, including your real name, email address, and phone number.
        </p>
      </Section>
 
      <Section title="2. Your Account">
        <p>
          You are responsible for keeping your account credentials secure. Do not share your password
          with others. If you suspect unauthorized access, contact us immediately at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--primary)" }}>{CONTACT_EMAIL}</a>.
        </p>
      </Section>
 
      <Section title="3. Acceptable Use">
        <p style={{ marginBottom: "0.75rem" }}>You agree not to:</p>
        <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <li>Share, redistribute, or resell any notes or materials from this platform</li>
          <li>Use the platform for any illegal or harmful purpose</li>
          <li>Attempt to access other users' accounts or private data</li>
          <li>Upload or share content that violates copyright or is inappropriate</li>
        </ul>
      </Section>
 
      <Section title="4. Content Ownership">
        <p>
          All notes, study materials, and content on {SITE_NAME} are owned by their respective creators.
          You may use them for personal study only. You may not copy or distribute them without
          explicit permission.
        </p>
      </Section>
 
      <Section title="5. Service Availability">
        <p>
          We strive to keep {SITE_NAME} available at all times, but we do not guarantee uninterrupted
          access. We may update, modify, or discontinue features at any time without prior notice.
        </p>
      </Section>
 
      <Section title="6. Termination">
        <p>
          We reserve the right to suspend or terminate accounts that violate these terms. You may
          also delete your account at any time by contacting us.
        </p>
      </Section>
 
      <Section title="7. Changes to Terms">
        <p>
          We may update these terms from time to time. Continued use of the platform after changes
          means you accept the updated terms.
        </p>
      </Section>
 
      <Section title="8. Contact">
        <p>
          Questions about these terms? Email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--primary)" }}>{CONTACT_EMAIL}</a>.
        </p>
      </Section>
 
      <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: "1.5rem", marginTop: "1rem" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>
          Also read our{" "}
          <Link to="/privacy" style={{ color: "var(--primary)" }}>Privacy Policy</Link>.
        </p>
      </div>
    </PageLayout>
  );
}
 
// ─── PRIVACY POLICY ──────────────────────────────────────────────────────────
 
export function PrivacyPolicy() {
  return (
    <PageLayout title="Privacy Policy" subtitle="">
      <p style={{ marginBottom: "2rem", color: "var(--gray-600)" }}>
        This policy explains what information {SITE_NAME} collects, how we use it, and your rights
        regarding your data.
      </p>
 
      <Section title="1. Information We Collect">
        <p style={{ marginBottom: "0.75rem" }}>When you register, we collect:</p>
        <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <li><strong>Name</strong> (first and last) — to personalize your experience</li>
          <li><strong>Email address</strong> — for account login and communication</li>
          <li><strong>Phone number</strong> — for account verification and support</li>
        </ul>
        <p style={{ marginTop: "0.75rem" }}>
          We do not collect payment information, location data, or any sensitive personal data.
        </p>
      </Section>
 
      <Section title="2. How We Use Your Information">
        <p style={{ marginBottom: "0.75rem" }}>We use your information to:</p>
        <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <li>Create and manage your account</li>
          <li>Send important updates about the platform</li>
          <li>Respond to your support requests</li>
          <li>Improve the platform based on usage patterns</li>
        </ul>
        <p style={{ marginTop: "0.75rem" }}>
          We do <strong>not</strong> sell your personal information to third parties.
        </p>
      </Section>
 
      <Section title="3. Data Storage">
        <p>
          Your data is stored securely on Supabase servers. We use industry-standard security
          practices to protect your information from unauthorized access.
        </p>
      </Section>
 
      <Section title="4. Data Sharing">
        <p>
          We do not share your personal information with third parties except when required by law
          or to provide core platform functionality (e.g., authentication services).
        </p>
      </Section>
 
      <Section title="5. Your Rights">
        <p style={{ marginBottom: "0.75rem" }}>You have the right to:</p>
        <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your account and data</li>
        </ul>
        <p style={{ marginTop: "0.75rem" }}>
          To exercise any of these rights, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--primary)" }}>{CONTACT_EMAIL}</a>.
        </p>
      </Section>
 
      <Section title="6. Cookies">
        <p>
          We use only essential cookies required for authentication and session management.
          We do not use tracking or advertising cookies.
        </p>
      </Section>
 
      <Section title="7. Changes to This Policy">
        <p>
          We may update this policy occasionally. We will notify you of significant changes
          via email or a notice on the platform.
        </p>
      </Section>
 
      <Section title="8. Contact">
        <p>
          Questions about your privacy? Email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--primary)" }}>{CONTACT_EMAIL}</a>.
        </p>
      </Section>
 
      <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: "1.5rem", marginTop: "1rem" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>
          Also read our{" "}
          <Link to="/terms" style={{ color: "var(--primary)" }}>Terms of Service</Link>.
        </p>
      </div>
    </PageLayout>
  );
}