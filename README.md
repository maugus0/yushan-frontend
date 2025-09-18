# Yushan Frontend

> 🌟 **Frontend application for Yushan** - A gamified web novel reading platform that transforms reading into an engaging, social experience.

## 🚀 Tech Stack

- **Framework**: React 18+
- **Build Tool**: Create React App
- **Language**: JavaScript/TypeScript
- **Styling**: CSS Modules / Styled Components
- **State Management**: Context API / Redux (planned)
- **HTTP Client**: Axios
- **Testing**: Jest, React Testing Library

## ✨ Key Features

### 📖 Core Platform

- Interactive novel reading interface
- User authentication and registration
- Novel discovery and search
- Reading progress tracking
- Bookmarks and favorites management

### 🎮 Gamification UI

- XP and level progress displays
- Achievement badges and notifications
- Reading streak counters
- Leaderboard rankings
- Social interaction components

### 🔧 Technical Features

- Responsive design for all devices
- Component-based architecture
- API integration with backend
- Real-time updates
- Progressive Web App capabilities
- Performance optimized builds

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components (Button, Modal, etc.)
│   ├── novel/          # Novel-related components
│   └── user/           # User interface components
├── pages/              # Route-based page components
│   ├── Home.js         # Landing page
│   ├── Login.js        # Authentication
│   ├── Novel.js        # Novel reading page
│   └── Profile.js      # User profile
├── services/           # API integration layer
│   ├── api.js          # Base API configuration
│   ├── novelService.js # Novel-related API calls
│   └── userService.js  # User-related API calls
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── context/            # React Context providers
└── assets/             # Static assets (images, fonts)
```

## 🚦 Getting Started

### Prerequisites

- Node.js 16+
- npm 8+ or yarn
- Yushan Backend running (for full functionality)

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/your-username/yushan-frontend.git
cd yushan-frontend

# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Environment Configuration

Create a `.env` file in the root directory:

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_APP_NAME=Yushan
```

## 📜 Available Scripts

### `npm start`

Runs the app in development mode. The page will reload when you make changes.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder. Optimized and minified for deployment.

### `npm run eject`

⚠️ **One-way operation!** Ejects from Create React App for full configuration control.

## 🧪 Development

### Component Development

```bash
# Create new component
mkdir src/components/ComponentName
touch src/components/ComponentName/ComponentName.js
touch src/components/ComponentName/ComponentName.css
touch src/components/ComponentName/index.js
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## 🎨 UI/UX Features

- **Novel Reader**: Immersive reading experience with customizable themes
- **Progress Tracking**: Visual progress bars and reading statistics
- **Gamification Elements**: XP bars, achievement popups, streak counters
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Mode**: Theme switching for comfortable reading
- **Accessibility**: WCAG compliant components

## 🔗 API Integration

The frontend connects to the Yushan Backend API:

- Authentication endpoints
- Novel and chapter management
- User progress tracking
- Gamification features
- Social interactions

## 📱 Deployment

### Development

```bash
npm start
```

### Production Build

```bash
npm run build
# Deploy the 'build' folder to your hosting service
```

### Hosting Options

- Vercel (recommended)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 🛠️ Built With

- [React](https://reactjs.org/) - Frontend framework
- [Create React App](https://create-react-app.dev/) - Build toolchain
- [React Router](https://reactrouter.com/) - Client-side routing
- [Axios](https://axios-http.com/) - HTTP client
- [React Testing Library](https://testing-library.com/react) - Testing utilities

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow React best practices
- Write tests for new components
- Maintain consistent code style
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Roadmap

- [ ] TypeScript migration
- [ ] Advanced state management (Redux Toolkit)
- [ ] PWA features (offline reading)
- [ ] Real-time chat and comments
- [ ] Advanced theming system
- [ ] Mobile app (React Native)

## 📚 Learn More

- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React Documentation](https://reactjs.org/)
- [Deployment Guide](https://facebook.github.io/create-react-app/docs/deployment)

---

**Yushan Frontend** - Bringing gamified reading to life 🚀
