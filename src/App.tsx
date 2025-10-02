import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import FloatingCTA from './components/FloatingCTA';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';
import EmailMigrationPage from './pages/EmailMigrationPage';
import EmailSecurityPage from './pages/EmailSecurityPage';
import SSLSetupPage from './pages/SSLSetupPage';
import CloudManagementPage from './pages/CloudManagementPage';
import DataMigrationPage from './pages/DataMigrationPage';
import HostingSupportPage from './pages/HostingSupportPage';
import BlogPostPage from './pages/BlogPostPage';
import ClientLogin from './pages/ClientLogin';
import ClientRegister from './pages/ClientRegister';
import EmailVerificationPage from './pages/EmailVerificationPage';
import { ServicePurchase } from './pages/ServicePurchase';
import PaymentSuccess from './pages/PaymentSuccess';
import InvoiceView from './pages/InvoiceView';
import Testimonials from './components/Testimonials';
import DashboardLayout from './components/dashboard/DashboardLayout';
import PerIncidentSupportPage from './pages/PerIncidentSupportPage';
import ThankYouPage from './pages/ThankYouPage';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import ServicesPage from './pages/dashboard/ServicesPage';
import PaymentsPage from './pages/dashboard/PaymentsPage';
import OrdersPage from './pages/dashboard/OrdersPage';
import InvoicesPage from './pages/dashboard/InvoicesPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import AcronisSetupPage from './pages/AcronisSetupPage';
import ServiceRouter from './pages/ServiceRouter';
import AIChat from './components/AIChat';

function App() {
  const location = useLocation();

  React.useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <Services />
            <About />
            <Testimonials />
            <Blog />
            <Contact />
          </>
        } />
        <Route path="/services/email-migration" element={<EmailMigrationPage />} />
        <Route path="/services/email-deliverability" element={<EmailSecurityPage />} />
        <Route path="/services/ssl-setup" element={<SSLSetupPage />} />
        <Route path="/services/cloud-management" element={<CloudManagementPage />} />
        <Route path="/services/data-migration" element={<DataMigrationPage />} />
        <Route path="/services/hosting-support" element={<HostingSupportPage />} />
        <Route path="/services/acronis-setup" element={<AcronisSetupPage />} />
        <Route path="/services/per-incident-support" element={<PerIncidentSupportPage />} />
        <Route path="/services/:serviceId" element={<ServiceRouter />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/client/register" element={<ClientRegister />} />
        <Route path="/client/verify-email" element={<EmailVerificationPage />} />
        <Route path="/client/*" element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="/client/purchase/:serviceId" element={
          <ServicePurchase />
        } />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/invoice/:id" element={<InvoiceView />} />
      </Routes>
      {!location.pathname.startsWith('/client/') && <Footer />}
      {!location.pathname.startsWith('/client/') && <AIChat />}
      {!location.pathname.startsWith('/client/') && <FloatingCTA />}
    </div>
  );
};

export default App;