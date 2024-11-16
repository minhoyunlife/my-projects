import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackUrl: process.env.GITHUB_CALLBACK_URL,
  },
  jwtSecret: process.env.JWT_SECRET,
  adminWebUrl: process.env.ADMIN_WEB_URL,
}));
