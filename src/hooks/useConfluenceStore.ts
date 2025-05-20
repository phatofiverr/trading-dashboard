
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConfluenceState {
  confluenceTypes: string[];
  options: Record<string, string[]>;
  addConfluenceType: (type: string) => void;
  removeConfluenceType: (type: string) => void;
  addOption: (type: string, option: string) => void;
  removeOption: (type: string, option: string) => void;
  saveConfluenceData: () => void;
  getDefaultConfluences: () => void;
  getOptions: (type: string) => string[];
  clearAll: () => void;
}

// Empty default confluences since we want users to create their own
const DEFAULT_CONFLUENCES = {};

export const useConfluenceStore = create<ConfluenceState>()(
  persist(
    (set, get) => ({
      confluenceTypes: [],
      options: {},
      
      addConfluenceType: (type) => {
        set((state) => ({
          confluenceTypes: [...state.confluenceTypes, type],
          options: { ...state.options, [type]: [] }
        }));
      },
      
      removeConfluenceType: (type) => {
        set((state) => {
          const { [type]: _, ...restOptions } = state.options;
          return {
            confluenceTypes: state.confluenceTypes.filter(t => t !== type),
            options: restOptions
          };
        });
      },
      
      addOption: (type, option) => {
        set((state) => {
          // Ensure the type exists in the options
          const typeOptions = state.options[type] || [];
          
          return {
            options: {
              ...state.options,
              [type]: [...typeOptions, option]
            }
          };
        });
      },
      
      removeOption: (type, option) => {
        set((state) => ({
          options: {
            ...state.options,
            [type]: state.options[type]?.filter(o => o !== option) || []
          }
        }));
      },
      
      saveConfluenceData: () => {
        console.log("Saving confluence data:", {
          types: get().confluenceTypes,
          options: get().options
        });
        // Persistence is handled by zustand-persist
      },
      
      getDefaultConfluences: () => {
        set({
          confluenceTypes: Object.keys(DEFAULT_CONFLUENCES),
          options: { ...DEFAULT_CONFLUENCES }
        });
      },
      
      clearAll: () => {
        set({
          confluenceTypes: [],
          options: {}
        });
      },
      
      // Helper function to get options with fallbacks
      getOptions: (type) => {
        const state = get();
        // Return the options for the requested type, or an empty array if not found
        return state.options[type] || [];
      }
    }),
    {
      name: "confluence-storage",
    }
  )
);
