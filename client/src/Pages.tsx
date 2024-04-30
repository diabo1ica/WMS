import { Routes, Route } from 'react-router-dom';

import Landing from './screens/Landing';
import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import CustomerMenu from './screens/CustomerMenu';
import ReadyToDineIn from './screens/ReadyToDineIn';
import TableNumber from './screens/TableNumber';
import Help from './screens/Help';
import Features from './screens/Features';
import About from './screens/About';
import ManagerPage from './screens/ManagerPage';
import WaitStaffPage from './screens/WaitStaffPage';
import KitchenStaffPage from './screens/KitchenStaffPage';
import AddStaff from './screens/AddStaff';
import Dashboard from './screens/Dashboard';
import PasswordReset from './screens/PasswordReset';

// import CustomerSession from './screens/CustomerSession';
import CustomerBill from './screens/CustomerBill';

const Pages = () => {
  return (
    <>
      <Routes>
				<Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/customermenu" element={<CustomerMenu />} />
        <Route path="/readytodinein" element={<ReadyToDineIn />} />
        <Route path="/tablenumber" element={<TableNumber />} />
        <Route path="/help" element={<Help />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/manager" element={<ManagerPage/>} />
        <Route path="/waitstaff" element={<WaitStaffPage/>} />
        <Route path="/dashboard" element={<Dashboard/>} />

        <Route path="/kitchenstaff" element={<KitchenStaffPage/>} />
        <Route path="/addstaff" element={<AddStaff/>} />
        <Route path="/bill" element={<CustomerBill />} />
        <Route path="/passwordreset" element={<PasswordReset/>} />
      </Routes>
    </>
  );
};

export default Pages;
