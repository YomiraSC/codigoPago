"use client";

import { useState, useEffect } from "react";
import { getPromesasPago } from "../../services/promesasPagoService";

const usePromesasPago = () => {
  const [promesas, setPromesas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPromesasPago = async () => {
    setLoading(true);
    try {
      const data = await getPromesasPago();
      setPromesas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromesasPago();
  }, []);

  return { promesas, loading, error, fetchPromesasPago };
};

export default usePromesasPago;
