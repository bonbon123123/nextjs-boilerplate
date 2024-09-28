import Link from "next/link";
import { SessionContext } from '../invisibleComponents/SessionProvider';
import { useContext } from "react";
export default function NavBar() {
    const session = useContext(SessionContext);

    return (
        <nav className="flex h-12 bg-main">
            <Link
                href="/"
                className="h-full text-lg text-light hover:text-white px-4 py-2 hover:bg-light-main min-w-[100px] text-center"
            >
                Specs
            </Link>
            <Link
                href="/pages/upload"
                className="h-full text-lg text-light hover:text-white px-4 py-2 hover:bg-light-main min-w-[100px] text-center"
            >
                Upload
            </Link>
            <div className="h-full w-px bg-main" /> {/* separator */}
            <Link
                href="/pages/search"
                className="h-full text-lg text-light hover:text-white px-4 py-2 hover:bg-light-main min-w-[100px] text-center"
            >
                Search
            </Link>
            {session?.userName && (
                <Link
                    href="/pages/profile"
                    className="h-full text-lg text-light hover:text-white px-4 py-2 hover:bg-light-main min-w-[100px] text-center"
                >
                    Profile
                </Link>
            )}
            <div className="ml-auto" />
            {session?.userName ? (
                <Link
                    href="/pages/login"
                    onClick={session.logout}
                    className="h-full text-lg text-light hover:text-white px-4 py-2 hover:bg-light-main min-w-[100px] text-center"
                >
                    Logout
                </Link>
            ) : (
                <Link
                    href="/pages/login"
                    className="h-full text-lg text-light hover:text-white px-4 py-2 hover:bg-light-main min-w-[100px] text-center"
                >
                    Login
                </Link>
            )}
        </nav>
    );
}