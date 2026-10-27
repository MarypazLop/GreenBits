/* ==========================================================================
   GreenBits — Local store (simulated backend)
   The demo has no server. Reservations and lots published by the user are
   saved in the browser's localStorage so they survive page reloads.
   Swap these functions for real API calls (fetch) when the backend exists.
   ========================================================================== */
window.GB = window.GB || {};

(function (GB) {
  "use strict";

  const KEYS = {
    reservations: "gb.reservations",
    userLots: "gb.userLots",
  };

  /** Reads JSON safely (localStorage can be blocked in private mode) */
  const read = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  };

  const write = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* Storage unavailable: the demo still works for the current page view */
    }
  };

  /** Simple event bus so components can react to data changes */
  const listeners = new Set();
  const notify = () => listeners.forEach((fn) => fn());
  const subscribe = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };

  // ---------- Reservations ----------
  const getReservations = () => read(KEYS.reservations, []);

  const addReservation = (reservation) => {
    const list = [reservation, ...getReservations()];
    write(KEYS.reservations, list);
    notify();
    return reservation;
  };

  /** Simulates the producer accepting a reservation after a few seconds */
  const confirmReservation = (code) => {
    const list = getReservations().map((r) => (r.code === code ? { ...r, status: "confirmed" } : r));
    write(KEYS.reservations, list);
    notify();
  };

  // ---------- Lots published from "Publicar" ----------
  const getUserLots = () => read(KEYS.userLots, []);

  const addUserLot = (lot) => {
    write(KEYS.userLots, [lot, ...getUserLots()]);
    notify();
    return lot;
  };

  /** All lots = sample data + lots published by this visitor */
  const getAllLots = () => [...getUserLots(), ...GB.data.lots];

  const getLotById = (id) => getAllLots().find((lot) => lot.id === id);

  /** Clears everything the demo saved (useful before presenting) */
  const reset = () => {
    Object.values(KEYS).forEach((key) => {
      try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
    });
    notify();
  };

  GB.store = {
    subscribe,
    getReservations,
    addReservation,
    confirmReservation,
    getUserLots,
    addUserLot,
    getAllLots,
    getLotById,
    reset,
  };
})(window.GB);
