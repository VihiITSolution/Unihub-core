# UniHub - E-Learning & Marketplace Platform

UniHub is a comprehensive Next.js-based platform that combines e-learning and marketplace functionality. Built with TypeScript, Tailwind CSS, and designed for mobile-responsive experiences.

## Features

### Phase 1 MVP Features

#### Student Flow
- **Course Browsing**: Browse and filter courses by category, level, and price
- **Course Details**: View detailed course information, instructor details, and content preview
- **Enrollment**: Enroll in paid courses (payment integration ready)
- **Content Viewing**: Access course content including videos and PDFs
- **Student Dashboard**: Track learning progress and manage enrolled courses

#### Tutor Flow
- **Tutor Dashboard**: Manage courses, view analytics, and track revenue
- **Course Creation**: Upload and create new courses with comprehensive forms
- **Course Management**: Edit, update, and manage course content

#### Marketplace Flow
- **Product Browsing**: Browse and search marketplace products
- **Product Details**: View detailed product information and images
- **Shopping Cart**: Add products to cart (basic implementation)
- **Seller Dashboard**: Manage products and orders (basic implementation)

### Technical Features
- **Mobile-Responsive**: Fully responsive design for all screen sizes
- **TypeScript**: Full type safety across the application
- **Tailwind CSS**: Modern, utility-first styling
- **API Integration**: Ready for Node.js/MySQL backend integration
- **Service Layer**: Clean architecture with dedicated service modules

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/VihiITSolution/Unihub-core.git
cd Unihub-core
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your backend API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages (login, register)
│   ├── courses/           # Course browsing and details
│   ├── marketplace/       # Marketplace pages
│   ├── student/           # Student dashboard and learning
│   └── tutor/             # Tutor dashboard and course management
├── components/            # Reusable React components
│   └── layout/           # Layout components (Header, Footer)
├── lib/                   # Utility libraries
│   └── api-client.ts     # API client configuration
├── services/              # API service modules
│   ├── auth.service.ts   # Authentication services
│   ├── course.service.ts # Course-related services
│   └── marketplace.service.ts # Marketplace services
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Backend Integration

The frontend is designed to integrate with a Node.js/MySQL backend. The API services are located in `src/services/` and use the centralized API client in `src/lib/api-client.ts`.

### API Endpoints Expected

The application expects the following API structure:

- **Auth**: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- **Courses**: `/api/courses`, `/api/courses/:id`, `/api/courses/:id/content`
- **Enrollments**: `/api/enrollments`, `/api/courses/:id/enroll`
- **Products**: `/api/products`, `/api/products/:id`
- **Orders**: `/api/orders`

Configure the backend URL in your `.env` file.

## Key Pages

- `/` - Home page with platform overview
- `/courses` - Browse all courses
- `/courses/[id]` - Course details page
- `/student/dashboard` - Student dashboard
- `/student/learn/[courseId]` - Course learning interface
- `/tutor/dashboard` - Tutor dashboard
- `/tutor/create-course` - Create new course
- `/marketplace` - Browse marketplace products
- `/marketplace/[id]` - Product details
- `/auth/login` - Login page
- `/auth/register` - Registration page

## Mobile Responsiveness

All pages are fully responsive with mobile-first design:
- Responsive navigation with hamburger menu
- Flexible grid layouts
- Touch-friendly interface elements
- Optimized images and content for mobile devices

## Technologies Used

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React 19** - UI library
- **ESLint** - Code linting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email support@unihub.com or join our Slack channel.