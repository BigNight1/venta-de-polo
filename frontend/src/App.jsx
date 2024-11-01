import { Route, Routes } from "react-router-dom"
import { Home } from "./components/Home/Home.jsx"
import { Navbar } from "./components/Navbar/Navbar.jsx"
import Nosotros from "./components/Nosotros/Nosotros.jsx"
import TourLima from "./components/Tours/TourLima.jsx"
import "./App.css"
import Login from "./components/Login/Login"
import { WhatsAppWidget } from "react-whatsapp-widget"
import 'react-whatsapp-widget/dist/index.css';
function App() {
  return (
    <div className="App">
      <Navbar/>

      
      {/* Routes  */}
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/Nosotros" element={<Nosotros/>}/>
          <Route path="/Tours-en-Lima" element={<TourLima/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="*" element={<h1>No existe la pagina</h1>}/>
        </Routes>
        <WhatsAppWidget />
    </div>
  )
}

export default App
