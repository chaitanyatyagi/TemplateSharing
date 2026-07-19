import { SnackbarProvider } from "notistack";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/User/Home";
import Admin from "./pages/Admin/Admin";
import Login from "./pages/User/Login";
import Profile from './pages/User/Profile';
import Contact from './pages/User/Contact';
import Blog from './pages/User/Blog';
import BlogIndividual from './pages/User/BlogIndividual';
import Template from './pages/User/Template';
import TemplateIndividual from './pages/User/TemplateIndividual';
import Cart from './pages/User/Cart';
import './index.css'

function App() {
  return (
    <SnackbarProvider>
      <Router>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
            <div>
              {/* <Navbar /> */}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/contact" element={<Contact />} />
                <Route path="/templates" element={<Template />} />
                <Route path="/templates/:templateId" element={<TemplateIndividual />} />
                <Route path="/blogs" element={<Blog />} />
                <Route path="/blogs/:blogId" element={<BlogIndividual />} />
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="/admin/*" element={
                  <ProtectedRoute requiredRole="admin">
                    <Admin />
                  </ProtectedRoute>
                } />
              </Routes>
              {/* <Footer /> */}
            </div>
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </Router>
    </SnackbarProvider>
  );
}

export default App;
