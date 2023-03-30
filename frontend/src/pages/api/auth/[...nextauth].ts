import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import axiosClient from '@/lib/axiosClient'
import { NextApiRequest, NextApiResponse } from 'next'
import { AxiosError } from 'axios'

const { backendRequest, getCSRFToken } = axiosClient()

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default NextAuth({
    // https://next-auth.js.org/configuration/providers
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. 'Sign in with...')
            name: 'Credentials',
            // The credentials is used to generate a suitable form on the sign in page.
            // You can specify whatever fields you are expecting to be submitted.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                email: {
                    label: 'Email',
                    type: 'text',
                    placeholder: 'jsmith',
                },
                password: { label: 'Password', type: 'password' },
                remember: {
                    label: 'Remember',
                    type: 'boolean'
                }
            },
            async authorize(credentials) {
                // Due to cilent/serverside interactions, the CSRF header and subsequent authed header
                // must be side in serverside cookies.
                let error = '';

                try {
                    // Get CSRF token, set into header and as cookie in order to correctly login/get user details
                    const setCookiesCSRFToken = await getCSRFToken()
                        .then(res => res);

                    // @ts-ignore Login
                    const loginRes = await backendRequest('post', '/login', credentials, setCookiesCSRFToken)
                        .then(res => {
                            // Only need the set cookies for auth subsequent requests
                            return res.headers['set-cookie'] ?? [];
                        });

                    // Logged in now, get user details
                    const user = await backendRequest('get', '/api/user', null, loginRes)
                        .then(res => {
                            return res.data.data;
                        });

                    // Finally need to get the new auth token and set the auth bearer value
                    const accessToken = await backendRequest(
                        'post',
                        '/api/tokens/create',
                        null,
                        loginRes,
                    )
                        .then(res => {
                            return res.data;
                        })

                    // Set the access token to assign to the session and access on the cilentside
                    user.accessToken = accessToken.token;

                    return user;
                } catch (err: any | AxiosError) {
                    const httpCode = err.response.status
                    error = err.response.data.message
                }

                // Return any error messages
                if(error) throw new Error(error)

                // Already returned user or errors if exists
                // Catch any other errors
                return null;
            },
        }),
    ],
    // Database optional. MySQL, Maria DB, Postgres and MongoDB are supported.
    // https://next-auth.js.org/configuration/databases
    //
    // Notes:
    // * You must install an appropriate node_module for your database
    // * The Email provider requires a database (OAuth providers do not)
    // database: process.env.DATABASE_URL,

    // The secret should be set to a reasonably long random string.
    // It is used to sign cookies and to sign and encrypt JSON Web Tokens, unless
    // a separate secret is defined explicitly for encrypting the JWT.
    secret: process.env.NEXTAUTH_SECRET,

    session: {
        // Use JSON Web Tokens for session instead of database sessions.
        // This option can be used with or without a database for users/accounts.
        // Note: `strategy` should be set to 'jwt' if no database is used.
        strategy: 'jwt',

        // TODO: Enable max age after testing complete
        // Seconds - How long until an idle session expires and is no longer valid.
        // maxAge: 30 * 24 * 60 * 60, // 30 days

        // Seconds - Throttle how frequently to write to database to extend a session.
        // Use it to limit write operations. Set to 0 to always update the database.
        // Note: This option is ignored if using JSON Web Tokens
        // updateAge: 24 * 60 * 60, // 24 hours
    },

    // JSON Web tokens are only used for sessions if the `strategy: 'jwt'` session
    // option is set - or by default if no database is specified.
    // https://next-auth.js.org/configuration/options#jwt
    jwt: {
        // A secret to use for key generation (you should set this explicitly)
        secret: process.env.NEXTAUTH_SECRET,
        // Set to true to use encryption (default: false)
        // encryption: true,
        // You can define your own encode/decode functions for signing and encryption
        // if you want to override the default behaviour.
        // encode: async ({ secret, token, maxAge }) => {},
        // decode: async ({ secret, token, maxAge }) => {},
    },

    // You can define custom pages to override the built-in ones. These will be regular Next.js pages
    // so ensure that they are placed outside of the '/api' folder, e.g. signIn: '/auth/mycustom-signin'
    // The routes shown here are the default URLs that will be used when a custom
    // pages is not specified for that route.
    // https://next-auth.js.org/configuration/pages
    pages: {
        signIn: '/login', // Displays signin buttons
        // signOut: '/auth/signout', // Displays form with sign out button
        // error: '/auth/error', // Error code passed in query string as ?error=
        // verifyRequest: '/auth/verify-request', // Used for check email page
        // newUser: '/register' // If set, new users will be directed here on first sign in
    },

    // Callbacks are asynchronous functions you can use to control what happens
    // when an action is performed.
    // https://next-auth.js.org/configuration/callbacks
    callbacks: {
        // async signIn({ user, account, profile, email, credentials }) { return true },
        // async redirect({ url, baseUrl }) { return baseUrl },
        async session({ session, token, user }) {
            // Add in serverside set user and errors into session to access cilentside
            session.user = token.user
            session.error = token.error

            return session;
         },
        async jwt({ token, user, account, profile, isNewUser }) {
            if (!user) return token;

            // User exists, set into jwt token to set into session
            // Required to auth requests later in client side
            return {
                token: token,
                user: user
            };
        }
    },

    // Events are useful for logging
    // https://next-auth.js.org/configuration/events
    events: {
        async signOut({ token, session }) {
            // Delete token and sessions
            token = {};
            session = {};
        }
    },

    // TODO: Disable debug msg
    // Enable debug messages in the console if you are having problems
    debug: true,
    }
);

// Just here for eslint must assign return to variable lint
// const nextAuthExport = (req: NextApiRequest, res: NextApiResponse) => {
    // @ts-ignore Using overloaded function with those params, so it's not an error
    // return NextAuth(req, res, nextAuthOptions(req, res));
// }

// export default nextAuthOptions;
