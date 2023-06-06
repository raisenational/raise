import Helmet from 'react-helmet';

import Page from '../../components/Page';
import Section, { SectionTitle } from '../../components/Section';
import { TopNavigation } from '../../components/Navigation';
import Footer from '../../components/Footer';
import Link from '../../components/Link';

const ComplaintsPage = () => (
  <Page>
    <Helmet>
      <title>Raise: Complaints Policy</title>
      <meta property="og:title" content="Raise: Complaints Policy" />
    </Helmet>
    <TopNavigation />

    <Section className="text-left">
      <SectionTitle>Raise Complaints Policy</SectionTitle>

      <p>Raise is committed to providing a high quality service to all of its stakeholders, including students, donors, and partners. We recognize that sometimes things may go wrong, and we want to make sure that we handle complaints in a fair, timely, and effective manner.</p>
      <p className="mt-4">A complaint is any expression of dissatisfaction with Raise's services, activities, or volunteers. This policy explains how you can make a complaint, and how you can expect us to handle it. Anyone can make a complaint, including if you are a member of the public, a donor, or a volunteer.</p>

      <p className="font-black font-raise-header mt-8">Making a complaint</p>
      <p>Our complaints procedure encourages local resolution to help resolve your complaint quickly and effectively. However, you can escalate your complaint to the next stage if you feel uncomfortable raising your concern with the proposed contact, or feel that it is so serious that informal resolution would be inappropriate.</p>

      <p className="mt-4">Stage 1: Contact the president of the Raise chapter that relates to your complaint, who will then try to resolve the matter informally. If you're unsure of their contact details, contact raisenational@gmail.com.</p>

      <p className="mt-4">Stage 2: Make a formal complaint by emailing the national team at raisenational@gmail.com. In this email, please include:</p>
      <ul className="list-disc ml-12 my-2">
        <li>a statement that you are making a formal complaint</li>
        <li>details about what went wrong, including the names of anyone involved</li>
        <li>what you'd like us to do to resolve the complaint</li>
        <li>if relevant, any steps you've taken so far</li>
      </ul>

      <p className="mt-4">Stage 3: If you're not satisfied with the national team's response, you can escalate your complaint to the charity trustees by contacting the chair of the trustees, <Link href="https://adamjones.me">Adam Jones</Link>.</p>

      <p className="mt-4">Stage 4: If your complaint is still not resolved, you can escalate your complaint to our regulators:</p>
      <ul className="list-disc ml-12 my-2">
        <li>Fundraising: <Link href="https://www.fundraisingregulator.org.uk/complaints">The Fundraising Regulator</Link></li>
        <li>Data protection: <Link href="https://ico.org.uk/make-a-complaint/">The Information Commissioner's Office</Link></li>
        <li>Advertising: <Link href="https://www.asa.org.uk/make-a-complaint.html">The Advertising Standards Authority</Link></li>
        <li>Volunteers: <Link href="https://www.gov.uk/guidance/report-serious-wrongdoing-at-a-charity-as-a-worker-or-volunteer">The Charity Commission</Link></li>
        <li>General: <Link href="https://www.gov.uk/complain-about-charity">The Charity Commission</Link></li>
      </ul>

      <p className="font-black font-raise-header mt-8">How we handle complaints</p>
      <p>When you make a formal complaint to the national team or the trustees, we will:</p>
      <ul className="list-disc ml-12 my-2">
        <li>provide a full response within four weeks, or explain why we need more time</li>
        <li>confirm that we have understood your complaint correctly</li>
        <li>investigate your complaint thoroughly and fairly</li>
        <li>explain how you can escalate your complaint if you are unsatisfied with our response</li>
        <li>if we made a mistake, apologise and take steps to resolve your problem</li>
      </ul>
      <p className="mt-4">When investigating your complaint, we will process your personal data securely and in line with our privacy policy. This may include sharing your data internally and with third parties such as our regulators. If you'd prefer that we didn't share your personal data with particular people or bodies, please let us know and we'll do our best to comply with this (although we may not be able to keep confidentiality if we have a legal obligation to report something, such as someone being at imminent risk of serious harm).</p>

      <p className="font-black font-raise-header mt-8 mb-2">Whistleblower protection</p>
      <p>Raise is committed to a culture of openness and transparency. We encourage volunteers to speak out about wrongdoing, even if it is not directly related to their own work. A whistleblower is anyone who in good faith tries to raise a concern following this policy about suspected illegal, unethical or unsafe behaviour.</p>
      <p>If you have concerns about wrongdoing at Raise, you can submit and escalate them via the complaints process. You can also receive confidential advice from <Link href="https://protect-advice.org.uk/charity-sector-whistleblowing/">Protect</Link>, an independent whistleblowing advice charity.</p>
      <p>Raise will not tolerate intimidation or victimisation of whistleblowers. Anyone found responsible for such action will be subject to severe disciplinary action.</p>
    </Section>

    <Footer />
  </Page>
);

export default ComplaintsPage;
