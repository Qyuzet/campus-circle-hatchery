# CampusCircle - Binus University Student Marketplace

CampusCircle is an exclusive platform designed for Binus University students to exchange study materials, offer tutoring services, and connect with fellow students. Think of it as a combination of StudoCu and an internal marketplace, but specifically tailored for the Binus University community.

## Features

### 🎓 Student-Only Platform
- Exclusive access for Binus University students
- Login using Student ID (NIM)
- Verified university community

### 📚 Study Materials Exchange
- Share and sell course notes
- Upload assignments and study guides
- Access materials from various faculties and courses
- Digital and physical material support

### 👨‍🏫 Tutoring Services
- Offer tutoring sessions in your expertise areas
- Find tutors for challenging subjects
- Schedule and manage tutoring sessions
- Rate and review tutoring experiences

### 💬 Direct Communication
- Chat directly with other students
- Negotiate prices and terms
- Ask questions about materials
- Build study groups and connections

### 🛒 Secure Marketplace
- Safe buying and selling within the university community
- Rating and review system
- Secure payment processing
- Item categorization and search

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Student ID based (to be integrated with Google OAuth)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd campusCircle
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Landing page
├── components/            # Reusable components
│   └── Header.tsx        # Header component
├── types/                # TypeScript type definitions
│   └── index.ts          # Main types
└── lib/                  # Utility functions
```

## Current Status

### ✅ Completed
- Landing page with student login
- Dashboard with marketplace view
- Basic navigation and layout
- Responsive design
- TypeScript setup
- Tailwind CSS styling

### 🚧 In Progress
- Authentication system integration
- Database setup
- API endpoints
- Chat functionality
- Payment integration

### 📋 Planned Features
- Google OAuth integration
- Real-time messaging
- File upload system
- Advanced search and filtering
- Rating and review system
- Notification system
- Mobile app (React Native)

## Usage

### For Students Selling Materials:
1. Login with your Student ID
2. Navigate to "My Items" 
3. Click "Add New Item"
4. Fill in material details, price, and upload files
5. Publish to marketplace

### For Students Buying Materials:
1. Browse the marketplace
2. Use search and filters to find specific materials
3. View item details and seller ratings
4. Contact seller through chat
5. Complete purchase

### For Tutoring:
1. Go to "Tutoring" section
2. Either offer your tutoring services or find a tutor
3. Schedule sessions and manage bookings
4. Rate your experience

## Contributing

This project is specifically designed for Binus University. If you're a Binus student interested in contributing:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is intended for educational purposes within Binus University.

## Contact

For questions or suggestions, please contact the development team through the university channels.

---

**Note**: This is currently a prototype. Authentication is simplified for development purposes. In production, proper student verification and security measures will be implemented.
