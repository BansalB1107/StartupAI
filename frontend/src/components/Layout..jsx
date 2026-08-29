import Navbar from "./Navbar";

// Provides a persistent global layout wrapper integrating the primary navigation bar across application routes.
export default function Layout({ children }) {
  return (
    <>
      <Navbar />

      <main
        style={{
          background: "var(--bg)",
          minHeight: "100vh",
          padding: "90px 30px 30px",
          color: "var(--text)",
        }}
      >
        {children}
      </main>
    </>
  );
}