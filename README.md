# Admin Panel

Admin panel for managing the smesj ecosystem. Currently supports invitation code management.

## Features

- **Clerk Authentication**: Secure login with Clerk
- **Admin Authorization**: Access restricted to specific admin user
- **Invitation Management**:
  - View all invitations
  - Create new invitations
  - Copy invitation codes
  - Generate QR codes for invitations
  - Delete invitations
  - Track usage (uses/max uses)

## Prerequisites

- Node.js 18+
- Clerk account with publishable key
- Access to world-api backend

## Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your values:
   - `REACT_APP_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key (dev)
   - `REACT_APP_API_URL`: Backend API URL (default: http://localhost:3003)
   - `REACT_APP_ADMIN_USER_ID`: Your Clerk user ID for admin access

3. **Start development server**:
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

## Production Deployment

1. **Configure production environment**:

   Create `.env.production` with production values:
   ```bash
   REACT_APP_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
   REACT_APP_API_URL=https://world-api.smesj.world
   REACT_APP_ADMIN_USER_ID=user_your_production_clerk_id
   ```

2. **Deploy**:
   ```bash
   ./deploy.sh
   ```

   This will:
   - Build the Docker image
   - Push to Docker Hub (smesjman/admin-fe)
   - Deploy to production VM at 172.16.1.244
   - Start the container on port 3004
   - Verify deployment at https://admin.smesj.world

## Architecture

- **Frontend**: React 18 with Clerk authentication
- **Backend API**: world-api (NestJS)
- **Deployment**: Docker + Nginx
- **Authentication**: Clerk (JWT-based)
- **Authorization**: User ID check against environment variable

## Security

- Only users with the specific admin user ID can access the panel
- All other authenticated users see an "Access Denied" message
- Unauthenticated users are prompted to sign in
- API calls use the world-api backend (no direct database access)

## Folder Structure

```
admin-fe/
├── public/             # Static assets
├── src/
│   ├── components/     # React components
│   │   ├── InvitationsManager.js
│   │   ├── InvitationsManager.css
│   │   ├── UnauthorizedAccess.js
│   │   └── UnauthorizedAccess.css
│   ├── App.js          # Main app component
│   ├── App.css         # Main app styles
│   └── index.js        # Entry point with ClerkProvider
├── Dockerfile          # Multi-stage Docker build
├── nginx.conf          # Nginx configuration
├── deploy.sh           # Deployment script
└── package.json        # Dependencies
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | `pk_test_...` |
| `REACT_APP_API_URL` | Backend API base URL | `https://world-api.smesj.world` |
| `REACT_APP_ADMIN_USER_ID` | Clerk user ID for admin | `user_2c4SA...` |

## API Endpoints Used

The admin panel communicates with these world-api endpoints:

- `GET /invitations` - List all invitations
- `POST /invitations` - Create new invitation
- `DELETE /invitations/:id` - Delete invitation
- `GET /invitations/:code/qr` - Generate QR code

## Future Enhancements

- [ ] User management
- [ ] Footy game moderation
- [ ] Imperial game management
- [ ] Analytics dashboard
- [ ] Audit logs
- [ ] Role-based access control (multiple admin levels)

## Support

For issues or questions, check the deployment logs:

```bash
ssh smesj@172.16.1.244 'docker logs admin-fe'
```

## License

Private - Internal use only
