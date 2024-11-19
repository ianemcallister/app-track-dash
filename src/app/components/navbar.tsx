import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <Link href="/">
            <a>App Tracker</a>
          </Link>
        </div>
        <div className="menu">
          <Link href="/job-description">
            <a className="menu-item">Job Description</a>
          </Link>
          <Link href="/feeds">
            <a className="menu-item">Feeds</a>
          </Link>
        </div>
      </div>
      <style jsx>{`
        .navbar {
          background-color: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          padding: 10px 20px;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .logo a {
          font-size: 1.5rem;
          font-weight: bold;
          color: #007bff;
          text-decoration: none;
        }

        .menu {
          display: flex;
          gap: 15px;
        }

        .menu-item {
          font-size: 1rem;
          color: #343a40;
          text-decoration: none;
          transition: color 0.2s;
        }

        .menu-item:hover {
          color: #007bff;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
