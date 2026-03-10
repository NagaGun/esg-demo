import { Link, useNavigate } from 'react-router-dom';

export default function NavBar({ backTo, backLabel, title, showLogo = true, rightContent }) {
    const navigate = useNavigate();

    return (
        <nav className="sticky top-0 z-50 bg-white h-[60px] shadow-sm px-6 flex items-center justify-between border-b border-gray-100 font-sans">
            <div className="flex items-center gap-4 flex-1">
                {backTo && (
                    <button
                        onClick={() => navigate(backTo)}
                        className="flex items-center gap-2 text-gray-500 hover:text-[#2D6A4F] transition text-sm font-medium"
                    >
                        ← {backLabel || 'Back'}
                    </button>
                )}

                {backTo && showLogo && <div className="w-[1px] h-5 bg-gray-200" />}

                {showLogo && (
                    <Link autoFocus={false} to="/" className="flex items-center gap-2 outline-none">
                        <span className="text-xl">🌿</span>
                        <span className="font-playfair text-lg font-bold text-[#2D6A4F]">Earthana</span>
                    </Link>
                )}
            </div>

            <div className="flex-1 text-center">
                {title && (
                    <span className="text-gray-600 font-medium text-sm tracking-wide">
                        {title}
                    </span>
                )}
            </div>

            <div className="flex items-center justify-end gap-4 flex-1">
                {rightContent}
            </div>
        </nav>
    );
}
