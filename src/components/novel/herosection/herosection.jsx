import './herosection.css';

const HeroSection = ({ data, title = 'Meet Webnovel', onItemClick }) => (
  <div className="hero-section-container">
    <div className="hero-section-title">{title}</div>
    <div className="hero-section-divider" />
    <div className="hero-section-list">
      {data &&
        data.map((item, idx) => (
          <div
            className="hero-section-item"
            key={idx}
            onClick={() => onItemClick && onItemClick(item, idx)}
            style={{ cursor: onItemClick ? 'pointer' : 'default' }}
          >
            <div className="hero-section-item-left">
              <div className="hero-section-item-title">{item.title}</div>
              <div className="hero-section-item-desc">{item.desc}</div>
            </div>
            <div className="hero-section-item-right">
              <img src={item.img} alt={item.title} className="hero-section-item-img" />
            </div>
            {idx < data.length && <div className="hero-section-item-divider" />}
          </div>
        ))}
    </div>
  </div>
);

export default HeroSection;
