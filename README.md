<div align="center">
  <img src="public/assets/branding/logo-wordmark.png" alt="Nomadly Logo" width="300"/>
  
  <h1>🌍 Nomadly - Smart Travel Planning Platform</h1>
  
  <p>
    <strong>Plan trips, share experiences, and connect with fellow travelers worldwide</strong>
  </p>
  
  <p>
    Built with React, TypeScript, Supabase, and modern web technologies
  </p>
  
  [![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com/)
  [![Vite](https://img.shields.io/badge/Vite-5.0.0-purple.svg)](https://vitejs.dev/)
</div>

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [🎨 UI Components](#-ui-components)
- [🔐 Authentication](#-authentication)
- [📊 Database Schema](#-database-schema)
- [🌐 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

## 🌟 Features

### 🧳 **Trip Management**
- ✨ **Create detailed itineraries** with day-by-day planning
- 📍 **Add destinations** with descriptions and photos
- 📅 **Set trip dates** and duration tracking
- 🖼️ **Beautiful image galleries** for each trip
- 📝 **Rich text descriptions** and travel notes
- 🔄 **Edit and update** trips anytime
- 💰 **Budget tracking** with expense management
- 🎯 **Budget presets** for quick planning

### 👥 **Travel Buddy Matching** 🆕
- 🤝 **Find travel companions** for your trips
- 📤 **Send buddy requests** with personalized messages
- 📬 **Public request display** like comments
- ✅ **Accept/Decline** requests as trip owner
- 🗑️ **Delete your own requests** anytime
- 🎨 **Beautiful popup notifications** instead of alerts
- 👀 **View all requests** in trip details
- 🔔 **Real-time updates** for request status

### 🎉 **Party Mode & Magic Features** 🆕
- 🎵 **Background music** with 15-second loops
- 🎊 **Visual effects** and animations
- ⏹️ **Manual stop controls** for Party Mode
- 🪄 **Magic Button** for fun surprises
- 🌈 **Interactive animations** and transitions

### 🧭 **Tour Guide System** 🆕
- 📚 **Interactive onboarding** for new users
- 🎯 **Step-by-step guidance** through features
- 💡 **Smart tooltips** and hints
- 🔄 **One-time display** with localStorage
- 🎪 **Y2K-themed** tour experience

### 👤 **User Profiles**
- 🎨 **Customizable profiles** with avatar, name, and bio
- 📊 **Travel statistics** (trips created, reviews written)
- 🏆 **Social features** with follower/following system
- 🔔 **Real-time notifications** for social interactions
- 👥 **Public/private profile** settings
- 📱 **Responsive design** for all devices

### 🔍 **Explore & Discover**
- 🗺️ **Browse public trips** from the community
- 💖 **Save favorite trips** for later inspiration
- 🔍 **Search and filter** trips by destination, tags
- 🎯 **Curated recommendations** and travel suggestions
- 📈 **Trending trips** and popular destinations
- 👥 **Travel Buddy buttons** on trip cards
- 📝 **Public travel buddy requests** display

### 🌐 **Social Features**
- 👥 **Follow/unfollow** other travelers
- 💬 **Review and rate** trips and destinations
- 🔔 **Notification system** for follows and interactions
- 📊 **Activity feed** showing friends' travel updates
- 🤝 **Connect with like-minded** travelers
- 💬 **Trip comments** and discussions
- 🎯 **Travel buddy matching** system

### 🎨 **User Experience**
- 🌙 **Dark mode support** throughout the app
- 📱 **Mobile-first responsive** design
- ⚡ **Fast loading** with optimized images
- 🎯 **Intuitive navigation** and user-friendly interface
- ♿ **Accessibility features** and semantic HTML
- 🔄 **Real-time updates** without page refresh
- 🎨 **Y2K aesthetic** with bold colors and animations
- 🪄 **Beautiful popup notifications** system

### 🛠️ **Technical Features**
- 🔐 **Secure authentication** with Supabase Auth
- 🗄️ **PostgreSQL database** with real-time subscriptions
- 📤 **Image uploads** with Supabase Storage
- 🔒 **Environment variable** protection
- 🚀 **Optimized build** with Vite
- 📦 **Component-based** architecture
- 🎯 **TypeScript** for type safety
- 🔄 **No lazy loading** for immediate content access

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nguyendangcole/nomadly.git
   cd nomadly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up database**
   ```bash
   # Run SQL schemas in Supabase Dashboard
   # 1. Run database/travel_buddy_requests.sql
   # 2. Run other schema files as needed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App Configuration
VITE_APP_NAME=Nomadly
VITE_APP_URL=http://localhost:5173

# Feature Flags
VITE_ENABLE_SOCIAL_FEATURES=true
VITE_ENABLE_REVIEWS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_TRAVEL_BUDDY=true
VITE_ENABLE_PARTY_MODE=true
VITE_ENABLE_TOUR_GUIDE=true
```

### Database Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run the SQL schemas** in the following order:
   - `database/travel_buddy_requests.sql` (NEW - Travel Buddy system)
   - `enable_public_read.sql`
   - `update_schema.sql`
   - `seed_data.sql` (optional, for demo data)

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS + Custom CSS
- **Icons**: Material Symbols
- **State Management**: React Context API
- **Routing**: React Router v6
- **Build Tool**: Vite

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   Storage       │
│                 │    │                 │    │                 │
│ React App       │◄──►│ PostgreSQL      │◄──►│ Image Files     │
│ TypeScript      │    │ Authentication  │    │ User Avatars    │
│ Tailwind CSS    │    │ Real-time       │    │ Trip Photos     │
│                 │    │ Subscriptions   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **Authentication**: Users login via Supabase Auth
2. **Data Fetching**: React Context manages global state
3. **Real-time Updates**: Supabase subscriptions sync data
4. **File Uploads**: Images stored in Supabase Storage
5. **Local Storage**: User preferences cached locally

## 📁 Project Structure

```
nomadly/
├── public/                 # Static assets
│   └── assets/
│       ├── branding/      # Logos and brand assets
│       └── audio/         # Party mode music files
├── src/
│   ├── components/        # React components
│   │   ├── Auth.tsx       # Authentication forms
│   │   ├── Dashboard.tsx  # Main dashboard
│   │   ├── Explore.tsx    # Trip discovery
│   │   ├── UserProfile.tsx # User profiles
│   │   ├── Settings.tsx   # User settings
│   │   ├── TravelBuddyDialog.tsx # 🆕 Travel buddy requests
│   │   ├── PublicTravelBuddyRequests.tsx # 🆕 Public requests display
│   │   ├── NotificationPopup.tsx # 🆕 Beautiful notifications
│   │   ├── TourGuide.tsx  # 🆕 Interactive onboarding
│   │   └── ...
│   ├── context/           # React Context
│   │   └── TravelContext.tsx # Global state management
│   ├── lib/               # Utilities
│   │   └── supabase.ts    # Supabase client
│   └── types/             # TypeScript definitions
├── database/              # 🆕 Database schemas
│   └── travel_buddy_requests.sql # Travel buddy system
├── *.sql                  # Database schemas
├── .env.example           # Environment template
└── README.md              # This file
```

## 🎨 UI Components

### Core Components

- **`UserProfile`**: Display and edit user profiles
- **`TripCard`**: Show trip previews with Travel Buddy buttons
- **`Itinerary`**: Detailed trip view with Travel Buddy requests
- **`Explore`**: Browse and discover community trips
- **`Dashboard`**: Personal homepage with Party Mode
- **`Settings`**: User preferences and profile editing

### New Components 🆕

- **`TravelBuddyDialog`**: Send travel buddy requests
- **`PublicTravelBuddyRequests`**: Display public requests like comments
- **`NotificationPopup`**: Beautiful notification system
- **`TourGuide`**: Interactive onboarding experience

### Design System

- **Colors**: Y2K aesthetic with pink, yellow, primary colors
- **Typography**: Bold, playful fonts with Y2K aesthetic
- **Layout**: Card-based design with rounded corners and borders
- **Animations**: Smooth transitions, hover effects, and micro-interactions
- **Responsive**: Mobile-first approach
- **Y2K Elements**: Bold borders, dramatic shadows, vibrant colors

## 🔐 Authentication

### Features
- **Email/Password login** with Supabase Auth
- **Social login** support (Google, GitHub)
- **Session persistence** with secure tokens
- **Protected routes** with authentication guards
- **User profile creation** on first login
- **Tour Guide** for new user onboarding

### Security
- **Environment variables** protected with .gitignore
- **Row Level Security** (RLS) in Supabase
- **JWT tokens** for session management
- **Secure file uploads** with validation

## 📊 Database Schema

### Core Tables

```sql
-- Users and Authentication
profiles (id, name, email, avatar_url, plan, bio, created_at)

-- Trip Management
trips (id, user_id, title, description, cover_image, is_public, created_at)

-- Trip Details
locations (id, trip_id, day_number, name, description, image_url)

-- Social Features
reviews (id, user_id, location_id, rating, comment, created_at)
notifications (id, user_id, actor_id, type, is_read, created_at)

-- 🆕 Travel Buddy System
travel_buddy_requests (
  id UUID PRIMARY KEY,
  trip_id UUID REFERENCES trips(id),
  requester_id UUID REFERENCES profiles(id),
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### Relationships
- `profiles` ← `trips` (one-to-many)
- `trips` ← `locations` (one-to-many)
- `profiles` ← `reviews` (one-to-many)
- `profiles` ← `notifications` (many-to-many)
- `profiles` ← `travel_buddy_requests` (one-to-many)
- `trips` ← `travel_buddy_requests` (one-to-many)

## 🌐 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Configure environment variables** in deployment platform
4. **Set up custom domain** (optional)

### Environment Setup

- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint`

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and patterns
- Use TypeScript for type safety
- Write meaningful commit messages
- Test your changes before submitting
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the amazing backend-as-a-service platform
- **React** for the powerful UI framework
- **Tailwind CSS** for the utility-first CSS framework
- **Material Symbols** for the beautiful icon set
- **Unsplash** for the beautiful placeholder images

## 📞 Support

If you have any questions or need help:

- 📧 Create an issue on GitHub
- 🐛 Report bugs with detailed descriptions
- 💡 Suggest features for future improvements
- 📖 Check the documentation for common questions

---

<div align="center">
  <p>Made with ❤️ by the travel community</p>
  <p>🌍 Start your journey with Nomadly today!</p>
  <p>👥 Find your perfect travel buddy!</p>
  <p>🎉 Experience the Party Mode!</p>
</div>
