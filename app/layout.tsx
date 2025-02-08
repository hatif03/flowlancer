'use client';

import './globals.css';
import { ReactNode } from 'react';
import Web3Providers from '@/providers/Web3Providers';
import { Toaster } from "@/components/ui/toaster";
import ConnectWallet from '@/components/ConnectWalletButton';
import Link from 'next/link';
import Image from 'next/image';
import { SessionProvider } from "next-auth/react";
import Navigation from '@/components/Navigation';
import { TelegramAuthProvider } from '@/providers/TelegramAuthContext';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const RootLayout = ({ children }: { children: ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <html>
      <head>
        <title>Flowlancer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="bg-gradient-to-bl from-[#1A2A3D] via-[#243B52] to-[#13232C] text-gray-100 font-sans">
  <SessionProvider>
    <Web3Providers>
      <TelegramAuthProvider>
        {/* Header */}
        <header className="fixed top-0 left-0 w-full bg-[#0D1B29]/90 backdrop-blur-md shadow-2xl border-b border-purple-700/50 z-50">
          <div className="container mx-auto px-8 py-6 flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4">
              <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-teal-400 hover:from-purple-400 hover:to-teal-500 transition-all duration-300 transform hover:scale-110">
                Flowlancer
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Navigation />
              <ConnectWallet />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden relative z-50 text-purple-400 hover:text-purple-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </Button>
          </div>
        </header>

        {/* Mobile Sidebar Navigation */}
        <div
          className={cn(
            "fixed inset-0 bg-[#0D1B29]/80 backdrop-blur-lg transition-all duration-500 flex flex-col items-center justify-center",
            isMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
          )}
        >
          <div className="container mx-auto flex flex-col gap-6 items-center">
            <Navigation mobile onClose={() => setIsMenuOpen(false)} />
            <ConnectWallet />
          </div>
        </div>

        {/* Main Content */}
        <main className="pt-32 md:pt-40 min-h-screen px-8 md:px-16 transition-all duration-500">
          {children}
        </main>
      </TelegramAuthProvider>
    </Web3Providers>
  </SessionProvider>
  <Toaster />
</body>
    </html>
  );
};

export default RootLayout;