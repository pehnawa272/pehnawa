"use client";

import React, { useState, useEffect } from "react";
import SymbolIcon from "@/components/SymbolIcon";

// Hardcoded Credentials (stored as simple constants)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "pehnawa_admin_couture";

export default function AdminAuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is already authenticated in this session
    const authStatus = sessionStorage.getItem("admin_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    setChecking(false);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_authenticated", "true");
      setIsAuthenticated(true);
    } else {
      setError("Invalid credential signatures. Access denied.");
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#131313] flex flex-col justify-center items-center text-center">
        <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-[#1F1F1F] border border-white/10 p-8 md:p-10 shadow-2xl relative space-y-8 animate-fade-in-up">
          {/* Logo / Header */}
          <div className="text-center space-y-4">
            <SymbolIcon name="lock" className="size-12 text-gold mx-auto" />
            <h2 className="font-playfair text-[26px] text-white tracking-wider uppercase font-semibold">
              Atelier Vault
            </h2>
            <p className="font-montserrat text-[11px] text-white/40 tracking-[0.1em] uppercase">
              Authorized personnel entry only
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-950/20 border border-red-500/30 flex gap-3 text-red-400">
                <SymbolIcon name="error" className="size-5 self-start flex-shrink-0" />
                <p className="font-montserrat text-[11.5px] leading-relaxed font-medium">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5 font-bold">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none transition-colors"
                  placeholder="Atelier identity"
                />
              </div>

              <div>
                <label className="block text-[10px] font-montserrat text-white/50 uppercase tracking-widest mb-1.5 font-bold">
                  Secret Key Phrase
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#131313] border border-white/10 px-4 py-3 text-[12px] font-montserrat text-white focus:border-gold outline-none rounded-none transition-colors"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4.5 bg-gold hover:bg-[#C5A028] text-[#121212] font-montserrat text-[12px] font-bold tracking-[0.25em] transition-all uppercase rounded-none mt-2 cursor-pointer"
            >
              AUTHENTICATE VAULT
            </button>
          </form>
        </div>
      </div>
    );
  }

  return children;
}
