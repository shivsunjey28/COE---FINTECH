
import { Link } from "react-router-dom";

export const Sidebar = () => {
    return (
        <aside className="fixed left-4 top-4 bottom-4 w-64 glass-card flex flex-col p-4 z-40 hidden md:flex border-white/5 bg-black/20">
            {/* Logo Area */}
            <div className="flex items-center gap-3 px-2 py-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <span className="text-xl font-bold text-white">F</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white tracking-wide">Fintech Coe</h1>
                    <p className="text-xs text-white/50">Admin Portal</p>
                </div>
            </div>

            {/* Empty Navigation Area (As requested) */}
            <nav className="flex-1 space-y-2">
                {/* Navigation items removed */}
            </nav>
        </aside>
    );
};
