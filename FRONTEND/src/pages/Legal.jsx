import PageHeader from '../components/ui/PageHeader';
import Container from '../components/ui/Container';

const CONTENT = {
  terms: {
    title: 'Terms of Service',
    subtitle: 'The ground rules for shopping with MESH.',
    sections: [
      {
        heading: '1. Using this site',
        body: 'By browsing or placing an order on MESH you agree to use the site only for lawful purposes and in a way that does not infringe the rights of, or restrict the use of this site by anyone else.',
      },
      {
        heading: '2. Products & pricing',
        body: 'We work hard to keep product details, images and prices accurate. Colors may vary slightly depending on your screen. Prices are shown in the selected store currency and may change without notice; the price shown at checkout is the price you pay.',
      },
      {
        heading: '3. Orders',
        body: 'Placing an order is an offer to buy. We may decline or cancel an order (for example, if an item is out of stock or a pricing error occurs) and refund any amount already paid.',
      },
      {
        heading: '4. Payment',
        body: 'We accept cash on delivery and the online payment options enabled at checkout (such as Khalti and eSewa). Payment is processed through secure third-party providers; we never store your card details.',
      },
      {
        heading: '5. Returns',
        body: 'Unused items with original tags can be returned within 30 days of delivery. See our returns process on the Contact page or reach out to support for help with an exchange.',
      },
      {
        heading: '6. Contact',
        body: 'Questions about these terms? Reach us through the Contact page and we will get back to you within one business day.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'How we collect, use and protect your information.',
    sections: [
      {
        heading: '1. What we collect',
        body: 'We collect the information you provide when you create an account, place an order or subscribe to our newsletter — such as your name, email address, phone number and delivery address — plus basic activity needed to run the store.',
      },
      {
        heading: '2. How we use it',
        body: 'Your information is used to process orders, deliver packages, provide customer support, send order updates and (only with your consent) share new arrivals and offers.',
      },
      {
        heading: '3. Sharing',
        body: 'We share data only with the parties needed to run the store: payment processors for transactions, delivery partners for shipping, and email services for order notifications. We never sell your personal data.',
      },
      {
        heading: '4. Security',
        body: 'Data is transmitted over encrypted connections and access is limited to systems that need it to do their job. No method of transmission is 100% secure, but we follow industry best practices.',
      },
      {
        heading: '5. Your choices',
        body: 'You can update your profile details at any time, unsubscribe from marketing emails with one click, and request deletion of your account by contacting support.',
      },
      {
        heading: '6. Contact',
        body: 'For privacy questions or data requests, reach us through the Contact page.',
      },
    ],
  },
};

const Legal = ({ type }) => {
  const page = CONTENT[type] || CONTENT.terms;

  return (
    <div className="min-h-[70vh] bg-background">
      <PageHeader
        eyebrow="Legal"
        title={page.title}
        subtitle={page.subtitle}
        breadcrumb={[{ label: page.title }]}
      />
      <Container className="py-10 lg:py-14 max-w-4xl">
        <div className="space-y-8">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-bold text-text-primary mb-2">{section.heading}</h2>
              <p className="text-text-secondary leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
        <p className="mt-10 text-xs text-text-muted">
          Last updated: {new Date().getFullYear()} · Questions? Use the Contact page.
        </p>
      </Container>
    </div>
  );
};

export default Legal;
