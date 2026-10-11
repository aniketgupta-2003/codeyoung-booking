import { useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import BookingForm from "./components/BookingForm";
import SuccessCard from "./components/SuccessCard";
import Footer from "./components/Footer";
import useBooking from "./hooks/useBooking";

function App() {
  const {
    form,
    loading,
    error,
    booking,
    handleChange,
    handleSubmit,
    clearBooking,
  } = useBooking();

  const nameInputRef = useRef(null);

  // Load Inter from Google Fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  function handleBookAnother() {
    clearBooking();
    nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    nameInputRef.current?.focus({ preventScroll: true });
  }

  return (
    <div
      id="home"
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-slate-800 antialiased"
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
    >
      <Navbar />

      <main className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-6 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:px-8 lg:pt-10">
        <Hero />

        <section id="book" className="min-w-0 space-y-5 lg:pt-2">
          <BookingForm
            form={form}
            loading={loading}
            error={error}
            onChange={handleChange}
            onSubmit={handleSubmit}
            nameInputRef={nameInputRef}
          />

          {booking && (
            <SuccessCard booking={booking} onBookAnother={handleBookAnother} />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
