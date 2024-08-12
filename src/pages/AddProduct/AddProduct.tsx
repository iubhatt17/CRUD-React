import React, { useEffect, useRef, useState } from 'react'
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import Api from '../../services/Axios/ApiInstance';
import AWS from 'aws-sdk';
import S3 from 'aws-sdk/clients/s3';
import './AddProduct.css'
import { useNavigate } from 'react-router';
import { InputNumber } from 'primereact/inputnumber';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';

interface Props {}

interface ProductFormState {
  title: string;
  description: string;
  price: string;
}

interface ProductFormStateValues {
  title: string;
  description: string;
  price: number;
}

interface ProductFormImageState {
  image: string
}

const AddProduct = (props: Props) => {

  const api = new Api();
  const navigate = useNavigate();

  const toast = useRef<any>(null);
  
  const [formData, setFormData] = useState<ProductFormStateValues>({
    title: '',
    description: '',
    price: 0,
  });

  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [isLoading, setLoading] = useState(false)

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    // Add more supported types as needed
  ];

  const [errors, setErrors] = useState<Partial<ProductFormState>>({});
  const [imageErrors, setImageErrors] = useState<Partial<ProductFormImageState>>({});


  const validate = (): boolean => {
      let valid = true;
      let errors: Partial<ProductFormState> = {};
      let imageError: Partial<ProductFormImageState> = {}

      if (!formData.title) {
          errors.title = 'Product name is required';
          valid = false;
      }

      if (!formData.description) {
          errors.description = 'Description is required';
          valid = false;
      }

      if (!formData.price || isNaN(Number(formData.price))) {
          errors.price = 'Valid price is required';
          valid = false;
      }

      if (!fileUrl) {
          imageError.image = 'Product image is required';
          valid = false;
      }

      setErrors(errors);
      setImageErrors(imageError);
      return valid;
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
        ...prev,
        [name]: value
    }));
  };

  const handlePriceChange = (e: any) => {
    setFormData((prev) => ({
        ...prev,
        price: e.value
    }));
  }

  const handleFileChange = async (e: any) => {
    if (e.files) {
      const selectedFile = e.files[0];
      if (allowedTypes.includes(selectedFile.type)) {
        setUploading(true)

        const S3_BUCKET = "crud-react-demo"; 
        const REGION = "us-east-1";

        AWS.config.update({
          accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
          secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
        });

        const s3 = new S3({
          params: { Bucket: S3_BUCKET },
          region: REGION,
        });

        const params = {
          Bucket: S3_BUCKET,
          Key: selectedFile!.name,
          Body: selectedFile
        };

        try {
          const upload = await s3.putObject(params).promise();
          setFileUrl(`https://crud-react-demo.s3.amazonaws.com/${selectedFile!.name}`)
          setUploading(false)
          validate()
        } catch (error: any) {
          console.error(error?.message);
          setUploading(false)
          alert("Error uploading file: " + error?.message); // Inform user about the error
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
        const payload = {
          ...formData,
          product_image_url: fileUrl
        }
        await postProductData(payload);
    }
  };

  /**
   * POST Api call
   */
  const postProductData = async (payload: any) => {
    
    try {
      setLoading(true)
      const res = await api.post("/product", payload);
      if (res.status === 'success') {
        setLoading(false)
        navigate('/')
      } else {
        toast.current.show({severity:'error', summary: 'Error', detail:'Something went wrong!', life: 3000});
      }
    } catch (error) {
      console.error(error);
      toast.current.show({severity:'error', summary: 'Error', detail:'Something went wrong!', life: 3000});
    }
  };

  return (
    <div className='content'>
      {isLoading && (
        <div className="loader-container">
          <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s"/>
        </div>
      )}

      <div className='heading'>
        <h1>Add Product Details</h1>
      </div>

      <Toast ref={toast} position="top-right" />
      
      <div className='form-cotainer'>
        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="p-field pt-5">
              <label htmlFor="title">Product Name</label>
              <InputText
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={classNames({ 'p-invalid': errors.title }, 'mt-2')}
              />
              {errors.title && <small className="p-error">{errors.title}</small>}
          </div>
          <div className="p-field pt-5">
              <label htmlFor="description">Description</label>
              <InputTextarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className={classNames({ 'p-invalid': errors.description }, 'mt-2')}
              />
              {errors.description && <small className="p-error">{errors.description}</small>}
          </div>
          <div className="p-field pt-5">
              <label htmlFor="price">Price</label>
              <InputNumber
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handlePriceChange}
                  className={classNames({ 'p-invalid': errors.price }, 'mt-2')}
              />
              {errors.price && <small className="p-error">{errors.price}</small>}
          </div>
          <div className="p-field pt-5">
              <label htmlFor="image">Image</label>
              <FileUpload
                  id="image"
                  mode="advanced"
                  name="image"
                  accept="image/*"
                  customUpload
                  uploadHandler={handleFileChange}
                  className={classNames({ 'p-invalid': imageErrors.image }, 'mt-2')}
                  auto
              />
              {/* {imageErrors.image && <small className="p-error">{imageErrors.image}</small>} */}
          </div>
          <Button label="Submit" type="submit" disabled={uploading} className="p-mt-2 mt-5" />
        </form>
      </div>
    </div>
  )
}

export default AddProduct;