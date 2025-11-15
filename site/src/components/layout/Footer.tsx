function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container site-footer__inner">
        <p>© {currentYear} RehaSport Reader. Bereit für klare Stundenabläufe.</p>
        <div className="site-footer__links">
          <a className="site-footer__link" href="#">Impressum</a>
          <a className="site-footer__link" href="#">Datenschutz</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
