import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '../../../lib/mongoose';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { createAuditLog } from '../../../lib/auditLog';

export const authOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            await createAuditLog({ action: 'login_fail', entity: 'Auth', details: 'Missing email or password', actorName: credentials?.email });
            throw new Error('Please enter an email and password');
          }

          await dbConnect();

          const user = await User.findOne({ email: credentials.email }).select('+password');

          if (!user) {
            await createAuditLog({ action: 'login_fail', entity: 'Auth', details: 'No user found', actorName: credentials.email });
            throw new Error('No user found with this email');
          }

          const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordMatch) {
            await createAuditLog({ action: 'login_fail', entity: 'Auth', details: 'Incorrect password', actorId: user._id.toString(), actorName: user.name });
            throw new Error('Incorrect password');
          }

          const result = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };

          await createAuditLog({ action: 'login_success', entity: 'Auth', details: 'User logged in', actorId: user._id.toString(), actorName: user.name });

          return result;
        } catch (err) {
          // Rethrow so NextAuth shows error
          throw err;
        }
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; // Add role to the token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role; // Add role to the session
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
