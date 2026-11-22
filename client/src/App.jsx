import { Routes, Route } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";

import Home from "./pages/Home";
import Advisory from "./pages/Advisory";
import DailyActions from "./pages/DailyActions";
import CropStages from "./pages/CropStages";
import Fertilizer from "./pages/Fertilizer";
import Irrigation from "./pages/Irrigation";
import Weather from "./pages/Weather";
import PlaceholderPage from "./pages/PlaceholderPage";
import ExpertHelp from "./pages/ExpertHelp";
import PestDisease from "./pages/PestDisease";
import AgriculturalBulletins from "./pages/AgriculturalBulletins";
import WeatherHistory from "./pages/WeatherHistory";
import CropGuide from "./pages/CropGuide";
import CropPlan from "./pages/CropPlan";
import DataSources from "./pages/DataSources";
import About from "./pages/About";
import Login from "./pages/Login";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/advisory" element={<Advisory />} />
        <Route path="/daily-actions" element={<DailyActions />} />
        <Route path="/crop-stages" element={<CropStages />} />
        <Route path="/fertilizer" element={<Fertilizer />} />
        <Route path="/irrigation" element={<Irrigation />} />

        {/* Weather Dashboard */}
        <Route path="/weather" element={<Weather />} />

       <Route path="/pest-disease" element={<PestDisease />} />
       <Route
  path="/bulletins"
  element={<AgriculturalBulletins />}
/>

        <Route path="/history" element={<WeatherHistory />} />

        <Route path="/crops" element={<CropGuide />} />

        <Route path="/crop-plan" element={<CropPlan />} />
        <Route path="/data-sources" element={<DataSources />} />

        <Route path="/expert-help" element={<ExpertHelp />} />

        <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />

        <Route
          path="*"
          element={
            <PlaceholderPage
              title="পেজ পাওয়া যায়নি"
              subtitle="আপনি যে পেজটি খুঁজছেন সেটি পাওয়া যায়নি।"
            />
          }
        />
      </Routes>

      <Footer />
      
      <BottomNav />
    </>
  );
}

export default App;