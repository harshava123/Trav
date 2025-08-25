export default function Header() {
  return (
    <header className="flex justify-between items-center bg-white shadow-md px-6 py-3">
      {/* Left */}
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold text-red-600">BALAJI LORRY SERVICE</h1>
        <a href="/stations" className="text-sm font-medium">STATION LIST WITH ADDRESS</a>
        <button className="px-3 py-1 bg-blue-100 rounded font-semibold">SEARCH BAR</button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6 text-sm">
        <span>AGENT:- PRAVEEN</span>
        <a href="/settings" className="hover:underline">SETTINGS</a>
        <a href="/" className="hover:underline">LOGOUT</a>
      </div>
    </header>
  );
}
