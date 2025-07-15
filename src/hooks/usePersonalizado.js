"use client";
import { useState, useEffect } from "react";
import personalizadoService from "../../services/personalizadoService";

export default function usePersonalizado() {
  const [records, setRecords] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [regs, tmps] = await Promise.all([
        personalizadoService.getRecords(),
        personalizadoService.getTemplates(),
      ]);
      setRecords(regs);
      setTemplates(tmps);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = () => setOpenModal(true);
  const handleClose  = () => setOpenModal(false);

  const handleSave = async (data) => {
    setLoading(true);
    try {
      await personalizadoService.createSingleSend(data);
      setOpenModal(false);
      await fetchAll();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (id) => {
    setLoading(true);
    try {
      await personalizadoService.sendSingle(id);
      await fetchAll();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
    const safePagination = {
    page: 1,
    pageSize: records.length || 5,
    total: records.length || 0
    };
    const safeSetPagination = () => {}; // no-op
  return {
    records, templates, loading, error,
    openModal, handleCreate, handleClose,
    handleSave, handleSend,
    pagination: safePagination,
    setPagination: safeSetPagination,
    sortModel: [],
    setSortModel: () => {}
  };
}
