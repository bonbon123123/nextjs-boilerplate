import Link from "next/link";

export default function NavBar() {
    return (
        <nav className="flex space-x-4 p-4 bg-gray-200">
            <Link href="/pages/upload" className="text-blue-600 hover:text-blue-800">Upload
            </Link>
            <Link href="/pages/search" className="text-blue-600 hover:text-blue-800">Search
            </Link>
        </nav>
    );
}
