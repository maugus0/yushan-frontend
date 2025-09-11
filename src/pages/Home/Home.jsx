import React from 'react';
import { useNavigate } from 'react-router-dom';

// Home Page Component
const Home = () => {
  const navigate = useNavigate();
  const featuredNovels = [
    { id: 1, title: "The Cultivator's Journey", author: "Author A", genre: "Fantasy", rating: 4.8, chapters: 156 },
    { id: 2, title: "Digital Realm Chronicles", author: "Author B", genre: "Sci-Fi", rating: 4.6, chapters: 89 },
    { id: 3, title: "Moonlight Academy", author: "Author C", genre: "Romance", rating: 4.7, chapters: 234 },
    { id: 4, title: "Shadow Hunter", author: "Author D", genre: "Action", rating: 4.5, chapters: 78 },
    { id: 5, title: "Magic Academy", author: "Author E", genre: "Fantasy", rating: 4.9, chapters: 112 },
    { id: 6, title: "Space Odyssey", author: "Author F", genre: "Sci-Fi", rating: 4.4, chapters: 203 }
  ];

  const handleStartReading = (novelId) => {
    console.log(`Starting to read novel ${novelId}`);
    // TODO: Implement navigation to novel reading page
  };

  const handleBrowseNovels = () => {
    console.log('Browse novels clicked');
    // TODO: Implement navigation to browse page
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '4rem 2rem',
        textAlign: 'center',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
            marginBottom: '1rem', 
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Welcome to YuShan
          </h1>
          <p style={{ 
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', 
            marginBottom: '2.5rem', 
            opacity: 0.95,
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 2.5rem auto'
          }}>
            Your home for discovering, reading, and sharing amazing web novels. 
            Join our community of readers and writers today.
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            marginTop: '2rem'
          }}>
            <button 
              onClick={() => navigate('login')}
              style={{
                backgroundColor: '#e74c3c',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(231, 76, 60, 0.4)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#c0392b';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#e74c3c';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Start Reading
            </button>
            <button 
              onClick={handleBrowseNovels}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Browse Novels
            </button>
          </div>
        </div>
      </section>

      {/* Featured Novels */}
      <section style={{ padding: '4rem 2rem', backgroundColor: '#f8f9fa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '3rem', 
            fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
            color: '#2c3e50',
            fontWeight: 'bold'
          }}>
            Featured Novels
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            padding: '0 1rem'
          }}>
            {featuredNovels.map(novel => (
              <div 
                key={novel.id} 
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: '1px solid #e9ecef'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                }}
              >
                <div style={{
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
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    📖
                  </div>
                </div>
                <h3 style={{ 
                  fontSize: '1.4rem', 
                  marginBottom: '0.5rem', 
                  color: '#2c3e50',
                  fontWeight: 'bold',
                  lineHeight: '1.3'
                }}>
                  {novel.title}
                </h3>
                <p style={{ 
                  color: '#7f8c8d', 
                  marginBottom: '1rem',
                  fontSize: '1rem'
                }}>
                  by {novel.author}
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '1rem'
                }}>
                  <span style={{
                    backgroundColor: '#3498db',
                    color: 'white',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}>
                    {novel.genre}
                  </span>
                  <span style={{ 
                    color: '#f39c12', 
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}>
                    ⭐ {novel.rating}
                  </span>
                </div>
                <p style={{ 
                  color: '#7f8c8d', 
                  fontSize: '0.9rem', 
                  marginBottom: '1.5rem'
                }}>
                  {novel.chapters} chapters available
                </p>
                <button 
                  onClick={() => handleStartReading(novel.id)}
                  style={{
                    width: '100%',
                    backgroundColor: '#2c3e50',
                    color: 'white',
                    border: 'none',
                    padding: '0.8rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#34495e';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#2c3e50';
                  }}
                >
                  Start Reading
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 2rem', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
            marginBottom: '3rem', 
            color: '#2c3e50',
            fontWeight: 'bold'
          }}>
            Why Choose YuShan?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '3rem',
            padding: '0 1rem'
          }}>
            <div style={{ 
              padding: '2rem 1.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1.5rem',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }}>
                📚
              </div>
              <h3 style={{ 
                marginBottom: '1rem', 
                color: '#2c3e50',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                Vast Library
              </h3>
              <p style={{ 
                color: '#7f8c8d',
                fontSize: '1.1rem',
                lineHeight: '1.6'
              }}>
                Discover thousands of web novels across multiple genres and languages.
              </p>
            </div>
            <div style={{ 
              padding: '2rem 1.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1.5rem',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }}>
                👥
              </div>
              <h3 style={{ 
                marginBottom: '1rem', 
                color: '#2c3e50',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                Community
              </h3>
              <p style={{ 
                color: '#7f8c8d',
                fontSize: '1.1rem',
                lineHeight: '1.6'
              }}>
                Connect with fellow readers and writers in our vibrant community.
              </p>
            </div>
            <div style={{ 
              padding: '2rem 1.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1.5rem',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }}>
                🏆
              </div>
              <h3 style={{ 
                marginBottom: '1rem', 
                color: '#2c3e50',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                Gamification
              </h3>
              <p style={{ 
                color: '#7f8c8d',
                fontSize: '1.1rem',
                lineHeight: '1.6'
              }}>
                Earn points, badges, and climb leaderboards as you read and engage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        color: 'white',
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', 
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            Ready to Start Your Journey?
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            marginBottom: '2rem', 
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            Join thousands of readers and discover your next favorite story today.
          </p>
          <button 
            onClick={() => navigate('login')}
            style={{
              backgroundColor: '#e74c3c',
              color: 'white',
              padding: '1rem 3rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(231, 76, 60, 0.4)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#c0392b';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#e74c3c';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;