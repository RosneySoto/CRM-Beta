import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import FormExamplePage from "@/pages/forms/form-example";
import AdvancedFormExamplePage from "@/pages/forms/advanced-form-example";
import NotFoundPage from "@/pages/not-found";
import PublicLayout from "@/layouts/public";
import DashboardLayout from "@/layouts/dashboard";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import InvoicesPage from "@/pages/invoices";
import InvoicesNewPage from "@/pages/invoices/new";

function App() {
  return (
    <Routes>
      {/* Grupo Público */}
      <Route element={<PublicLayout />}>
        <Route element={<IndexPage />} path="/" />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
      </Route>

      {/* Grupo Privado */}
      {/* <Route element={<PrivateRoute />}> */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<IndexPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/invoices/new" element={<InvoicesNewPage />} />
        <Route path="/example/1" element={<FormExamplePage />} />
        <Route path="/example/2" element={<AdvancedFormExamplePage />} />
      </Route>
      {/* </Route> */}

      {/* Grupo de Error 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
