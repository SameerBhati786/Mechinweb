import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';

const Blog: React.FC = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'Complete Guide to Email Migration: Best Practices and Common Pitfalls',
      excerpt: 'Learn how to migrate your email systems seamlessly without losing data or experiencing downtime. Our comprehensive guide covers all major platforms.',
      author: 'Mechinweb Team',
      date: '2024-01-15',
      readTime: '8 min read',
      category: 'Email Migration',
      image: 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=800',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'SPF, DKIM, and DMARC: The Ultimate Email Security Setup Guide',
      excerpt: 'Protect your domain from email spoofing and improve deliverability with proper DNS authentication records. Step-by-step implementation guide.',
      author: 'Mechinweb Team',
      date: '2024-01-10',
      readTime: '12 min read',
      category: 'Email Security',
      image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 3,
      title: 'SSL Certificate Management: From Installation to Auto-Renewal',
      excerpt: 'Everything you need to know about SSL certificates, including installation, configuration, and setting up automated renewal systems.',
      author: 'Mechinweb Team',
      date: '2024-01-05',
      readTime: '10 min read',
      category: 'SSL & Security',
      image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 4,
      title: 'Google Workspace vs Microsoft 365: Which is Right for Your Business?',
      excerpt: 'A detailed comparison of the two leading productivity suites, including features, pricing, and migration considerations.',
      author: 'Mechinweb Team',
      date: '2023-12-28',
      readTime: '15 min read',
      category: 'Cloud Management',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 5,
      title: 'Cloud Data Migration Strategies: Minimizing Downtime and Risk',
      excerpt: 'Learn proven strategies for migrating data between cloud platforms while maintaining business continuity and data integrity.',
      author: 'Mechinweb Team',
      date: '2023-12-20',
      readTime: '11 min read',
      category: 'Data Migration',
      image: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      id: 6,
      title: 'cPanel vs Plesk: Control Panel Optimization Tips',
      excerpt: 'Maximize the performance of your hosting environment with our expert tips for optimizing both cPanel and Plesk control panels.',
      author: 'Mechinweb Team',
      date: '2023-12-15',
      readTime: '9 min read',
      category: 'Hosting Support',
      image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
      gradient: 'from-teal-500 to-cyan-500'
    }
  ];

  return (
    <section id="blog" className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden scroll-mt-20">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Latest Insights &
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> Tech Tips</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Stay updated with the latest trends, best practices, and expert insights in IT infrastructure and cloud solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20"
            >
              <div className="relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute top-4 left-4 px-3 py-1 bg-gradient-to-r ${post.gradient} text-white text-xs font-semibold rounded-full`}>
                  {post.category}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center text-gray-400 text-sm mb-3">
                  <User className="w-4 h-4 mr-1" />
                  <span className="mr-4">{post.author}</span>
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="mr-4">{new Date(post.date).toLocaleDateString()}</span>
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{post.readTime}</span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300 line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
                
                <Link 
                  to={`/blog/${post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
                  className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-semibold group-hover:translate-x-2 transition-all duration-300"
                >
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Want More Tech Insights?
            </h3>
            <p className="text-gray-300 mb-6">
              Subscribe to our newsletter for weekly tips, tutorials, and industry updates delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;