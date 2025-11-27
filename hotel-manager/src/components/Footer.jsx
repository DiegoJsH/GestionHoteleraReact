import React from "react";
import { FaHotel, FaHeart } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-100 mt-auto">
      <div className="d-flex justify-content-between align-items-center px-4">
        <p className="mb-0 small">
          <FaHotel className="me-2" />
          © {new Date().getFullYear()} <strong>HotelManager</strong>
        </p>
        <p className="mb-0 small">
          Hecho para la gestión hotelera
        </p>
      </div>
    </footer>
  );
}