import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './css/Nav.css';
import './css/Home.css';
import './css/Form.css';

import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import Usage from './components/Usage/Usage';
import Savingmethods from './components/SavingMethods/Savingmethods';
import Power from './components/PowerConsumption/Powerconsumption';
import Energycalculator from './components/EnergyCalculator/Energycalculator';
import Account from './components/Account/Account';
import Report from './components/Report/Report';
import NotFound from './components/NotFound/NotFound';
import Navbar from './components/Navbar/Navbar';
import DataState from './context/data/DataState';
import Layout from './components/Layout/Layout';
import TitleUpdater from './components/Common/TitleUpdater';
import DeviceA from './components/Devices/DeviceA';
import DevicesB from './components/Devices/DevicesB';
import DevicesC from './components/Devices/DevicesC';
import Mainline from './components/Devices/MainLine';
import UsageA from './components/DevicesConsumption/UsageA';
import UsageB from './components/DevicesConsumption/UsageB';
import UsageC from './components/DevicesConsumption/UsageC';
import MeterA from './components/Meter/MeterA';
import MeterB from './components/Meter/MeterB';
import MeterC from './components/Meter/MeterC';

function App() {
  return (
    <div className='App'>
      <DataState>
        <Router>
          <Navbar />
          <TitleUpdater />
          <div className='container-fluid'>
            <div className='row'>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />

                {/* Protected Panel Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path='/panel' element={<Layout />}>
                    <Route path='/panel/dashboard' element={<Dashboard />}>
                      <Route path='/panel/dashboard/zone_A' element={<MeterA />} />
                      <Route path='/panel/dashboard/zone_B' element={<MeterB />} />
                      <Route path='/panel/dashboard/zone_C' element={<MeterC />} />
                    </Route>
                    <Route path='/panel/usage' element={<Usage />}>
                      <Route path='/panel/usage/zone_A' element={<UsageA />} />
                      <Route path='/panel/usage/zone_B' element={<UsageB />} />
                      <Route path='/panel/usage/zone_C' element={<UsageC />} />
                    </Route>
                    <Route path='/panel/savingmethods' element={<Savingmethods />} />
                    <Route path='/panel/powerconsumption' element={<Power />}>
                      <Route path='/panel/powerconsumption/zone_A' element={<DeviceA />} />
                      <Route path='/panel/powerconsumption/zone_B' element={<DevicesB />} />
                      <Route path='/panel/powerconsumption/zone_C' element={<DevicesC />} />
                      <Route path='/panel/powerconsumption/main' element={<Mainline />} />
                    </Route>
                    <Route path='/panel/energycalculator' element={<Energycalculator />} />
                    <Route path='/panel/account' element={<Account />} />
                    <Route path='/panel/report/:reportType' element={<Report />} />
                  </Route>
                </Route>

                <Route path='*' element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={10000}
          hideProgressBar={false}
          closeOnClick={true}
          pauseOnHover={false}
          pauseOnFocusLoss={false}
          draggable={true}
          theme="colored"
          type="error"
        />
      </DataState>
    </div>
  );
}

export default App;
