import { createContext, useContext, useEffect, useState } from 'react';
import { auth, RecaptchaVerifier, signInWithPhoneNumber, signOut as firebaseSignOut } from '../utils/firebase';
import { authService } from '../utils/service';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // ─── Login Modal Global State ──────────────────────────────────────────────
  // Any component in the tree can call openLoginModal() to trigger the
  // Header's profile/login dropdown to open.
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser && !user) {
          const payload = {
            firebaseUid: firebaseUser.uid,
            phone: firebaseUser.phoneNumber?.replace('+91', '') || '',
            isNewUser: false
          };
          const response = await authService.firebaseLogin(payload);
          if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
          }
        }
      } catch (error) {
        console.error("Auto Login Sync Failed");
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const setupRecaptcha = (elementId: string) => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.log("Cleaning stale reCAPTCHA reference...");
      }
      window.recaptchaVerifier = null;
    }

    const element = document.getElementById(elementId);
    if (!element) return false;

    window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
      size: 'invisible',
      callback: () => {}
    });
    return true;
  };

  const checkUserExists = async (phoneNumber: string) => {
    try {
      const payload = {
        firebaseUid: "verification_trigger_only",
        phone: phoneNumber,
        isNewUser: false
      };
      const response = await authService.firebaseLogin(payload);
      if (response && response.data && response.data.success) {
        return { exists: true, user: response.data.user };
      }
      return { exists: false };
    } catch (error: any) {
      if (error.response && (error.response.status === 404 || error.response.status === 400)) {
        return { exists: false };
      }
      return { exists: false };
    }
  };

  const sendOtp = async (phoneNumber: string, elementId: string) => {
    try {
      const isReady = setupRecaptcha(elementId);
      if (!isReady) {
        return { success: false, error: "Authentication container initializing failed." };
      }
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = `+91${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      return { success: true };
    } catch (error: any) {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch(e){}
        window.recaptchaVerifier = null;
      }
      return { success: false, error: error.message };
    }
  };

  const verifyOtpAndSync = async (otpCode: string, registrationData?: { name: string; email: string; dob: string }) => {
    try {
      if (!confirmationResult) return { success: false, error: "Pehle OTP bhejो bhai!" };

      const result = await confirmationResult.confirm(otpCode);
      const firebaseUser = result.user;

      const payload = registrationData ? {
        firebaseUid: firebaseUser.uid,
        phone: firebaseUser.phoneNumber?.replace('+91', '') || '',
        name: registrationData.name,
        email: registrationData.email,
        dob: registrationData.dob,
        isNewUser: true
      } : {
        firebaseUid: firebaseUser.uid,
        phone: firebaseUser.phoneNumber?.replace('+91', '') || '',
        isNewUser: false
      };

      const response = await authService.firebaseLogin(payload);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: "Database mapping error" };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        checkUserExists,
        sendOtp,
        verifyOtp: verifyOtpAndSync,
        logout,
        // ─── Login modal controls (consumed by Header & ProductCard) ───
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);