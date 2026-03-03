import admin from "../configs/firebase_config.js";


export async function mw_session(req, res, next) {
  try {
    const sessionCookie = req.cookies.session;
    if (!sessionCookie) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
    }

    const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    
    req.user = {
      uid: decodedToken.uid,
      role: decodedToken.role || decodedToken.customClaims?.role || 'client',
      email: decodedToken.email
    };
    
    console.log("✅ User authenticated:", req.user);
    next();
  } catch (err) {
    console.error("❌ Session verification failed:", err.message);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid session', 
      error: err.message 
    });
  }
}


export function mw_role(requiredRoles = []) {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    console.log("🔍 Checking role:", { userRole, requiredRoles });

    if (!userRole || !requiredRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient role",
        details: {
          required: requiredRoles,
          current: userRole
        }
      });
    }

    console.log("✅ Role check passed");
    next();
  };
}