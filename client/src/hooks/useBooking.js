import { useState } from "react";
import { API_URL, initialForm } from "../data/constants";

export default function useBooking() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBooking(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to book your trial class.");
      }

      setBooking(data.booking);
      setForm(initialForm); // reset so another class can be booked
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Unable to connect to the server. Please try again."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  function clearBooking() {
    setBooking(null);
    setError("");
  }

  return { form, loading, error, booking, handleChange, handleSubmit, clearBooking };
}
