/**
 * Main Application Component
 * 
 * Sets up the global layout including the navigation bar, footer,
 * smooth scrolling (Lenis), and defines the application's routing structure.
 * Also initializes the global toast notification system.
 */

import Navbar from './components/Navbar';
import Home from './pages/Home';
import SoftBackdrop from './components/SoftBackdrop';
import Footer from './components/Footer';
import LenisScroll from './components/lenis';
import { Route, Routes } from 'react-router-dom';
import Generator from './pages/Generator';
import Result from './pages/Result';
import Community from './pages/Community';
import Plans from './pages/Plans';
import Loading from './pages/Loading';
import MyGenerations from './pages/Mygenerations';
import { Toaster } from 'react-hot-toast';

function App() {
	return (
		<>
			{/* Global toast notification configuration */}
			<Toaster toastOptions={{style:{background:'#333',color:'#fff'}}} />
			
			{/* UI Background and smooth scroll effects */}
			<SoftBackdrop />
			<LenisScroll />
			
			{/* Shared Header/Navigation */}
			<Navbar />

			{/* Main Content Areas / Routing */}
			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/generate' element={<Generator />} />
				<Route path='/result/:projectId' element={<Result />} />
				<Route path='/my-generations' element={<MyGenerations />} />
				<Route path='/community' element={<Community />} />
				<Route path='/plans' element={<Plans />} />
				<Route path='/loading' element={<Loading />} />
			</Routes>

			{/* Shared Footer */}
			<Footer />
		</>
	);
}

export default App;