const Layout = ({ children }) => (
  <div className="min-h-screen bg-slate-900 text-white font-sans">
    <header className="p-4 bg-blue-800 text-white flex justify-between items-center shadow-md">
      <h1 className="text-2xl font-bold">Location Tracker</h1>
    </header>
    <main className="p-4">{children}</main>
  </div>
);

export default Layout;
