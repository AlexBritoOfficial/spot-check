"use client";
import { useState } from "react";

import styles from "./SpotCheckNav.module.css";
import HamburgerButton from "../button/hamburgerbutton/HamburgerButton.component";
import SearchBox from "../searchbox/SearchBox.component";
import Button from "../button/Button.component";
import SideMenu from "../sidemenu/SideMenu";
import CreateAccountModal from "../sidemenu/CreateAccountModal";

export default function SpotCheckNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  function openSignUp() {
    setShowSignUp(true);
    setMenuOpen(false);
  }

  function backToSignIn() {
    setShowSignUp(false);
    setMenuOpen(true);
  }

  function completeSignUp() {
    setShowSignUp(false);
    setSignedIn(true);
  }

  function signOut() {
    setSignedIn(false);
    setMenuOpen(false);
  }

  return (
    <>
      <nav className={styles.div}>
        <div className={styles.leftGroup}>
          <HamburgerButton onClick={() => setMenuOpen(true)} />
          <div className={styles.title}>
            <span className={styles.white}>SPOT</span>
            <span className={styles.gold}>CHECK</span>
          </div>
          <SearchBox />
        </div>
        <Button label="+ Add Spot" variant="primary" />
      </nav>

      <SideMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        signedIn={signedIn}
        onSignIn={() => setSignedIn(true)}
        onSignOut={signOut}
        onOpenSignUp={openSignUp}
      />

      <CreateAccountModal
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onBackToSignIn={backToSignIn}
        onCreateAccount={completeSignUp}
      />

      {menuOpen && (
        <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
}
