import { Link } from "react-router-dom";

function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer-content">
        <p className="footer-copyright">
          © {currentYear} RehaSport Reader
        </p>
        <div className="footer-links">
          <Link to="/info" className="footer-link">
            Info
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
