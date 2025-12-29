import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthPage } from '@/components/auth/AuthPage';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ArrowUpRight, Shield, Zap, TrendingUp } from 'lucide-react';

export const LandingPage = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30 overflow-x-hidden flex flex-col">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 flex items-center justify-center px-6 py-6 max-w-7xl mx-auto w-full">
                <div className="absolute left-6 flex items-center gap-2 group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-lg group-hover:shadow-violet-500/50">
                        F
                    </div>
                    <span className="text-xl font-bold tracking-tight transition-all duration-300 group-hover:text-violet-400">Fintech</span>
                </div>

                <div className="flex items-center gap-4">
                    <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/20">
                                Login
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-md">
                            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden p-6">
                                <AuthPage isEmbedded={true} />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col justify-center px-6 max-w-7xl mx-auto text-center w-full py-20">

                {/* Main Headline */}
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[1.1]">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 transition-all duration-500 hover:from-violet-200 hover:to-violet-400 cursor-default">
                        Fintech
                    </span>
                    <span className="block flex items-center justify-center gap-4">
                        <span className="transition-all duration-500 hover:text-violet-300 cursor-default">Made Easy.</span>
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-violet-600/20 rounded-2xl flex items-center justify-center border border-violet-500/30 rotate-12 animate-float transition-all duration-500 hover:rotate-45 hover:scale-110 hover:bg-violet-600/40 hover:border-violet-400/50 hover:shadow-2xl hover:shadow-violet-500/50 cursor-pointer">
                            <ArrowUpRight className="w-8 h-8 md:w-12 md:h-12 text-violet-400 transition-all duration-300 group-hover:text-violet-300" />
                        </div>
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-16 transition-all duration-300 hover:text-white/80 cursor-default">
                    Streamline attendance management with our modern, secure platform designed for educational institutions.
                </p>

                {/* Feature Cards */}


                {/* Bottom Section with Arc */}
                <div className="relative w-full max-w-5xl mx-auto h-[300px] overflow-hidden">
                    {/* The Arc */}
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[150%] h-[1000px] rounded-[50%] border border-white/10 bg-gradient-to-b from-violet-900/10 to-transparent blur-[1px] transition-all duration-700 hover:border-violet-500/30" />
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[150%] h-[1000px] rounded-[50%] border-t border-violet-500/30 shadow-[0_-10px_40px_rgba(139,92,246,0.2)] transition-all duration-700 hover:border-violet-400/50 hover:shadow-[0_-10px_60px_rgba(139,92,246,0.4)]" />

                    {/* Content on Arc */}
                    <div className="absolute top-20 w-full flex justify-between px-10 text-[10px] tracking-[0.2em] font-bold text-white/40 uppercase">
                        <div className="transition-all duration-300 hover:text-violet-400 hover:scale-110 cursor-pointer">Mobile Payments</div>
                        <div className="text-white transition-all duration-300 hover:text-violet-300 hover:scale-110 cursor-pointer">Financial Wellness</div>
                        <div className="transition-all duration-300 hover:text-violet-400 hover:scale-110 cursor-pointer">Cryptocurrency</div>
                    </div>

                    <div className="absolute top-48 w-full flex justify-between px-10 text-[10px] tracking-[0.2em] font-bold text-white/30 uppercase">
                        <div className="flex items-center gap-1 transition-all duration-300 hover:text-violet-400 hover:translate-y-1 cursor-pointer">
                            Scroll Down ↓
                        </div>
                        <div className="transition-all duration-300 hover:text-violet-400 hover:scale-110 cursor-pointer">Digital Finance</div>
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 py-8 transition-all duration-300 hover:border-violet-500/30">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm text-white/40 transition-all duration-300 hover:text-white/60 cursor-default">
                        .
                    </p>
                </div>
            </footer>
        </div>
    );
};
