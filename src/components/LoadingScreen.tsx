import React from 'react';

export const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden selection:bg-white/20">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-16">

                {/* Visual Core: The Energy Orb */}
                <div className="relative flex items-center justify-center">
                    {/* Core Light */}
                    <div className="w-12 h-12 bg-white rounded-full shadow-[0_0_50px_20px_rgba(255,255,255,0.8)] animate-pulse z-20" />

                    {/* Rotating Energy Rings */}
                    <div className="absolute inset-[-40px] border border-white/20 rounded-full animate-[spin_6s_linear_infinite]" />
                    <div className="absolute inset-[-80px] border border-white/10 rounded-full animate-[spin_8s_linear_infinite_reverse]" />

                    {/* Expanding Waves */}
                    <div className="absolute inset-0 border border-white/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                    <div className="absolute inset-0 border border-white/10 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] animation-delay-500" />
                </div>

                {/* Text Content */}
                <div className="space-y-4 text-center">
                    <h2 className="text-3xl font-bold tracking-[0.2em] text-white uppercase text-glow">
                        Fintech
                    </h2>
                    <p className="text-xs font-medium tracking-[0.4em] text-white/50 uppercase">
                        System loading
                    </p>
                </div>

            </div>

            {/* Floating Geometric Particles */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-2 h-2 bg-white/20 rounded-full animate-float" style={{ animationDelay: '0s' }} />
                <div className="absolute top-[60%] right-[20%] w-3 h-3 border border-white/20 rotate-45 animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-[20%] left-[30%] w-1 h-1 bg-white/40 rounded-full animate-float" style={{ animationDelay: '2s' }} />
            </div>

        </div>
    );
};
