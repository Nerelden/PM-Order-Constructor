/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  ShieldAlert,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Loader2,
  Archive,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  FolderArchive,
  Building2,
  Users2,
  Briefcase,
  UserCheck,
  RotateCcw,
  Layers
} from 'lucide-react';
import {
  OrderContract,
  VisualTheme,
  ClientCategory,
  CityDate,
  DEFAULT_CITY_DATE,
  normalizeCityDate
} from './types';
import { Header } from './components/Header';
import { OrderSheet } from './components/OrderSheet';
import { SignOrderModal } from './components/SignOrderModal';
import { EditOrderModal } from './components/EditOrderModal';
import { CreateOrderModal } from './components/CreateOrderModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { ConfirmResetModal } from './components/ConfirmResetModal';
import { CityDateModal } from './components/CityDateModal';
import { AuthGate } from './components/AuthGate';
import { subscribeToAuth, logout, isGuestUser } from './services/firebaseAuth';
import {
  subscribeToRealtimeOrders,
  syncOrderToFirestore,
  deleteOrderFromFirestore,
  clearAllOrdersFromFirestore,
  subscribeToCityDate,
  saveCityDateToFirestore
} from './services/firestoreOrders';

const LOCAL_STORAGE_KEY = 'city_order_sheets_data_v5';
const CITY_DATE_STORAGE_KEY = 'city_order_sheets_city_date_v1';

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

  // Archive accordion & centered detail modal
  const [isArchiveOpen, setIsArchiveOpen] = useState(true);
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);

  // Strict Email Auth State
  const [user, setUser] = useState<User | null>(null);
  const isGuest = isGuestUser(user);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [cityDate, setCityDate] = useState<CityDate>(() => {
    try {
      const savedDate = localStorage.getItem(CITY_DATE_STORAGE_KEY);
      if (savedDate) {
        return normalizeCityDate(JSON.parse(savedDate));
      }
    } catch (e) {
      console.warn('Failed to parse saved city date from localStorage', e);
    }
    return DEFAULT_CITY_DATE;
  });

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCityDateModalOpen, setIsCityDateModalOpen] = useState(false);
  const [signingOrder, setSigningOrder] = useState<OrderContract | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderContract | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<OrderContract | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Track viewport size for responsive 3-column grid (3 cols >= 1024px, 2 cols >= 640px, 1 col on mobile)
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  };
  const [colCount, setColCount] = useState<number>(getColumnCount);

  useEffect(() => {
    const handleResize = () => {
      setColCount(getColumnCount());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

    const unsubscribeDate = subscribeToCityDate(
      (remoteDate) => {
        setCityDate(remoteDate);
        try {
          localStorage.setItem(CITY_DATE_STORAGE_KEY, JSON.stringify(remoteDate));
        } catch (e) {
          console.warn('Failed to cache city date to localStorage', e);
        }
      },
      (err) => {
        console.error('City date sync fallback:', err);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
      if (unsubscribeDate) unsubscribeDate();
    };
  }, [user]);

  const handleSaveCityDate = async (newDate: CityDate) => {
    if (isGuest) return;
    const saved = await saveCityDateToFirestore(newDate);
    setCityDate(saved);
    try {
      localStorage.setItem(CITY_DATE_STORAGE_KEY, JSON.stringify(saved));
    } catch (e) {
      console.warn('Failed to cache city date to localStorage', e);
    }
  };

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
    if (isGuest) return;
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
    if (isGuest) return;
    await handleStatusChange(orderId, 'available');
  };

  // Clear stamp and assigned fixer
  const handleClearStamp = async (orderId: string) => {
    if (isGuest) return;
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
    if (isGuest) return;
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
    if (isGuest) return;
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
    if (isGuest) return;

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
    if (isGuest) return;
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      await deleteOrderFromFirestore(orderId);
    } catch (err) {
      console.error('Failed to delete order from Firestore:', err);
    }
  };

  // Complete wipe of all contracts
  const handleConfirmReset = async () => {
    if (isGuest) return;
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
  const viewingOrder = orders.find((o) => o.id === viewingOrderId) || null;

  // Render orders in a responsive 3-column masonry grid with compact cards
  const renderOrdersGrid = (ordersToRender: OrderContract[]) => {
    const renderCard = (order: OrderContract) => (
      <OrderSheet
        key={order.id}
        order={order}
        theme={theme}
        isReadOnly={isGuest}
        onOpenDetail={(o) => setViewingOrderId(o.id)}
        onSignClick={(o) => {
          if (isGuest) return;
          setSigningOrder(o);
        }}
        onEditClick={(o) => {
          if (isGuest) return;
          setEditingOrder(o);
        }}
        onDeleteClick={(id) => {
          if (isGuest) return;
          const target = orders.find((ord) => ord.id === id);
          if (target) setDeletingOrder(target);
        }}
        onStatusChange={handleStatusChange}
        onUnarchive={handleUnarchive}
      />
    );

    if (colCount <= 1 || ordersToRender.length <= 1) {
      return (
        <div className="flex flex-col gap-4 transition-all">
          {ordersToRender.map(renderCard)}
        </div>
      );
    }

    const columns: OrderContract[][] = Array.from({ length: colCount }, () => []);
    ordersToRender.forEach((order, idx) => {
      columns[idx % colCount].push(order);
    });

    const gridColsClass = colCount === 3 ? 'grid-cols-3' : 'grid-cols-2';

    return (
      <div className={`grid ${gridColsClass} gap-4 items-start transition-all`}>
        {columns.map((colOrders, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-4 min-w-0">
            {colOrders.map(renderCard)}
          </div>
        ))}
      </div>
    );
  };

  // Initial Auth Check Spinner
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0c10] text-stone-300 space-y-3 font-mono">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <div className="text-sm text-stone-400">Проверка доступа к реестру Города...</div>
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
        cityDate={cityDate}
        onOpenCityDateModal={() => {
          if (isGuest) return;
          setIsCityDateModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
        {/* Real-time Status & Control Bar */}
        <section className="no-print rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/40 border border-stone-800 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 shadow-lg">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-cinzel text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
                АКТИВНЫЙ РЕЕСТР ЗАКАЗОВ
              </h2>
              {isGuest && (
                <span className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>РЕЖИМ ГОСТЯ (ТОЛЬКО ЧТЕНИЕ)</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-[13px] text-stone-300/90 font-sans max-w-3xl leading-relaxed">
              Единый реестр контрактов Города. Нажмите на любую карточку, чтобы открыть полный бланк заказа по центру экрана.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                if (isGuest) return;
                setIsCreateModalOpen(true);
              }}
              disabled={isGuest}
              title={
                isGuest
                  ? 'Создание заказов недоступно в гостевом режиме (только чтение)'
                  : 'Создать новый заказ в конструкторе'
              }
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg font-mono transition-all ${
                isGuest
                  ? 'bg-stone-800/80 text-stone-500 border border-stone-700/50 cursor-not-allowed opacity-60'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-950/40 cursor-pointer'
              }`}
            >
              <PlusCircle className={`w-4 h-4 ${isGuest ? 'text-stone-500' : 'text-stone-950'}`} />
              <span>Создать заказ</span>
            </button>

            {!isGuest && orders.length > 0 && (
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

        {/* Unified Search, Category & Status Filter Bar */}
        {orders.length > 0 && (
          <section className="no-print bg-stone-950/75 p-4 sm:p-5 rounded-2xl border border-stone-800/90 space-y-3.5 shadow-md text-xs sm:text-sm">
            {/* Top row: Search + Reset */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по названию, коду, заказчику или цели..."
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-900/90 border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {(categoryFilter !== 'all' || statusFilter !== 'all' || searchQuery.trim() !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter('all');
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/30 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Сбросить фильтры</span>
                </button>
              )}
            </div>

            {/* Bottom row: Category & Status filters */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-1 border-t border-stone-800/70">
              {/* Category filter */}
              <div className="flex items-center gap-2.5 flex-wrap pt-2 xl:pt-0">
                <span className="text-stone-400 font-mono text-xs flex items-center gap-1.5 flex-shrink-0">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Категория:
                </span>
                <div className="flex flex-wrap items-center bg-stone-900 rounded-xl p-1 border border-stone-800 text-xs font-mono gap-1">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                      categoryFilter === 'all'
                        ? 'bg-amber-600/30 text-amber-200 border border-amber-500/40 font-bold'
                        : 'text-stone-400 hover:text-stone-200 border border-transparent'
                    }`}
                  >
                    Все
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('association')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                      categoryFilter === 'association'
                        ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/40 font-bold'
                        : 'text-stone-400 hover:text-stone-200 border border-transparent'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ассоциации</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('syndicate')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                      categoryFilter === 'syndicate'
                        ? 'bg-red-950 text-red-200 border border-red-500/40 font-bold'
                        : 'text-stone-400 hover:text-stone-200 border border-transparent'
                    }`}
                  >
                    <Users2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Синдикаты</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('office')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                      categoryFilter === 'office'
                        ? 'bg-emerald-950 text-emerald-200 border border-emerald-500/40 font-bold'
                        : 'text-stone-400 hover:text-stone-200 border border-transparent'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Офисы</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('individual')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                      categoryFilter === 'individual'
                        ? 'bg-purple-950 text-purple-200 border border-purple-500/40 font-bold'
                        : 'text-stone-400 hover:text-stone-200 border border-transparent'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>Частные</span>
                  </button>
                </div>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-stone-400 font-mono text-xs flex items-center gap-1.5 flex-shrink-0">
                  <Filter className="w-3.5 h-3.5 text-amber-400" />
                  Статус:
                </span>
                <div className="flex flex-wrap items-center bg-stone-900 rounded-xl p-1 border border-stone-800 text-xs font-mono gap-1">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                      statusFilter === 'all'
                        ? 'bg-stone-800 text-amber-300 font-bold border border-stone-700'
                        : 'text-stone-400 hover:text-stone-200 border border-transparent'
                    }`}
                  >
                    Все
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('available')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                      statusFilter === 'available'
                        ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/30'
                        : 'text-stone-400 hover:text-stone-200 border border-transparent'
                    }`}
                  >
                    Доступные
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('in_progress')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                      statusFilter === 'in_progress'
                        ? 'bg-amber-950 text-amber-300 font-bold border border-amber-500/30'
                        : 'text-stone-400 hover:text-stone-200 border border-transparent'
                    }`}
                  >
                    В работе
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('completed')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                      statusFilter === 'completed'
                        ? 'bg-blue-950 text-blue-300 font-bold border border-blue-500/30'
                        : 'text-stone-400 hover:text-stone-200 border border-transparent'
                    }`}
                  >
                    Выполненные
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('failed')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                      statusFilter === 'failed'
                        ? 'bg-red-950 text-red-300 font-bold border border-red-500/40'
                        : 'text-stone-400 hover:text-stone-200 border border-transparent'
                    }`}
                  >
                    Проваленные
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 1: ACTIVE ORDERS BOARD */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="font-cinzel text-base sm:text-lg font-bold text-stone-100 tracking-wide">
                ДЕЙСТВУЮЩИЕ ЛИСТЫ ЗАКАЗА
              </h2>
            </div>

            <span className="text-xs font-mono text-stone-400 hidden sm:inline">
              Доступные к принятию и выполняемые контракты
            </span>
          </div>

          {/* Empty / Filtered States or Grid */}
          {orders.length === 0 ? (
            <div className="p-14 text-center rounded-2xl bg-stone-950/60 border border-stone-800 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-stone-900 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-cinzel text-lg sm:text-xl font-bold text-stone-200">
                  В реестре нет активных заказов
                </h3>
                <p className="text-sm text-stone-400 font-mono-code mt-1.5 max-w-lg mx-auto">
                  {isGuest
                    ? 'Реестр полностью чист. В гостевом режиме доступно только чтение.'
                    : 'Реестр полностью чист. Вы можете создать новый заказ в конструкторе.'}
                </p>
              </div>
              {!isGuest && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-colors font-mono cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-stone-950" />
                    <span>+ Создать заказ в конструкторе</span>
                  </button>
                </div>
              )}
            </div>
          ) : displayedActiveOrders.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-stone-950/40 border border-stone-800/80 space-y-2.5">
              <p className="text-sm text-stone-300 font-mono-code">
                {statusFilter === 'completed' || statusFilter === 'failed'
                  ? 'Выбран фильтр архивных дел — просмотрите раздел архива внизу страницы.'
                  : 'Нет активных заказов, соответствующих текущему фильтру или поиску.'}
              </p>
              {statusFilter !== 'all' && (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="text-sm text-amber-400 hover:underline font-mono cursor-pointer"
                >
                  Сбросить фильтр статуса
                </button>
              )}
            </div>
          ) : (
            renderOrdersGrid(displayedActiveOrders)
          )}
        </section>

        {/* SECTION 2: ARCHIVE FOR COMPLETED AND FAILED ORDERS (AT THE BOTTOM) */}
        <section className="pt-7 border-t-2 border-stone-800/80">
          <div className="rounded-2xl bg-gradient-to-r from-[#111318] via-stone-900 to-[#171212] border border-stone-800/90 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 flex-shrink-0">
                <FolderArchive className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-cinzel text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
                    АРХИВ ЗАКРЫТЫХ И ПРОВАЛЕННЫХ КОНТРАКТОВ
                  </h3>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-stone-800 text-stone-200 border border-stone-700">
                    {archivedOrders.length} дел
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-400 font-sans mt-1">
                  Архивированные дела Города. При статусе «Провалено» заказ замыливается с красным штампом.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
              {/* Badges for completed vs failed */}
              <span className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-blue-950/70 text-blue-300 border border-blue-500/30">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Выполнено: {totalCompletedCount}</span>
              </span>

              <span className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-red-950/70 text-red-300 border border-red-500/30">
                <XCircle className="w-4 h-4 text-red-400" />
                <span>Провалено: {totalFailedCount}</span>
              </span>

              <button
                onClick={() => setIsArchiveOpen(!isArchiveOpen)}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                title={isArchiveOpen ? 'Свернуть архив' : 'Развернуть архив'}
              >
                {isArchiveOpen ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
          </div>

          {/* Archived Orders Grid (Smooth bidirectional open & close) */}
          <div className={`collapse-grid ${isArchiveOpen ? 'is-open' : ''}`} aria-hidden={!isArchiveOpen}>
            <div className={`collapse-inner ${!isArchiveOpen ? 'pointer-events-none' : ''}`}>
              <div className="pt-5">
                {archivedOrders.length === 0 ? (
                  <div className="p-10 text-center rounded-2xl bg-stone-950/40 border border-stone-800/60 text-stone-400 font-mono text-sm space-y-1.5">
                    <Archive className="w-7 h-7 mx-auto text-stone-600 mb-1.5" />
                    <p>В архиве пока нет закрытых или проваленных дел.</p>
                    <p className="text-xs text-stone-500">
                      Когда контракт переводится в статус «Выполнен» или «Провалено», он автоматически переходит в данный архив.
                    </p>
                  </div>
                ) : displayedArchivedOrders.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-stone-950/40 border border-stone-800 text-stone-400 font-mono text-sm">
                    Нет архивных дел, соответствующих фильтру.
                  </div>
                ) : (
                  renderOrdersGrid(displayedArchivedOrders)
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-stone-800/80 bg-[#090b0e] py-5 text-center text-xs text-stone-400 font-mono-code">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div>
            <span>БЮРО КОНТРАКТОВ ГОРОДА • ЗАКРЫТЫЙ РЕЕСТР НАДЗОРА</span>
          </div>
          <div className="flex items-center gap-4 text-stone-400 text-xs">
            <span>Синхронизация Firestore</span>
            <span>•</span>
            <span>Архив дел</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <OrderDetailModal
        order={viewingOrder}
        theme={theme}
        isOpen={!!viewingOrder}
        hasNestedModalOpen={Boolean(signingOrder || editingOrder || deletingOrder || isCityDateModalOpen)}
        isReadOnly={isGuest}
        onClose={() => setViewingOrderId(null)}
        onSignClick={(o) => {
          if (isGuest) return;
          setSigningOrder(o);
        }}
        onEditClick={(o) => {
          if (isGuest) return;
          setEditingOrder(o);
        }}
        onDeleteClick={(id) => {
          if (isGuest) return;
          const target = orders.find((ord) => ord.id === id);
          if (target) setDeletingOrder(target);
        }}
        onStatusChange={handleStatusChange}
        onUnarchive={handleUnarchive}
        onClearStamp={handleClearStamp}
      />

      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddOrder={handleAddOrder}
      />

      <CityDateModal
        isOpen={isCityDateModalOpen}
        cityDate={cityDate}
        onClose={() => setIsCityDateModalOpen(false)}
        onSave={handleSaveCityDate}
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
    </div>
  );
}
