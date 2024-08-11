import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/HomePage/HomePage";
import AddProduct from "../pages/AddProduct/AddProduct";
import EditProduct from "../pages/EditProduct/EditProduct";

export const router = createBrowserRouter([
    {
        path: '',
        element: <Home />
    },
    {
        path: 'add-product',
        element: <AddProduct />
    },
    {
        path: 'edit-product/:id',
        element: <EditProduct />
    }
])