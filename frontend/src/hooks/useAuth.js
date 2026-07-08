import { useState } from "react";

function useAuth() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const isAuthenticated = !!user && !!token;

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return {
    user,
    setUser,
    token,
    setToken,
    isAuthenticated,
    logout,
  };
}

export default useAuth;
