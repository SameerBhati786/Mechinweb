import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  // Mock blog data - in real app, fetch from API based on slug
  const blogPosts = {
    'complete-guide-to-email-migration-best-practices-and-common-pitfalls': {
      title: 'Complete Guide to Email Migration: Best Practices and Common Pitfalls',
      content: `
        <p>Email migration is one of the most critical IT operations for any business. Whether you're switching from one email provider to another or consolidating multiple email systems, proper planning and execution are essential to avoid data loss and minimize downtime.</p>
        
        <h2>Why Email Migration Matters</h2>
        <p>In today's digital business environment, email is the backbone of communication. A poorly executed migration can result in:</p>
        <ul>
          <li>Lost emails and attachments</li>
          <li>Extended downtime affecting productivity</li>
          <li>Confused users and reduced efficiency</li>
          <li>Potential compliance issues</li>
        </ul>

        <h2>Pre-Migration Planning</h2>
        <p>Before starting any migration, thorough planning is crucial:</p>
        <ol>
          <li><strong>Audit Current System:</strong> Document all email accounts, distribution lists, and shared mailboxes</li>
          <li><strong>Choose Migration Method:</strong> Decide between cutover, staged, or hybrid migration</li>
          <li><strong>Set Timeline:</strong> Plan migration during low-activity periods</li>
          <li><strong>Backup Everything:</strong> Create complete backups of all email data</li>
        </ol>

        <h2>Migration Process</h2>
        <p>Our proven migration process ensures zero data loss:</p>
        <ol>
          <li><strong>Assessment Phase:</strong> Analyze source and destination systems</li>
          <li><strong>Preparation:</strong> Set up target environment and migration tools</li>
          <li><strong>Pilot Migration:</strong> Test with a small group of users</li>
          <li><strong>Full Migration:</strong> Execute complete data transfer</li>
          <li><strong>Validation:</strong> Verify all data has been migrated correctly</li>
          <li><strong>Go-Live:</strong> Switch users to new system with support</li>
        </ol>

        <h2>Common Pitfalls to Avoid</h2>
        <ul>
          <li><strong>Insufficient Planning:</strong> Rushing the migration without proper assessment</li>
          <li><strong>No Backup Strategy:</strong> Not having reliable backups before migration</li>
          <li><strong>Poor Communication:</strong> Not informing users about the migration process</li>
          <li><strong>Inadequate Testing:</strong> Skipping pilot migrations and validation steps</li>
          <li><strong>DNS Issues:</strong> Not properly configuring MX records and DNS settings</li>
        </ul>

        <h2>Post-Migration Best Practices</h2>
        <p>After migration completion:</p>
        <ul>
          <li>Monitor system performance and user feedback</li>
          <li>Provide user training on new features</li>
          <li>Keep old system accessible for a transition period</li>
          <li>Document the migration process for future reference</li>
        </ul>

        <h2>Why Choose Professional Migration Services</h2>
        <p>While some organizations attempt DIY migrations, professional services offer:</p>
        <ul>
          <li>Expertise in handling complex migration scenarios</li>
          <li>Advanced tools for data integrity and validation</li>
          <li>24/7 support during critical migration phases</li>
          <li>Risk mitigation and contingency planning</li>
        </ul>

        <p>At Mechinweb, we've successfully completed over 200 email migrations with zero data loss. Our team uses enterprise-grade tools and follows industry best practices to ensure your migration is smooth and successful.</p>
      `,
      author: 'Mechinweb Team',
      date: '2024-01-15',
      readTime: '8 min read',
      category: 'Email Migration',
      image: 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    'spf-dkim-and-dmarc-the-ultimate-email-security-setup-guide': {
      title: 'SPF, DKIM, and DMARC: The Ultimate Email Security Setup Guide',
      content: `
        <p>Email security is more critical than ever in today's digital landscape. With cyber threats constantly evolving, implementing proper email authentication protocols is essential for protecting your domain reputation and ensuring email deliverability.</p>
        
        <h2>Understanding Email Authentication</h2>
        <p>Email authentication helps prevent email spoofing and phishing attacks by verifying that emails are actually sent from authorized sources. The three main protocols are:</p>
        <ul>
          <li><strong>SPF (Sender Policy Framework):</strong> Specifies which IP addresses can send emails for your domain</li>
          <li><strong>DKIM (DomainKeys Identified Mail):</strong> Uses cryptographic signatures to verify email authenticity</li>
          <li><strong>DMARC (Domain-based Message Authentication):</strong> Provides policy instructions for handling authentication failures</li>
        </ul>

        <h2>Setting Up SPF Records</h2>
        <p>SPF records are DNS TXT records that specify authorized sending sources:</p>
        <ol>
          <li>Identify all legitimate sending sources for your domain</li>
          <li>Create an SPF record listing these sources</li>
          <li>Add the record to your DNS zone</li>
          <li>Test the record using SPF validation tools</li>
        </ol>

        <h2>Implementing DKIM Signatures</h2>
        <p>DKIM adds a digital signature to your emails:</p>
        <ol>
          <li>Generate a public/private key pair</li>
          <li>Publish the public key in DNS</li>
          <li>Configure your mail server to sign outgoing emails</li>
          <li>Verify signatures are working correctly</li>
        </ol>

        <h2>Configuring DMARC Policy</h2>
        <p>DMARC ties SPF and DKIM together with policy enforcement:</p>
        <ul>
          <li>Start with a monitoring policy (p=none)</li>
          <li>Analyze DMARC reports to identify legitimate sources</li>
          <li>Gradually move to quarantine (p=quarantine) then reject (p=reject)</li>
          <li>Monitor ongoing reports for policy effectiveness</li>
        </ul>

        <p>Proper email authentication setup is crucial for maintaining domain reputation and ensuring your emails reach their intended recipients. Our team can help you implement these protocols correctly and monitor their effectiveness.</p>
      `,
      author: 'Mechinweb Team',
      date: '2024-01-10',
      readTime: '12 min read',
      category: 'Email Security',
      image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    'ssl-certificate-management-from-installation-to-auto-renewal': {
      title: 'SSL Certificate Management: From Installation to Auto-Renewal',
      content: `
        <p>SSL certificates are fundamental to web security, encrypting data between your website and visitors. Proper SSL management ensures continuous protection and maintains user trust.</p>
        
        <h2>Types of SSL Certificates</h2>
        <p>Understanding different SSL certificate types helps you choose the right one:</p>
        <ul>
          <li><strong>Domain Validated (DV):</strong> Basic validation, quick issuance</li>
          <li><strong>Organization Validated (OV):</strong> Enhanced validation with business verification</li>
          <li><strong>Extended Validation (EV):</strong> Highest level of validation and trust</li>
          <li><strong>Wildcard:</strong> Secures main domain and all subdomains</li>
        </ul>

        <h2>Installation Process</h2>
        <p>Proper SSL installation involves several steps:</p>
        <ol>
          <li>Generate a Certificate Signing Request (CSR)</li>
          <li>Submit CSR to Certificate Authority</li>
          <li>Complete domain validation process</li>
          <li>Install certificate on your server</li>
          <li>Configure server for HTTPS</li>
          <li>Test SSL implementation</li>
        </ol>

        <h2>Auto-Renewal Setup</h2>
        <p>Automated renewal prevents certificate expiration:</p>
        <ul>
          <li>Use Let's Encrypt for free automated certificates</li>
          <li>Set up ACME clients like Certbot</li>
          <li>Configure automatic renewal scripts</li>
          <li>Monitor renewal processes and notifications</li>
        </ul>

        <p>We provide complete SSL management services, from initial installation to ongoing monitoring and renewal, ensuring your website remains secure and trusted.</p>
      `,
      author: 'Mechinweb Team',
      date: '2024-01-05',
      readTime: '10 min read',
      category: 'SSL & Security',
      image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    'google-workspace-vs-microsoft-365-which-is-right-for-your-business': {
      title: 'Google Workspace vs Microsoft 365: Which is Right for Your Business?',
      content: `
        <p>Choosing between Google Workspace and Microsoft 365 is a critical decision that affects your entire organization's productivity and collaboration capabilities.</p>
        
        <h2>Google Workspace Advantages</h2>
        <ul>
          <li>Superior real-time collaboration features</li>
          <li>Intuitive, web-based interface</li>
          <li>Excellent integration with Google services</li>
          <li>Strong mobile experience</li>
          <li>Competitive pricing structure</li>
        </ul>

        <h2>Microsoft 365 Strengths</h2>
        <ul>
          <li>Comprehensive desktop applications</li>
          <li>Advanced enterprise features</li>
          <li>Better offline functionality</li>
          <li>Extensive third-party integrations</li>
          <li>Robust security and compliance tools</li>
        </ul>

        <h2>Migration Considerations</h2>
        <p>When switching platforms, consider:</p>
        <ol>
          <li>Data migration complexity and timeline</li>
          <li>User training requirements</li>
          <li>Integration with existing systems</li>
          <li>Compliance and security needs</li>
          <li>Total cost of ownership</li>
        </ol>

        <p>Our team helps businesses evaluate their needs and execute seamless migrations between platforms, ensuring minimal disruption and maximum productivity.</p>
      `,
      author: 'Mechinweb Team',
      date: '2023-12-28',
      readTime: '15 min read',
      category: 'Cloud Management',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    'cloud-data-migration-strategies-minimizing-downtime-and-risk': {
      title: 'Cloud Data Migration Strategies: Minimizing Downtime and Risk',
      content: `
        <p>Cloud data migration requires careful planning and execution to ensure business continuity while moving critical data between platforms.</p>
        
        <h2>Migration Strategies</h2>
        <p>Different approaches suit different scenarios:</p>
        <ul>
          <li><strong>Big Bang Migration:</strong> Complete migration in one event</li>
          <li><strong>Phased Migration:</strong> Gradual migration in stages</li>
          <li><strong>Parallel Migration:</strong> Running both systems simultaneously</li>
          <li><strong>Hybrid Approach:</strong> Combining multiple strategies</li>
        </ul>

        <h2>Risk Mitigation</h2>
        <p>Protecting your data during migration:</p>
        <ol>
          <li>Comprehensive backup before migration</li>
          <li>Data validation and integrity checks</li>
          <li>Rollback procedures and contingency plans</li>
          <li>Security measures during transfer</li>
          <li>Compliance with data protection regulations</li>
        </ol>

        <h2>Minimizing Downtime</h2>
        <ul>
          <li>Schedule migrations during low-usage periods</li>
          <li>Use incremental sync methods</li>
          <li>Implement temporary workarounds</li>
          <li>Prepare communication plans for users</li>
        </ul>

        <p>We specialize in complex cloud migrations, ensuring your data moves safely and efficiently with minimal business impact.</p>
      `,
      author: 'Mechinweb Team',
      date: '2023-12-20',
      readTime: '11 min read',
      category: 'Data Migration',
      image: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    'cpanel-vs-plesk-control-panel-optimization-tips': {
      title: 'cPanel vs Plesk: Control Panel Optimization Tips',
      content: `
        <p>Control panels are the backbone of web hosting management. Understanding how to optimize cPanel and Plesk can significantly improve your hosting experience.</p>
        
        <h2>cPanel Optimization</h2>
        <p>Key areas for cPanel performance improvement:</p>
        <ul>
          <li>Database optimization and cleanup</li>
          <li>File manager efficiency improvements</li>
          <li>Email account management best practices</li>
          <li>Security hardening configurations</li>
          <li>Resource usage monitoring and alerts</li>
        </ul>

        <h2>Plesk Enhancement</h2>
        <p>Plesk-specific optimization techniques:</p>
        <ul>
          <li>Extension management and updates</li>
          <li>Performance monitoring setup</li>
          <li>Backup strategy configuration</li>
          <li>Security policy implementation</li>
          <li>Multi-server management optimization</li>
        </ul>

        <h2>Common Issues and Solutions</h2>
        <ol>
          <li><strong>Slow Loading:</strong> Optimize database queries and clear caches</li>
          <li><strong>Email Problems:</strong> Check DNS records and authentication settings</li>
          <li><strong>Security Concerns:</strong> Update software and configure firewalls</li>
          <li><strong>Resource Limits:</strong> Monitor usage and upgrade as needed</li>
        </ol>

        <p>Our hosting support team provides expert optimization services for both cPanel and Plesk environments, ensuring optimal performance and security.</p>
      `,
      author: 'Mechinweb Team',
      date: '2023-12-15',
      readTime: '9 min read',
      category: 'Hosting Support',
      image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1200'
    }
  };

  const post = blogPosts[slug as keyof typeof blogPosts];

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Blog Post Not Found</h1>
          <Link to="/" className="text-cyan-400 hover:text-cyan-300">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      {/* Back to Home Button */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          to="/"
          className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300 mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white/10 rounded-full animate-float"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-center space-x-6 text-blue-200 mb-8">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-64 object-cover rounded-xl mb-8"
                  />
                  
                  <div 
                    className="prose prose-lg prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                    style={{
                      color: '#e5e7eb',
                      lineHeight: '1.8'
                    }}
                  />
                </div>

                {/* Share Section */}
                <div className="mt-8 bg-gray-900 rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Share this article</h3>
                    <div className="flex space-x-4">
                      <button className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                        <Facebook className="h-5 w-5 text-white" />
                      </button>
                      <button className="p-2 bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors duration-300">
                        <Twitter className="h-5 w-5 text-white" />
                      </button>
                      <button className="p-2 bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors duration-300">
                        <Linkedin className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 sticky top-24">
                  <h3 className="text-xl font-bold text-white mb-6">Need Help with Email Migration?</h3>
                  <p className="text-gray-400 mb-6">
                    Get professional email migration services with zero downtime and complete data integrity.
                  </p>
                  <Link
                    to="/services/email-migration"
                    className="block w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 mb-4"
                  >
                    View Service
                  </Link>
                  <Link
                    to="/#quote"
                    className="block w-full border border-cyan-500 text-cyan-400 text-center py-3 rounded-lg font-semibold hover:bg-cyan-500 hover:text-white transition-all duration-300"
                  >
                    Get Free Quote
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPostPage;