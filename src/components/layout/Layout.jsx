import React from 'react'
import Header from '../header/Header'
import Footer from '../footer/Footer'
import Routers from '../routers/Routers'
import { BrowserRouter as Router, useLocation } from 'react-router-dom'

function LayoutContent() {
  const location = useLocation();

  // Paths where Header & Footer should be hidden
  const hideHeaderFooter = location.pathname === "/";

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <Routers />
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

function Layout() {
  return (
    <Router>
      <LayoutContent />
    </Router>
  )
}

export default Layout
