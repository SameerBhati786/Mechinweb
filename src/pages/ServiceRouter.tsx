import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ServiceManager } from '../lib/services';

const ServiceRouter: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [loading, setLoading] = useState(true);
  const [serviceName, setServiceName] = useState<string | null>(null);

  useEffect(() => {
    const resolveService = async () => {
      if (!serviceId) {
        setLoading(false);
        return;
      }

      try {
        const service = await ServiceManager.getServiceById(serviceId);

        if (service) {
          setServiceName(service.name);
        }
      } catch (error) {
        console.error('Error resolving service:', error);
      } finally {
        setLoading(false);
      }
    };

    resolveService();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!serviceName) {
    return <Navigate to="/" replace />;
  }

  const routeMap: { [key: string]: string } = {
    'Email Migration & Setup': '/services/email-migration',
    'Domain & Email Security': '/services/email-deliverability',
    'SSL & HTTPS Setup': '/services/ssl-setup',
    'Cloud Suite Management': '/services/cloud-management',
    'Cloud Data Migration': '/services/data-migration',
    'Hosting & Control Panel Support': '/services/hosting-support',
    'Acronis Account Setup': '/services/acronis-setup',
    'Per Incident Support': '/services/per-incident-support',
  };

  const targetRoute = routeMap[serviceName];

  if (targetRoute) {
    return <Navigate to={targetRoute} replace />;
  }

  return <Navigate to="/" replace />;
};

export default ServiceRouter;
