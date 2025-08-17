// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User as UiUser } from "@/types/clinical";

/** Roles kept from your original code */
type Role = "admin" | "clinician" | "supervisor";

interface RegisterUserData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  password: string;
}

interface AuthContextType {
  currentUser: UiUser | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (userData: RegisterUserData) => Promise<UiUser>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  canEditNotes: () => boolean;
  canViewBilling: () => boolean;
  isLoading: boolean;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

/** ---- Legacy mock users you already had (carried over) ---- */
const legacyMockUsers: Array<UiUser & { password: string }> = [
  {
    id: "750e8400-e29b-41d4-a716-446655440001",
    username: "admin",
    email: "admin@clinic.com",
    firstName: "John",
    lastName: "Admin",
    role: "admin",
    department: "Administration",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    password: "admin123",
  },
  {
    id: "750e8400-e29b-41d4-a716-446655440002",
    username: "clinician",
    email: "clinician@clinic.com",
    firstName: "Dr. Sarah",
    lastName: "Thompson",
    role: "clinician",
    department: "Physiotherapy",
    license: "PT12345",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    password: "clinician123",
  },
  {
    id: "750e8400-e29b-41d4-a716-446655440003",
    username: "supervisor",
    email: "supervisor@clinic.com",
    firstName: "Dr. Michael",
    lastName: "Wilson",
    role: "supervisor",
    department: "Clinical Services",
    license: "MD67890",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    password: "supervisor123",
  },
];

/** Utility: map DB -> UI user */
function mapDbUserToUi(db: any): UiUser {
  if (!db) return null as unknown as UiUser;
  return {
    id: db.id,
    username: db.username ?? db.email?.split("@")[0] ?? "",
    email: db.email ?? null,
    firstName: db.first_name ?? "",
    lastName: db.last_name ?? "",
    role: db.role as Role,
    department: db.department ?? null,
    license: db.license ?? undefined,
    signature: db.signature ?? undefined,
    initials: db.initials ?? undefined,
    clinicianColor: db.clinician_color ?? undefined,
    isActive: db.is_active ?? true,
    createdAt: db.created_at ?? new Date().toISOString(),
  };
}

/** Utility: map UI -> DB upsert shape for public.users */
function mapUiToDbUser(u: UiUser) {
  return {
    id: u.id, // let DB generate if omitted; we keep the existing ids for "carry over" lookups, but Supabase can still use its UUIDs.
    email: u.email,
    first_name: u.firstName,
    last_name: u.lastName,
    username: u.username,
    role: u.role,
    department: u.department ?? null,
    license: u.license ?? null,
    signature: u.signature ?? null,
    initials: u.initials ?? null,
    clinician_color: (u as any).clinicianColor ?? null,
    is_active: u.isActive ?? true,
    // created_at handled by DB default
  };
}

/** Optional: try to find a legacy user by username or email */
function findLegacyUser(usernameOrEmail: string) {
  const lowered = usernameOrEmail.trim().toLowerCase();
  return legacyMockUsers.find(
    (u) => u.username.toLowerCase() === lowered || (u.email ?? "").toLowerCase() === lowered
  );
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * On first load:
   * 1) Listen for Supabase session.
   * 2) Carry-over: upsert legacy mock profiles into public.users (no passwords).
   *    (This ensures your clinicians/admins exist in your UI lists.)
   */
  useEffect(() => {
    let mounted = true;

    // Keep auth session in sync
    const init = async () => {
      try {
        // 1) Auth session
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user ?? null;

        // 2) Carry-over mock profiles into public.users table (idempotent)
        //    This does NOT create auth users; it only ensures profile rows exist.
        //    Requires permissive policy on public.users (your migration shows this).
        for (const legacy of legacyMockUsers) {
          const upsertRow = mapUiToDbUser(legacy);
          // do NOT supply id on upsert if you prefer DB-generated ids.
          // If you want to preserve the exact id, keep it (as below). Otherwise delete `id`.
          const { error: upsertErr } = await supabase.from("users").upsert(upsertRow, { onConflict: "email" });
          if (upsertErr) {
            // Only warn; don't block app startup
            // eslint-disable-next-line no-console
            console.warn("users upsert warning:", upsertErr.message);
          }
        }

        // 3) Resolve currentUser from DB profile if logged in
        if (sessionUser) {
          const { data: dbUser, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", sessionUser.email)
            .maybeSingle();

          if (!mounted) return;

          if (error) {
            console.warn("fetch profile warning:", error.message);
            setCurrentUser({
              id: sessionUser.id,
              username: sessionUser.email?.split("@")[0] ?? "",
              email: sessionUser.email ?? null,
              firstName: "",
              lastName: "",
              role: "clinician", // fallback
              department: null,
              isActive: true,
              createdAt: new Date().toISOString(),
            });
          } else {
            setCurrentUser(mapDbUserToUi(dbUser));
          }
        } else {
          setCurrentUser(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      (async () => {
        const sUser = session?.user ?? null;
        if (!sUser) {
          setCurrentUser(null);
          return;
        }
        const { data: dbUser } = await supabase
          .from("users")
          .select("*")
          .eq("email", sUser.email)
          .maybeSingle();
        setCurrentUser(mapDbUserToUi(dbUser ?? { email: sUser.email, id: sUser.id, role: "clinician" }));
      })();
    });

    init();

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  /**
   * Login:
   * - Accepts username OR email (keeps your existing API).
   * - Try Supabase sign-in with email.
   * - If that fails, and creds match a legacy user, auto sign-up then sign-in (migrates that user).
   */
  const login = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    try {
      // determine email for supabase
      let email = usernameOrEmail.trim();
      if (!email.includes("@")) {
        // map username -> email via legacy or users table
        const legacy = findLegacyUser(email);
        if (legacy?.email) email = legacy.email;
        else {
          // last resort: look up by username in DB
          const { data: dbUser } = await supabase.from("users").select("email").eq("username", email).maybeSingle();
          if (dbUser?.email) email = dbUser.email;
        }
      }

      // 1) try normal sign-in
      let { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) return;

      // 2) if invalid creds but matches legacy, auto-migrate
      const legacy = findLegacyUser(usernameOrEmail);
      if (legacy && legacy.email?.toLowerCase() === email.toLowerCase() && legacy.password === password) {
        const { error: regErr } = await supabase.auth.signUp({ email, password });
        if (regErr) throw regErr;

        // ensure profile row exists/updated
        const { error: upsertErr } = await supabase.from("users").upsert(
          {
            email,
            first_name: legacy.firstName,
            last_name: legacy.lastName,
            username: legacy.username,
            role: legacy.role,
            department: legacy.department ?? null,
            license: legacy.license ?? null,
            is_active: true,
          },
          { onConflict: "email" }
        );
        if (upsertErr) console.warn("users upsert (after signUp) warning:", upsertErr.message);

        // sign-in again
        const { error: signinErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signinErr) throw signinErr;

        toast.success("Profile migrated and signed in.");
        return;
      }

      // otherwise surface the original error
      throw error;
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Login failed");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register:
   * - Creates Supabase Auth user
   * - Upserts profile into public.users
   */
  const register = async (userData: RegisterUserData): Promise<UiUser> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });
      if (error) throw error;

      const { error: upsertErr, data: dbUsers } = await supabase
        .from("users")
        .upsert(
          {
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            username: userData.username,
            role: userData.role,
            department: userData.role === "clinician" ? "Physiotherapy" : "Administration",
            is_active: true,
          },
          { onConflict: "email" }
        )
        .select("*")
        .limit(1);
      if (upsertErr) {
        console.warn("users upsert warning:", upsertErr.message);
      }

      const dbUser = Array.isArray(dbUsers) ? dbUsers[0] : dbUsers;
      const ui = mapDbUserToUi(
        dbUser ?? {
          id: data.user?.id ?? crypto.randomUUID(),
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          username: userData.username,
          role: userData.role,
          department: userData.role === "clinician" ? "Physiotherapy" : "Administration",
          is_active: true,
        }
      );

      toast.success("User registered successfully.");
      return ui;
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Registration failed");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  /** Uses Supabase to change password for current session user */
  const changePassword = async (_currentPassword: string, newPassword: string): Promise<void> => {
    // (Supabase doesn't check current password on update; it's tied to session)
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success("Password changed successfully.");
  };

  /** Permissions – unchanged from your logic */
  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;

    switch (permission) {
      case "view_patients":
        return ["admin", "clinician", "supervisor"].includes(currentUser.role);
      case "edit_notes":
        return ["clinician", "supervisor"].includes(currentUser.role);
      case "view_billing":
        return ["admin", "supervisor"].includes(currentUser.role);
      case "comment_notes":
        return currentUser.role === "supervisor";
      case "manage_users":
        return ["admin", "supervisor"].includes(currentUser.role);
      case "admin_access":
        return ["admin", "supervisor"].includes(currentUser.role);
      default:
        return false;
    }
  };

  const canEditNotes = () => hasPermission("edit_notes");
  const canViewBilling = () => hasPermission("view_billing");

  const value = useMemo<AuthContextType>(
    () => ({
      currentUser,
      login,
      register,
      logout,
      hasPermission,
      canEditNotes,
      canViewBilling,
      isLoading,
      changePassword,
    }),
    [currentUser, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
