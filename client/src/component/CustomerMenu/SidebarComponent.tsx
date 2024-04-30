interface SidebarItemProp {
  uniqueKey: number,
  name: string,
  needsEditWidget: boolean
}

import { useContext, useEffect } from 'react';
import { SearchContext } from '@/UseContext';

const SidebarComponent: React.FC<SidebarItemProp> = ({ uniqueKey, name, needsEditWidget }) => {
  const { searchMenuOption, setSearchMenuOption } = useContext(SearchContext);
  const handleSidebarClick = () => {
    setSearchMenuOption(name);
  }
  useEffect(() => {
    // placeholder
  }, [searchMenuOption]);

  return (
    <div 
      className="no-cursor bg-white-200 p-2 hover:cursor-pointer rounded-xl  hover:font-bold flex align-center text-xl h-[50px] no-select" 
      key={uniqueKey}
      onClick={handleSidebarClick}
    >
      {/* {name} */}
      {needsEditWidget ?
        <div className="relative z-[1] bg-white-200 p-2 hover:cursor-pointer rounded-xl hover:font-bold grid grid-cols-[1fr,auto,auto] gap-1.5 align-center text-xl h-[50px]" key={uniqueKey}>
          <div className="no-select no-carat no-cursor">{name}</div>
        </div>
        : <div className="bg-white-200 p-2 hover:cursor-pointer rounded-xl  hover:font-bold flex align-center text-xl h-[50px]" key={uniqueKey}>{name}</div>
      }
    </div>
  )
}

export default SidebarComponent;