"use client";

import { useState } from "react";

export default function FavoriteToggle({
  id,
  initialFavorite,
}: {
  id: string;
  initialFavorite: boolean;
}) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const next = !favorite;
    setFavorite(next);
    try {
      await fetch(`/api/brand/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: next }),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={favorite ? "btn-secondary border-secondary/40 !text-secondary" : "btn-secondary"}
    >
      {favorite ? "★ Favorited" : "☆ Add to favorites"}
    </button>
  );
}
