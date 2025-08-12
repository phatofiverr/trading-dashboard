import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface CustomInstrument {
  id: string;
  symbol: string;
  name: string;
  isFavorite: boolean;
  isCustom: boolean;
  createdAt: Date;
}

interface InstrumentStore {
  instruments: CustomInstrument[];
  favoriteInstruments: string[];
  userId: string | null;
  isLoading: boolean;
  
  // Actions
  addCustomInstrument: (symbol: string, name?: string) => Promise<void>;
  removeInstrument: (id: string) => Promise<void>;
  toggleFavorite: (symbol: string) => Promise<void>;
  getFavoriteInstruments: () => CustomInstrument[];
  getAllInstruments: () => CustomInstrument[];
  getInstrumentBySymbol: (symbol: string) => CustomInstrument | undefined;
  
  // Firebase sync methods
  setUserId: (userId: string | null) => void;
  syncWithFirestore: () => Promise<void>;
  saveToFirestore: () => Promise<void>;
  initializeDefaultInstruments: () => void;
  mergeNewDefaults: () => Promise<void>;
}

// Default instruments from the existing constants
const defaultInstruments: Omit<CustomInstrument, 'id' | 'createdAt'>[] = [
  // Major Currency Pairs
  { symbol: 'EURUSD', name: 'EUR/USD', isFavorite: false, isCustom: false },
  { symbol: 'GBPUSD', name: 'GBP/USD', isFavorite: false, isCustom: false },
  { symbol: 'USDJPY', name: 'USD/JPY', isFavorite: false, isCustom: false },
  { symbol: 'AUDUSD', name: 'AUD/USD', isFavorite: false, isCustom: false },
  { symbol: 'USDCAD', name: 'USD/CAD', isFavorite: false, isCustom: false },
  { symbol: 'NZDUSD', name: 'NZD/USD', isFavorite: false, isCustom: false },
  { symbol: 'USDCHF', name: 'USD/CHF', isFavorite: false, isCustom: false },
  { symbol: 'EURGBP', name: 'EUR/GBP', isFavorite: false, isCustom: false },
  { symbol: 'EURJPY', name: 'EUR/JPY', isFavorite: false, isCustom: false },
  { symbol: 'GBPJPY', name: 'GBP/JPY', isFavorite: false, isCustom: false },

  // Major Indices
  { symbol: 'DAX40', name: 'DAX 40 (GER40)', isFavorite: false, isCustom: false },
  { symbol: 'SP500', name: 'S&P 500 (US500)', isFavorite: false, isCustom: false },
  { symbol: 'NAS100', name: 'NASDAQ 100 (US100)', isFavorite: false, isCustom: false },
  { symbol: 'DJI', name: 'Dow Jones Industrial Average (US30)', isFavorite: false, isCustom: false },
  { symbol: 'FTSE100', name: 'FTSE 100 (UK100)', isFavorite: false, isCustom: false },
  { symbol: 'NIKKEI225', name: 'Nikkei 225 (JP225)', isFavorite: false, isCustom: false },
  { symbol: 'HANGSENG', name: 'Hang Seng (HK50)', isFavorite: false, isCustom: false },

  // Major Commodities
  { symbol: 'XAUUSD', name: 'Gold (XAU/USD)', isFavorite: false, isCustom: false },
  { symbol: 'XAGUSD', name: 'Silver (XAG/USD)', isFavorite: false, isCustom: false },
  { symbol: 'WTI', name: 'Crude Oil WTI (USOIL)', isFavorite: false, isCustom: false },
  { symbol: 'BRENT', name: 'Brent Oil (UKOIL)', isFavorite: false, isCustom: false },
  { symbol: 'NGAS', name: 'Natural Gas (NGAS)', isFavorite: false, isCustom: false },
];


export const useInstrumentStore = create<InstrumentStore>()(
  persist(
    (set, get) => ({
      instruments: [],
      favoriteInstruments: [],
      userId: null,
      isLoading: false,

      setUserId: (userId: string | null) => {
        set({ userId });
        if (userId) {
          get().syncWithFirestore();
        }
      },

      syncWithFirestore: async () => {
        const { userId } = get();
        console.log('syncWithFirestore called with userId:', userId);
        if (!userId) return;

        set({ isLoading: true });
        
        try {
          const userInstrumentsRef = doc(db, 'users', userId, 'preferences', 'instruments');
          const docSnap = await getDoc(userInstrumentsRef);
          
          console.log('Firestore document exists:', docSnap.exists());
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('Firestore data:', data);
            const instruments = (data.instruments || []).map((inst: any) => ({
              ...inst,
              createdAt: inst.createdAt instanceof Date ? inst.createdAt : new Date(inst.createdAt),
            }));
            
            console.log('Setting instruments from Firestore:', instruments.length);
            set({
              instruments,
              favoriteInstruments: data.favoriteInstruments || [],
            });
            
            // Merge any new default instruments that weren't in Firestore
            await get().mergeNewDefaults();
          } else {
            console.log('No Firestore document found, initializing defaults');
            // Initialize with default instruments for new users
            get().initializeDefaultInstruments();
            await get().saveToFirestore();
          }
        } catch (error) {
          console.error('Error syncing with Firestore:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      saveToFirestore: async () => {
        const { userId, instruments, favoriteInstruments } = get();
        if (!userId) return;

        try {
          const userInstrumentsRef = doc(db, 'users', userId, 'preferences', 'instruments');
          await setDoc(userInstrumentsRef, {
            instruments: instruments.map(inst => ({
              ...inst,
              createdAt: inst.createdAt instanceof Date ? inst.createdAt.toISOString() : inst.createdAt,
            })),
            favoriteInstruments,
            updatedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error saving to Firestore:', error);
        }
      },

      addCustomInstrument: async (symbol: string, name?: string) => {
        const normalizedSymbol = symbol.toUpperCase().trim();
        const existingInstrument = get().getInstrumentBySymbol(normalizedSymbol);
        
        if (existingInstrument) {
          return;
        }

        const newInstrument: CustomInstrument = {
          id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          symbol: normalizedSymbol,
          name: name || normalizedSymbol,
          isFavorite: false,
          isCustom: true,
          createdAt: new Date(),
        };

        set((state) => ({
          instruments: [...state.instruments, newInstrument],
        }));

        await get().saveToFirestore();
      },

      removeInstrument: async (id: string) => {
        set((state) => ({
          instruments: state.instruments.filter((instrument) => instrument.id !== id),
          favoriteInstruments: state.favoriteInstruments.filter((symbol) => {
            const instrument = state.instruments.find((inst) => inst.id === id);
            return instrument ? symbol !== instrument.symbol : true;
          }),
        }));

        await get().saveToFirestore();
      },

      toggleFavorite: async (symbol: string) => {
        const normalizedSymbol = symbol.toUpperCase();
        
        set((state) => {
          const isFavorite = state.favoriteInstruments.includes(normalizedSymbol);
          const updatedFavorites = isFavorite
            ? state.favoriteInstruments.filter((fav) => fav !== normalizedSymbol)
            : [...state.favoriteInstruments, normalizedSymbol];

          return {
            favoriteInstruments: updatedFavorites,
            instruments: state.instruments.map((instrument) =>
              instrument.symbol === normalizedSymbol
                ? { ...instrument, isFavorite: !isFavorite }
                : instrument
            ),
          };
        });

        await get().saveToFirestore();
      },

      getFavoriteInstruments: () => {
        const state = get();
        return state.instruments.filter((instrument) => 
          state.favoriteInstruments.includes(instrument.symbol)
        );
      },

      getAllInstruments: () => {
        return get().instruments;
      },

      getInstrumentBySymbol: (symbol: string) => {
        const normalizedSymbol = symbol.toUpperCase();
        return get().instruments.find((instrument) => 
          instrument.symbol === normalizedSymbol
        );
      },

      initializeDefaultInstruments: () => {
        const state = get();
        
        console.log('initializeDefaultInstruments called');
        console.log('Current instruments length:', state.instruments.length);
        console.log('UserId:', state.userId);
        
        // Only initialize if we don't have any instruments yet
        if (state.instruments.length === 0) {
          console.log('Initializing default instruments...');
          const initialInstruments: CustomInstrument[] = defaultInstruments.map(
            (instrument, index) => ({
              ...instrument,
              id: `default-${index}`,
              createdAt: new Date(),
            })
          );

          console.log('Setting initial instruments:', initialInstruments.length);
          set({
            instruments: initialInstruments,
          });
        } else {
          console.log('Instruments already exist, not initializing defaults');
        }
      },

      mergeNewDefaults: async () => {
        const state = get();
        console.log('mergeNewDefaults called');
        
        // Find default instruments that don't exist in current instruments
        const existingSymbols = new Set(state.instruments.map(inst => inst.symbol));
        const newDefaults = defaultInstruments.filter(
          defaultInst => !existingSymbols.has(defaultInst.symbol)
        );
        
        if (newDefaults.length > 0) {
          console.log('Found new default instruments to add:', newDefaults.length);
          console.log('New instruments:', newDefaults.map(inst => inst.symbol));
          
          const newInstruments: CustomInstrument[] = newDefaults.map(
            (instrument, index) => ({
              ...instrument,
              id: `default-${Date.now()}-${index}`,
              createdAt: new Date(),
            })
          );

          set((state) => ({
            instruments: [...state.instruments, ...newInstruments],
          }));

          // Save the updated instruments to Firestore
          await get().saveToFirestore();
          console.log('Added and saved new default instruments to Firestore');
        } else {
          console.log('No new default instruments to add');
        }
      },
    }),
    {
      name: 'instrument-store',
      // Only persist essential data
      partialize: (state) => ({
        instruments: state.instruments,
        favoriteInstruments: state.favoriteInstruments,
      }),
    }
  )
);

// Hook to initialize the store on app start
export const useInitializeInstrumentStore = () => {
  const initializeDefaultInstruments = useInstrumentStore(
    (state) => state.initializeDefaultInstruments
  );

  return initializeDefaultInstruments;
};