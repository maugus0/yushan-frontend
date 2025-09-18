/**
 * Shared styles to reduce code duplication
 *
 * WHY CREATED: SonarCloud detected 7.3% code duplication (threshold: ≤3.0%)
 * - Home.jsx had many repeated inline styles for buttons, sections, text
 * - This file centralizes common styles to reduce duplication
 *
 * CAN BE MODIFIED/DELETED: Yes, if different styling approach is preferred
 * - Can be deleted if CSS modules or styled-components are used instead
 * - Can be modified to match the design system
 */
export const buttonStyles = {
  primary: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(231, 76, 60, 0.4)',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: 'white',
    border: '2px solid white',
    padding: '1rem 2rem',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  card: {
    width: '100%',
    backgroundColor: '#2c3e50',
    color: 'white',
    border: 'none',
    padding: '0.8rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
};

export const hoverStyles = {
  primary: {
    backgroundColor: '#c0392b',
    transform: 'translateY(-2px)',
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    transform: 'translateY(-2px)',
  },
  card: {
    backgroundColor: '#34495e',
  },
};

export const sectionStyles = {
  hero: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '4rem 2rem',
    textAlign: 'center',
    minHeight: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featured: {
    padding: '4rem 2rem',
    backgroundColor: '#f8f9fa',
  },
  features: {
    padding: '4rem 2rem',
    backgroundColor: '#ffffff',
  },
  cta: {
    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    color: 'white',
    padding: '4rem 2rem',
    textAlign: 'center',
  },
};

export const textStyles = {
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    marginBottom: '1rem',
    fontWeight: 'bold',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  },
  heroSubtitle: {
    fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
    marginBottom: '2.5rem',
    opacity: 0.95,
    lineHeight: '1.6',
    maxWidth: '600px',
    margin: '0 auto 2.5rem auto',
  },
  sectionTitle: {
    fontSize: 'clamp(2rem, 4vw, 2.5rem)',
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: '1.4rem',
    marginBottom: '0.5rem',
    color: '#2c3e50',
    fontWeight: 'bold',
    lineHeight: '1.3',
  },
  cardAuthor: {
    color: '#7f8c8d',
    marginBottom: '1rem',
    fontSize: '1rem',
  },
  cardChapters: {
    color: '#7f8c8d',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
};

export const layoutStyles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    padding: '0 1rem',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '3rem',
    padding: '0 1rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '2rem',
  },
};

export const cardStyles = {
  novelCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: '1px solid #e9ecef',
  },
  featureCard: {
    padding: '2rem 1.5rem',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
    transition: 'transform 0.3s ease',
  },
  novelImage: {
    width: '100%',
    height: '200px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '8px',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '3rem',
    position: 'relative',
    overflow: 'hidden',
  },
  genreTag: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  rating: {
    color: '#f39c12',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
};
