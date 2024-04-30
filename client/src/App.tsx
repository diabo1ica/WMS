import { BrowserRouter } from 'react-router-dom';
import Pages from './Pages';

import './index.css';
import './landing.css';

import { SearchProvider } from '@/UseContext';

function App() {


  return (
    <SearchProvider>
      <BrowserRouter>  
        <Pages />
      </BrowserRouter>
    </SearchProvider>
  );
}

export default App;
