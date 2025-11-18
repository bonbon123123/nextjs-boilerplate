import Link from "next/link";
import { SessionContext } from "../invisibleComponents/SessionProvider";
import { useContext } from "react";
export default function NavBar() {
  const session = useContext(SessionContext);

  return (
    <nav className="navbar bg-base-200 shadow-lg sticky top-0 z-50">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost normal-case text-xl">
          Specs
        </Link>
      </div>
      <div className="flex gap-2">
        <Link href="/pages/upload" className="btn btn-ghost">
          Upload
        </Link>
        <Link href="/pages/search" className="btn btn-ghost">
          Search
        </Link>
        {session?.userName && (
          <Link href="/pages/profile" className="btn btn-ghost">
            Profile
          </Link>
        )}
        {session?.userName ? (
          <Link
            href="/pages/login"
            onClick={session.logout}
            className="btn btn-primary"
          >
            Logout
          </Link>
        ) : (
          <Link href="/pages/login" className="btn btn-primary">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
