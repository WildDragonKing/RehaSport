import { Outlet } from "react-router-dom";

import Footer from "./Footer";
import Header from "./Header";

function PageLayout(): JSX.Element {
  return (
    <div className="page-layout">
      <a className="skip-link" href="#hauptinhalt">
        Zum Inhalt springen
      </a>
      <Header />
      <main id="hauptinhalt">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PageLayout;
