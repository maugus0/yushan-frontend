import React from 'react';
import { Layout } from 'antd';
import Navbar from './Navbar';
import Footer from './Footer';
import './LayoutWrapper.css';

const { Content } = Layout;

const LayoutWrapper = ({ 
  children, 
  isAuthenticated = false, 
  user = null,
  className = '' 
}) => {
  return (
    <Layout className={`layout-wrapper ${className}`}>
      <Navbar isAuthenticated={isAuthenticated} user={user} />
      
      <Content className="main-content">
        <div className="content-container">
          {children}
        </div>
      </Content>
      
      <Footer />
    </Layout>
  );
};

export default LayoutWrapper;