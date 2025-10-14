import { Layout } from 'antd';
import Navbar from '../navbar/navbar';
import Footer from '../footer/footer';
import './layout-wrapper.css';

const { Content } = Layout;

const LayoutWrapper = ({ children, className = '' }) => {
  return (
    <Layout className={`layout-wrapper ${className}`}>
      <Navbar />
      <Content className="main-content">
        <div className="content-container">{children}</div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default LayoutWrapper;
