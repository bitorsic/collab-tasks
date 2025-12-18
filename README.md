# Task Tracker - Collaborative Task Management System

A robust backend system for task tracking and management that facilitates collaboration and organization within teams or projects. Built with Node.js, Express.js, and MongoDB.

## Features

### ✨ Core Features
- **User Authentication & Authorization**: Secure JWT-based authentication with bcrypt password hashing
- **Task Management**: Complete CRUD operations for tasks with advanced filtering, sorting, and searching
- **Team Collaboration**: Create teams, invite members, and manage roles
- **Task Assignment**: Assign tasks to team members
- **Comments**: Add, edit, and delete comments on tasks
- **File Attachments**: Upload and manage file attachments for tasks
- **Status Tracking**: Track task status (open, in-progress, completed, cancelled)
- **Priority Management**: Set task priorities (low, medium, high, urgent)

### 🔐 Security Features
- JWT-based authentication
- Bcrypt password hashing
- Protected routes and authorization
- Input validation and sanitization
- Role-based access control

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Validation**: express-validator
- **Environment Variables**: dotenv

## Project Structure

```
collab-tasks/
├── src/
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   └── multer.js          # File upload configuration
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   ├── taskController.js        # Task management logic
│   │   ├── teamController.js        # Team management logic
│   │   ├── commentController.js     # Comment management logic
│   │   └── attachmentController.js  # Attachment management logic
│   ├── middleware/
│   │   ├── auth.js            # Authentication & authorization middleware
│   │   ├── errorHandler.js    # Global error handler
│   │   └── validate.js        # Request validation middleware
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Task.js            # Task schema
│   │   ├── Team.js            # Team schema
│   │   ├── Comment.js         # Comment schema
│   │   └── Attachment.js      # Attachment schema
│   └── routes/
│       ├── authRoutes.js      # Authentication routes
│       ├── taskRoutes.js      # Task routes
│       ├── teamRoutes.js      # Team routes
│       ├── commentRoutes.js   # Comment routes
│       └── attachmentRoutes.js # Attachment routes
├── uploads/                   # File upload directory
├── .env                       # Environment variables
├── .env.example               # Example environment variables
├── .gitignore                 # Git ignore file
├── index.js                   # Application entry point
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Step 1: Clone the repository
```bash
git clone https://github.com/bitorsic/collab-tasks.git
cd collab-tasks
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure environment variables
Create a `.env` file in the root directory (or copy from `.env.example`):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/task-tracker
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

### Step 4: Start MongoDB
Make sure MongoDB is running on your system:

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 5: Run the application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "jwt_token_here"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get current user profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

#### Update password
```http
PUT /api/auth/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Task Endpoints

#### Create a task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Implement login feature",
  "description": "Create a secure login system with JWT",
  "dueDate": "2024-12-31",
  "priority": "high",
  "assignedTo": "user_id",
  "team": "team_id",
  "tags": ["backend", "authentication"]
}
```

#### Get all tasks (with filters)
```http
GET /api/tasks?status=open&priority=high&search=login&sortBy=dueDate&order=asc&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by status (open, in-progress, completed, cancelled)
- `priority`: Filter by priority (low, medium, high, urgent)
- `assignedTo`: Filter by assigned user ID
- `createdBy`: Filter by creator user ID
- `team`: Filter by team ID
- `search`: Search in title and description
- `sortBy`: Sort field (default: createdAt)
- `order`: Sort order (asc/desc, default: desc)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

#### Get tasks assigned to me
```http
GET /api/tasks/my-tasks?status=open
Authorization: Bearer <token>
```

#### Get single task
```http
GET /api/tasks/:id
Authorization: Bearer <token>
```

#### Update task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "status": "in-progress",
  "priority": "urgent"
}
```

#### Mark task as completed
```http
PUT /api/tasks/:id/complete
Authorization: Bearer <token>
```

#### Delete task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

### Team Endpoints

#### Create a team
```http
POST /api/teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Development Team",
  "description": "Backend development team"
}
```

#### Get all teams
```http
GET /api/teams
Authorization: Bearer <token>
```

#### Get single team
```http
GET /api/teams/:id
Authorization: Bearer <token>
```

#### Update team
```http
PUT /api/teams/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Team Name",
  "description": "Updated description"
}
```

#### Add member to team
```http
POST /api/teams/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id",
  "role": "member"
}
```

**Roles:** owner, admin, member

#### Remove member from team
```http
DELETE /api/teams/:id/members/:userId
Authorization: Bearer <token>
```

#### Delete team
```http
DELETE /api/teams/:id
Authorization: Bearer <token>
```

### Comment Endpoints

#### Add comment to task
```http
POST /api/tasks/:taskId/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "This is a comment on the task"
}
```

#### Get all comments for a task
```http
GET /api/tasks/:taskId/comments
Authorization: Bearer <token>
```

#### Update comment
```http
PUT /api/comments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated comment content"
}
```

#### Delete comment
```http
DELETE /api/comments/:id
Authorization: Bearer <token>
```

### Attachment Endpoints

#### Upload attachment to task
```http
POST /api/tasks/:taskId/attachments
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file_upload>
```

**Supported file types:** JPEG, JPG, PNG, GIF, PDF, DOC, DOCX, TXT, ZIP  
**Maximum file size:** 5MB

#### Get all attachments for a task
```http
GET /api/tasks/:taskId/attachments
Authorization: Bearer <token>
```

#### Download attachment
```http
GET /api/attachments/:id/download
Authorization: Bearer <token>
```

#### Delete attachment
```http
DELETE /api/attachments/:id
Authorization: Bearer <token>
```

## Data Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  teams: [Team IDs],
  createdAt: Date
}
```

### Task
```javascript
{
  title: String,
  description: String,
  status: String (open/in-progress/completed/cancelled),
  priority: String (low/medium/high/urgent),
  dueDate: Date,
  createdBy: User ID,
  assignedTo: User ID,
  team: Team ID,
  tags: [String],
  attachments: [Attachment IDs],
  comments: [Comment IDs],
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

### Team
```javascript
{
  name: String,
  description: String,
  owner: User ID,
  members: [{
    user: User ID,
    role: String (owner/admin/member),
    joinedAt: Date
  }],
  createdAt: Date
}
```

### Comment
```javascript
{
  content: String,
  task: Task ID,
  author: User ID,
  createdAt: Date,
  updatedAt: Date
}
```

### Attachment
```javascript
{
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  path: String,
  task: Task ID,
  uploadedBy: User ID,
  createdAt: Date
}
```

## User Stories Implementation

All user stories from the requirements have been implemented:

✅ User registration and account creation  
✅ Secure login with credentials  
✅ View and update profile  
✅ Create tasks with title, description, and due date  
✅ View all tasks assigned to user  
✅ Mark tasks as completed  
✅ Assign tasks to team members  
✅ Filter tasks by status  
✅ Search tasks by title or description  
✅ Add comments and attachments to tasks  
✅ Create teams and invite members  
✅ Secure logout  

## Testing the API

### Using cURL

**Register a user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Create a task:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Task",
    "description": "This is a test task",
    "priority": "high"
  }'
```

### Using Postman

1. Import the API endpoints into Postman
2. Set up an environment variable for the JWT token
3. Create a collection with all the endpoints
4. Test each endpoint with different scenarios

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Security Best Practices

1. **Environment Variables**: All sensitive data is stored in `.env` file
2. **Password Hashing**: Passwords are hashed using bcrypt before storage
3. **JWT Authentication**: Secure token-based authentication
4. **Input Validation**: All inputs are validated using express-validator
5. **Authorization**: Role-based and ownership-based access control
6. **File Upload Security**: File type and size restrictions

## Future Enhancements

- [ ] Real-time notifications using WebSockets or Server-Sent Events
- [ ] AI-powered task description generation
- [ ] Email notifications for task assignments
- [ ] Task dependencies and subtasks
- [ ] Calendar integration
- [ ] Activity logs and audit trails
- [ ] Advanced analytics and reporting
- [ ] Export tasks to CSV/PDF
- [ ] OAuth integration (Google, GitHub)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Quality

The codebase follows these principles:
- Clean code architecture
- RESTful API best practices
- Proper error handling
- Input validation
- Security best practices
- Modular structure
- Comprehensive comments
- Consistent naming conventions

## License

ISC

## Author

Created as part of the Airtribe backend development course.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Repository**: https://github.com/bitorsic/collab-tasks

**Happy Coding! 🚀**
