import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Użytkownik', type: 'text' },
        password: { label: 'Hasło', type: 'password' }
      },
      async authorize(credentials) {
        // W produkcji pobierać z bazy - na razie hardcoded admin
        if (credentials?.username === 'admin' &&
            credentials?.password === process.env.ADMIN_PASSWORD) {
          return { id: '1', name: 'Admin', email: 'admin@treefish.pl' }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
