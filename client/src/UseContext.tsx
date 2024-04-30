import { createContext, useState, Dispatch, SetStateAction, ReactNode } from 'react';

interface menuItem {
  category: number,
  description: string,
  dietary_requirements: "DF" | "GF" | "V" | "VG" | "",
  name: string,
  pk: number,
  popular: boolean,
  preparation_time: number,
  price: string,
  restaurant: number,
  image: string,
  position: number
}

interface structuredMenu {
  category: category,
  menuItems: menuItem[]
}

interface category {
  pk: number,
  name: string,
  restaurant: number,
}

interface SearchContextType {
  searchMenuOption: string | undefined;
  setSearchMenuOption: Dispatch<SetStateAction<string | undefined>>;
  menuSidebarPointer: string | undefined; // points to div id
  setMenuSidebarPointer: Dispatch<SetStateAction<string | undefined>>;
  refresh: boolean | undefined;
  setRefresh: Dispatch<SetStateAction<boolean | undefined>>;
  menu: menuItem[] | [];
  setMenu: Dispatch<SetStateAction<menuItem[] | []>>;
  structuredMenuGlobal: structuredMenu[] | [];
  setStructuredMenuGlobal: Dispatch<SetStateAction<structuredMenu[] | []>>;
  currentTableFocusNumber: number;
  setCurrentTableFocusNumber: Dispatch<SetStateAction<number>>;
  currentManagerTableTabFocused: string,
  setCurrentManagerTableTabFocused: Dispatch<SetStateAction<string>>;
  assistanceModalOpened: boolean,
  setAssistanceModalOpened: Dispatch<SetStateAction<boolean>>;
}

const placeholderFunction = () => {
  // placeholder function
}

const defaultContextValue: SearchContextType = {
  searchMenuOption: '',
  setSearchMenuOption: placeholderFunction,
  menuSidebarPointer: '',
  setMenuSidebarPointer: placeholderFunction,
  refresh: false,
  setRefresh: placeholderFunction,
  menu: [],
  setMenu: placeholderFunction,
  structuredMenuGlobal: [],
  setStructuredMenuGlobal: placeholderFunction,
  currentTableFocusNumber: -1,
  setCurrentTableFocusNumber: placeholderFunction,
  currentManagerTableTabFocused: 'Your menu',
  setCurrentManagerTableTabFocused: placeholderFunction,
  assistanceModalOpened: false,
  setAssistanceModalOpened: placeholderFunction
};

export const SearchContext = createContext<SearchContextType>(defaultContextValue);

export const SearchProvider = ({ children }: {children: ReactNode}) => {
  const [searchMenuOption, setSearchMenuOption] = useState<string | undefined>('');
  const [menuSidebarPointer, setMenuSidebarPointer] = useState<string | undefined>('');
  const [refresh, setRefresh] = useState<boolean | undefined>(false);
  const [menu, setMenu] = useState<menuItem[] | []>([]);
  const [structuredMenuGlobal, setStructuredMenuGlobal] = useState<structuredMenu[] | []>([]);
  const [currentTableFocusNumber, setCurrentTableFocusNumber] = useState<number>(-1);
  const [currentManagerTableTabFocused, setCurrentManagerTableTabFocused] = useState<string>('Your menu');
  const [assistanceModalOpened, setAssistanceModalOpened] = useState<boolean>(false);

  return (
    <SearchContext.Provider
      value={{
        searchMenuOption,
        setSearchMenuOption,
        menuSidebarPointer,
        setMenuSidebarPointer,
        refresh,
        setRefresh,
        menu,
        setMenu,
        structuredMenuGlobal,
        setStructuredMenuGlobal,
        currentTableFocusNumber,
        setCurrentTableFocusNumber,
        currentManagerTableTabFocused,
        setCurrentManagerTableTabFocused,
        assistanceModalOpened,
        setAssistanceModalOpened
      }}>
      {children}
    </SearchContext.Provider>
  );
};
