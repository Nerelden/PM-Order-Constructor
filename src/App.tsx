/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  ShieldAlert,
  Scale,
  PlusCircle,
  Search,
  Filter,
  FileDown,
  Trash2,
  Loader2,
  Archive,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  FolderArchive
} from 'lucide-react';
import { OrderContract, VisualTheme, ClientCategory, MAX_ORDERS_COUNT } from './types';
import { Header } from './components/Header';
import { OrderSheet } from './components/OrderSheet';
import { SignOrderModal } from './components/SignOrderModal';
import { EditOrderModal } from './components/EditOrderModal';
import { CreateOrderModal } from './components/CreateOrderModal';
import { ComparisonModal } from './components/ComparisonModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { ConfirmResetModal } from './components/ConfirmResetModal';
import { PdfExportModal } from './components/PdfExportModal';
import { AuthGate } from './components/AuthGate';
import { subscribeToAuth, logout } from './services/firebaseAuth';
import {
  subscribeToRealtimeOrders,
  syncOrderToFirestore,
  deleteOrderFromFirestore,
  clearAllOrdersFromFirestore
} from './services/firestoreOrders';

const LOCAL_STORAGE_KEY = 'city_order_sheets_data_v5';

export default function App() {
  const [orders, setOrders] = useState<OrderContract[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved orders from localStorage', e);
    }
    return [];
  });

  const [, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<VisualTheme>('parchment');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ClientCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'in_progress' | 'completed' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Expand / collapse all orders
  const [allExpanded, setAllExpanded] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(true);

  // Strict Email Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Modals
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [signingOrder, setSigningOrder] = useState<OrderContract | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderContract | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<OrderContract | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribe = subscribeToAuth((authedUser) => {
      setUser(authedUser);
      setIsAuthChecking(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 2. Real-time Firestore sync ONLY when authenticated
  useEffect(() => {
    if (!user) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    const unsubscribe = subscribeToRealtimeOrders(
      (remoteOrders) => {
        setOrders(remoteOrders);
        setIsLoading(false);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteOrders));
        } catch (e) {
          console.warn('Failed to cache orders to localStorage', e);
        }
      },
      (err) => {
        console.error('Realtime sync fallback:', err);
        setIsLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setOrders([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Change Status in real-time
  const handleStatusChange = async (
    orderId: string,
    newStatus: 'available' | 'in_progress' | 'completed' | 'failed'
  ) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;
    
    // When reverting to 'available', clear accepted status, fixer, and stamp
    const updated = {
      ...target,
      status: newStatus,
      ...(newStatus === 'available'
        ? {
            assignedFixer: '',
            assignedOffice: '',
            signedDate: '',
            stampText: '',
          }
        : {}),
      updatedAt: Date.now(),
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));

    try {
      await syncOrderToFirestore(updated);
    } catch (err) {
      console.error('Failed to sync status change:', err);
    }
  };

  // Restore/unarchive contract from archive without accepted status and without stamp
  const handleUnarchive = async (orderId: string) => {
    await handleStatusChange(orderId, 'available');
  };

  // Clear stamp and assigned fixer
  const handleClearStamp = async (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;
    const updated = {
      ...target,
      assignedFixer: '',
      assignedOffice: '',
      signedDate: '',
      stampText: '',
      updatedAt: Date.now(),
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));

    try {
      await syncOrderToFirestore(updated);
    } catch (err) {
      console.error('Failed to clear stamp:', err);
    }
  };

  // Sign Order with fixer, office and custom Acceptance Date in real-time
  const handleSignOrder = async (
    orderId: string,
    fixerName: string,
    officeName: string,
    stampText: string,
    signedDate: string
  ) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    const updated: OrderContract = {
      ...target,
      status: 'in_progress',
      assignedFixer: fixerName,
      assignedOffice: officeName,
      stampText,
      signedDate,
      updatedAt: Date.now(),
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));

    try {
      await syncOrderToFirestore(updated);
    } catch (err) {
      console.error('Failed to sync signed order:', err);
    }
  };

  // Save edited order in real-time
  const handleSaveEditedOrder = async (updated: OrderContract) => {
    const withTimestamp = { ...updated, updatedAt: Date.now() };
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? withTimestamp : o)));

    try {
      await syncOrderToFirestore(withTimestamp);
    } catch (err) {
      console.error('Failed to sync edited order:', err);
    }
  };

  // Add new order via constructor in real-time
  const handleAddOrder = async (newOrder: OrderContract) => {
    if (orders.length >= MAX_ORDERS_COUNT) {
      alert(`Достигнут максимальный лимит: ${MAX_ORDERS_COUNT} заказов в реестре.`);
      return;
    }

    const orderWithTime = { ...newOrder, updatedAt: Date.now() };
    setOrders((prev) => [orderWithTime, ...prev]);

    try {
      await syncOrderToFirestore(orderWithTime);
    } catch (err) {
      console.error('Failed to add order to Firestore:', err);
    }
  };

  // Delete order in real-time
  const handleConfirmDelete = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      await deleteOrderFromFirestore(orderId);
    } catch (err) {
      console.error('Failed to delete order from Firestore:', err);
    }
  };

  // Complete wipe of all contracts
  const handleConfirmReset = async () => {
    setOrders([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    try {
      await clearAllOrdersFromFirestore();
    } catch (err) {
      console.error('Failed to clear all orders from Firestore:', err);
    }
  };

  // Filter helper
  const matchesSearchAndCategory = (order: OrderContract) => {
    if (categoryFilter !== 'all' && order.clientCategory !== categoryFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = order.title.toLowerCase().includes(q);
      const matchCode = order.code.toLowerCase().includes(q);
      const matchClient = order.client.toLowerCase().includes(q);
      const matchObj = order.objective.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchClient && !matchObj) {
        return false;
      }
    }
    return true;
  };

  const filteredOrders = orders.filter(matchesSearchAndCategory);

  // Active orders (available & in_progress)
  const activeOrders = filteredOrders.filter(
    (o) => o.status === 'available' || o.status === 'in_progress'
  );

  // Archived orders (completed & failed)
  const archivedOrders = filteredOrders.filter(
    (o) => o.status === 'completed' || o.status === 'failed'
  );

  // Filtered views based on statusFilter
  const displayedActiveOrders = activeOrders.filter((o) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'available' || statusFilter === 'in_progress') {
      return o.status === statusFilter;
    }
    return false;
  });

  const displayedArchivedOrders = archivedOrders.filter((o) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'completed' || statusFilter === 'failed') {
      return o.status === statusFilter;
    }
    return false;
  });

  const totalCompletedCount = orders.filter((o) => o.status === 'completed').length;
  const totalFailedCount = orders.filter((o) => o.status === 'failed').length;

  // Initial Auth Check Spinner
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0c10] text-stone-300 space-y-3 font-mono">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <div className="text-xs text-stone-400">Проверка доступа к реестру Города...</div>
      </div>
    );
  }

  // Strict Gate: If not authenticated with Email, deny access completely
  if (!user) {
    return <AuthGate />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-stone-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        theme={theme}
        setTheme={setTheme}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
        ordersCount={orders.length}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Real-time Status & Control Bar */}
        <section className="no-print rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/40 border border-stone-800 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-cinzel text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
                АКТИВНЫЙ РЕЕСТР ЗАКАЗОВ
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                {orders.length} / {MAX_ORDERS_COUNT} СЛОТОВ
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>СИНХРОНИЗАЦИЯ: ОНЛАЙН</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 font-sans max-w-2xl">
              Единый реестр контрактов Города. Заказы раскрываются кликом для подробностей. Выполненные и проваленные дела автоматически архивируются внизу.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              disabled={orders.length >= MAX_ORDERS_COUNT}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all font-mono cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-stone-950" />
              <span>Создать заказ ({orders.length}/{MAX_ORDERS_COUNT})</span>
            </button>

            {/* Global Expand/Collapse Toggle */}
            <button
              onClick={() => setAllExpanded(!allExpanded)}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono flex items-center gap-1.5 border border-stone-700 transition-colors cursor-pointer"
              title={allExpanded ? 'Свернуть все заказы для компактности' : 'Развернуть все заказы'}
            >
              {allExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Свернуть все</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Развернуть все</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono flex items-center gap-1.5 border border-stone-700 transition-colors cursor-pointer"
              title="Экспорт в PDF (A4) или печать бланков"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Печать / PDF</span>
            </button>

            {orders.length >= 2 && (
              <button
                onClick={() => setIsComparisonOpen(true)}
                className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono flex items-center gap-1.5 border border-stone-700 transition-colors cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Сравнение</span>
              </button>
            )}

            {orders.length > 0 && (
              <button
                onClick={() => setIsResetModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-red-950/60 text-stone-400 hover:text-red-300 text-xs font-mono flex items-center gap-1.5 border border-stone-800 hover:border-red-800/60 transition-colors cursor-pointer"
                title="Очистить реестр и удалить все контракты"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Очистить все</span>
              </button>
            )}
          </div>
        </section>

        {/* Filter & Search Bar */}
        {orders.length > 0 && (
          <section className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-950/70 p-3 rounded-xl border border-stone-800/80 text-xs">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию, коду, заказчику или цели..."
                className="w-full pl-9 pr-3 py-1.5 bg-stone-900/90 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {/* Status filter with ALL types including 'failed' */}
            <div className="flex items-center gap-2">
              <span className="text-stone-500 font-mono text-[11px] flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Статус:
              </span>
              <div className="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800 text-xs font-mono">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-stone-800 text-amber-300 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setStatusFilter('available')}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    statusFilter === 'available'
                      ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/30'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Доступные
                </button>
                <button
                  onClick={() => setStatusFilter('in_progress')}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    statusFilter === 'in_progress'
                      ? 'bg-amber-950 text-amber-300 font-bold border border-amber-500/30'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  В работе
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    statusFilter === 'completed'
                      ? 'bg-blue-950 text-blue-300 font-bold border border-blue-500/30'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Выполненные
                </button>
                <button
                  onClick={() => setStatusFilter('failed')}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    statusFilter === 'failed'
                      ? 'bg-red-950 text-red-300 font-bold border border-red-500/40'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Проваленные
                </button>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 1: ACTIVE ORDERS BOARD */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="font-cinzel text-base font-bold text-stone-100 tracking-wide">
                ДЕЙСТВУЮЩИЕ ЛИСТЫ ЗАКАЗА
              </h2>
              <span className="text-xs font-mono text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                {displayedActiveOrders.length} активных
              </span>
            </div>

            <span className="text-[11px] font-mono text-stone-500 hidden sm:inline">
              Доступные к принятию и выполняемые контракты
            </span>
          </div>

          {/* Empty / Filtered States or Grid */}
          {orders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-stone-950/60 border border-stone-800 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-stone-900 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-cinzel text-base sm:text-lg font-bold text-stone-200">
                  В реестре нет активных заказов
                </h3>
                <p className="text-xs text-stone-400 font-mono-code mt-1 max-w-md mx-auto">
                  Реестр полностью чист. Вы можете создать новый заказ в конструкторе.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-colors font-mono cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-stone-950" />
                  <span>+ Создать заказ в конструкторе</span>
                </button>
              </div>
            </div>
          ) : displayedActiveOrders.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-stone-950/40 border border-stone-800/80 space-y-2">
              <p className="text-xs text-stone-400 font-mono-code">
                {statusFilter === 'completed' || statusFilter === 'failed'
                  ? 'Выбран фильтр архивных дел — просмотрите раздел архива внизу страницы.'
                  : 'Нет активных заказов, соответствующих текущему фильтру или поиску.'}
              </p>
              {statusFilter !== 'all' && (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="text-xs text-amber-400 hover:underline font-mono"
                >
                  Сбросить фильтр статуса
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7 transition-all">
              {displayedActiveOrders.map((order) => (
                <OrderSheet
                  key={order.id}
                  order={order}
                  theme={theme}
                  forceExpanded={allExpanded}
                  onSignClick={(o) => setSigningOrder(o)}
                  onEditClick={(o) => setEditingOrder(o)}
                  onDeleteClick={(id) => {
                    const target = orders.find((o) => o.id === id);
                    if (target) setDeletingOrder(target);
                  }}
                  onPrintClick={() => {
                    setEditingOrder(null);
                    setIsPdfModalOpen(true);
                  }}
                  onStatusChange={handleStatusChange}
                  onUnarchive={handleUnarchive}
                  onClearStamp={handleClearStamp}
                />
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: ARCHIVE FOR COMPLETED AND FAILED ORDERS (AT THE BOTTOM) */}
        <section className="pt-6 border-t-2 border-stone-800/80 space-y-4">
          <div className="rounded-2xl bg-gradient-to-r from-[#111318] via-stone-900 to-[#171212] border border-stone-800/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 flex-shrink-0">
                <FolderArchive className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-cinzel text-base font-bold text-stone-100 flex items-center gap-2">
                    АРХИВ ЗАКРЫТЫХ И ПРОВАЛЕННЫХ КОНТРАКТОВ
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                    {archivedOrders.length} дел
                  </span>
                </div>
                <p className="text-xs text-stone-400 font-sans mt-0.5">
                  Архивированные дела Города. При статусе «Провалено» заказ замыливается с красным штампом.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* Badges for completed vs failed */}
              <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded bg-blue-950/70 text-blue-300 border border-blue-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Выполнено: {totalCompletedCount}</span>
              </span>

              <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded bg-red-950/70 text-red-300 border border-red-500/30">
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                <span>Провалено: {totalFailedCount}</span>
              </span>

              <button
                onClick={() => setIsArchiveOpen(!isArchiveOpen)}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                title={isArchiveOpen ? 'Свернуть архив' : 'Развернуть архив'}
              >
                {isArchiveOpen ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
          </div>

          {/* Archived Orders Grid */}
          {isArchiveOpen && (
            <div className="animate-in fade-in duration-200">
              {archivedOrders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-stone-950/40 border border-stone-800/60 text-stone-500 font-mono text-xs space-y-1">
                  <Archive className="w-6 h-6 mx-auto text-stone-600 mb-1" />
                  <p>В архиве пока нет закрытых или проваленных дел.</p>
                  <p className="text-[11px] text-stone-600">
                    Когда контракт переводится в статус «Выполнен» или «Провалено», он автоматически переходит в данный архив.
                  </p>
                </div>
              ) : displayedArchivedOrders.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-stone-950/40 border border-stone-800 text-stone-400 font-mono text-xs">
                  Нет архивных дел, соответствующих фильтру.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7">
                  {displayedArchivedOrders.map((order) => (
                    <OrderSheet
                      key={order.id}
                      order={order}
                      theme={theme}
                      forceExpanded={allExpanded}
                      onSignClick={(o) => setSigningOrder(o)}
                      onEditClick={(o) => setEditingOrder(o)}
                      onDeleteClick={(id) => {
                        const target = orders.find((o) => o.id === id);
                        if (target) setDeletingOrder(target);
                      }}
                      onPrintClick={() => {
                        setEditingOrder(null);
                        setIsPdfModalOpen(true);
                      }}
                      onStatusChange={handleStatusChange}
                      onUnarchive={handleUnarchive}
                      onClearStamp={handleClearStamp}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-stone-800/80 bg-[#090b0e] py-6 text-center text-xs text-stone-500 font-mono-code">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span>БЮРО КОНТРАКТОВ ГОРОДА • ЗАКРЫТЫЙ РЕЕСТР НАДЗОРА</span>
          </div>
          <div className="flex items-center gap-4 text-stone-400 text-[11px]">
            <span>Слоты: {orders.length} / {MAX_ORDERS_COUNT}</span>
            <span>•</span>
            <span>Синхронизация Firestore</span>
            <span>•</span>
            <span>Архив дел</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentCount={orders.length}
        onAddOrder={handleAddOrder}
      />

      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        orders={orders}
        theme={theme}
      />

      <SignOrderModal
        order={signingOrder}
        isOpen={!!signingOrder}
        onClose={() => setSigningOrder(null)}
        onSign={handleSignOrder}
      />

      <EditOrderModal
        order={editingOrder}
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onSave={handleSaveEditedOrder}
      />

      <ConfirmDeleteModal
        order={deletingOrder}
        isOpen={!!deletingOrder}
        onClose={() => setDeletingOrder(null)}
        onConfirm={handleConfirmDelete}
      />

      <ConfirmResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
      />

      <ComparisonModal
        orders={orders}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        onSelectOrder={() => {}}
      />
    </div>
  );
}
