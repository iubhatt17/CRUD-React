import React, { useState, useEffect, useRef, useReducer } from 'react';
import { DataTable, DataTablePageEvent  } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import Api from '../../services/Axios/ApiInstance';
import { ProductModal } from "../../services/Interface/ProductModal";
import './HomePage.css';
import { useNavigate } from 'react-router';
import { ProgressSpinner } from 'primereact/progressspinner';
interface Props  {}

const Home = (props: Props) => {

  const navigate = useNavigate();
  const api = new Api();

  const [productList, setProductList] = useState<ProductModal[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [first, setFirst] = useState(0); // The starting index of the data
  const [rows, setRows] = useState(5); // Number of rows to display per page
  const [isLoading, setLoading] = useState(false);
  const [controller, setController] = useState({
    page: 0
  }); // To manange pagination
  const [searchController, setSearchController] = useState({
    page: 0
  }); // To manange pagination
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    getAllProducts();
  }, [controller]);

  /**
   * Get Api call
   */
  const getAllProducts = async () => {
    const params = {
      page: controller.page + 1
    };
    try {
      setLoading(true);
      const res = await api.get("/product", false, params);
      setProductList(res.data.products);
      setProductCount(res.data.totalRecords);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Delete Api call
   */
  const deleteProductById = async (_id: any) => {
    try {
      setLoading(true);
      const res = await api.delete(`/product/${_id}`, false);
      getAllProducts();
    } catch (error) {
      console.error(error);
    }
  };

  // To display image within table
  const imageBodyTemplate = (product:any) => {
    return <img src={`${product.product_image_url}`} alt={product.product_image_url} className="w-6rem shadow-2 border-round" />;
  };

  // To display product formatted price
  const priceBodyTemplate = (product: any) => {
    return product.price.toLocaleString('en-US', { style: 'currency', currency: 'INR' });
  };

  // To display edit button
  const editButtonTemplate = (produt: any) => {
    return <Button icon="pi pi-pencil" aria-label="Filter" onClick={() => navigateToEditProduct(produt)} />
  }

  // To display delete button
  const deleteButtonTemplate = (produt: any) => {
    return <Button icon="pi pi-trash" severity="danger" aria-label="Filter" onClick={() => deleteProduct(produt._id)} />
  }

  const onGlobalFilterChange = async (e:any) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    if (value !== '') {
      await onSearchKeyWord(value);
    } else {
      setSearchController({page: 0});
      setController({page: 0});
      setProductList([]);
      setProductCount(0);
      setFirst(0);
      await getAllProducts();
    }
  };

  const onSearchKeyWord = async (value: string, page: number = 0) => {
    setSearchController({page: page});

    const params = {
      page: page + 1,
      keyword: value
    };

    try {
      setLoading(true);
      const res = await api.get("/product", false, params);
      setProductList(res.data.products);
      setProductCount(res.data.totalRecords);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  }

  // To display header in datatable
  const header = (
    <div className="flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="flex justify-content-end">
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search" />
            </IconField>
        </div>
        <div className='add-button'>
          <Button label="Add Product" onClick={() => navigateToAddProduct()}/>
        </div>
    </div>
  );

  // To display footer in datatable
  const footer = `In total there are ${productCount ? productCount : 0} products.`;

  // Add Product navigation
  const navigateToAddProduct = () => {
    navigate(`/add-product/`)
  }

  // Edit Product navigation
  const navigateToEditProduct = (produt: any) => {
    navigate(`/edit-product/${produt._id}`)
  }

  // Delete button click handler
  const deleteProduct = (id: any) => {
    deleteProductById(id)
  }

  // To manage pagination click events
  const onPage = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
    
    if (globalFilterValue !== '') {
      console.log('event.page ' , event.page)
      setSearchController({page: event.page});
      onSearchKeyWord(globalFilterValue, event.page)
    } else {
      setController({page: event.page});
      getAllProducts();
    }
  };

  return (
    <div>
      <div className='heading'>
        <h1>Product List</h1>
      </div>
    
      {isLoading && (
        <div className="loader-container">
          <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s"/>
        </div>
      )}

      <DataTable value={productList} paginator lazy filterDisplay="row" first={first} rows={rows} loading={isLoading} onPage={onPage} totalRecords={productCount}  header={header} footer={footer} tableStyle={{ minWidth: '50rem' }}>
        <Column header="Image" body={imageBodyTemplate}></Column>
        <Column field="title" header="Name"></Column>
        <Column field="description" header="Description"></Column>
        <Column field="price" header="Price" body={priceBodyTemplate}></Column>
        <Column header="Edit" body={editButtonTemplate}></Column>
        <Column header="Delete" body={deleteButtonTemplate}></Column>
      </DataTable>
    </div>
  )
}

export default Home;