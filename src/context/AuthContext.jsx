import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { authService } from "../services/authService";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState(null);

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem("workvault_token");

    if (token) {
      try {
        const freshUser = await authService.getMe();
        if (freshUser) {
          setUser(freshUser);
          setActiveRole(freshUser.role);
          localStorage.setItem("workvault_user", JSON.stringify(freshUser));
        }
      } catch {
        localStorage.removeItem("workvault_token");
        localStorage.removeItem("workvault_user");
        setUser(null);
        setActiveRole(null);
      }
    } else {
      setUser(null);
      setActiveRole(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (emailOrCredentials, maybePassword) => {
    try {
      setLoading(true);
      let email = emailOrCredentials;
      let password = maybePassword;

      if (
        typeof emailOrCredentials === "object" &&
        emailOrCredentials !== null
      ) {
        email = emailOrCredentials.email;
        password = emailOrCredentials.password;
      }

      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const res = await authService.login(email, password);
      setUser(res.user);
      setActiveRole(res.user.role);
      localStorage.setItem("workvault_user", JSON.stringify(res.user));
      localStorage.setItem("workvault_token", res.token);
      toast.success(`Welcome back, ${res.user.name}!`);
      return res.user;
    } catch (error) {
      const message = error.message || "Invalid email or password";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    try {
      setLoading(true);
      const res = await authService.register(data);
      setUser(res.user);
      setActiveRole(res.user.role);
      localStorage.setItem("workvault_user", JSON.stringify(res.user));
      localStorage.setItem("workvault_token", res.token);
      toast.success("Registration successful!");
      return res.user;
    } catch (error) {
      const message = error.message || "Registration failed";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserState = (updatedUserData) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedUserData };
      localStorage.setItem("workvault_user", JSON.stringify(nextUser));
      return nextUser;
    });
  };

  /**
   * Switch role — safely updates user role on backend, issues a new JWT, and persists state.
   */
  const switchRole = async (newRole) => {
    if (!user) return;
    if (newRole === "admin" && user.role !== "admin") {
      toast.error("Admin access requires administrator privileges");
      return;
    }
    if (user.role === newRole) {
      setActiveRole(newRole);
      return user;
    }

    try {
      const res = await authService.switchRole(newRole);
      if (res?.user && res?.token) {
        setUser(res.user);
        setActiveRole(res.user.role);
        localStorage.setItem("workvault_user", JSON.stringify(res.user));
        localStorage.setItem("workvault_token", res.token);
        toast.success(`Switched to ${newRole} account`);
        return res.user;
      }
    } catch (err) {
      toast.error(err.message || `Failed to switch to ${newRole}`);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setActiveRole(null);
    localStorage.removeItem("workvault_user");
    localStorage.removeItem("workvault_token");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        activeRole: user?.role || activeRole || "client",
        login,
        register,
        logout,
        switchRole,
        updateUserState,
        refreshUser: initAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
