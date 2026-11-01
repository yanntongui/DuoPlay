import { defineAuth } from "@convex-dev/auth";
import { Password } from "@convex-dev/auth/providers";

export default defineAuth({
  // Configure the credentials provider
  credentials: (args) => {
    const { email, password } = args;
    // In production, use your actual password verification logic
    // For demo: accept any non-empty credentials
    return {
      credentials: {
        email,
        password,
      },
      async validate({ credentials }) {
        const { email, password } = credentials;
        
        if (!email || !password) {
          return { success: false, error: "Email et mot de passe requis" };
        }

        if (password.length < 8) {
          return { success: false, error: "Mot de passe trop court" };
        }

        return {
          success: true,
          // Return user data for token
          user: {
            email,
          },
        };
      },
    };
  },

  // Configure the password provider
  password: (args) => {
    return {
      ...args,
      async validate({ email, password }) {
        if (!email || !password) {
          return { success: false, error: "Email et mot de passe requis" };
        }

        if (password.length < 8) {
          return { success: false, error: "Mot de passe trop court (min 8 caractères)" };
        }

        return {
          success: true,
          user: { email },
        };
      },
    };
  },

  // Configure what happens when a user is created
  async onInit(ctx) {
    // Create initial admin user if none exists
    const users = await ctx.db.query("users").collect();
    if (users.length === 0) {
      // Create demo user
      const userId = await ctx.db.insert("users", {
        name: "Admin",
        email: "admin@duoplay.com",
        image: "",
        isVerified: true,
      });

      // Create admin profile
      await ctx.db.insert("profiles", {
        userId,
        displayName: "Admin",
        role: "admin",
        plan: "premium",
        status: "active",
        lastActiveAt: Date.now(),
        createdAt: Date.now(),
      });

      // Create admin access record with full permissions
      await ctx.db.insert("adminAccess", {
        userId,
        role: "super_admin",
        permissions: ["*"],
        canViewSensitive: true,
        twoFactorEnabled: false,
        lastLoginAt: Date.now(),
        createdAt: Date.now(),
      });
    }
  },
});
