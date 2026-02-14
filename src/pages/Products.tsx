import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X, Upload, ImageIcon, FilePenLine } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { productAPI, brandAPI, productCategoryAPI, productSubCategoryAPI, productsTagAPI, API_BASE_URL, productStockAPI } from "@/lib/api";
import { ReactSpreadsheetImport } from "react-spreadsheet-import";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMainImage, setSelectedMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [stockModalStatus, setStockModalStatus] = useState(false)

  const [formData, setFormData] = useState({
    Title: "",
    OriginalPrice: "",
    HighPrice: "",
    ShortDecription: "",
    MainDecription1: "",
    MainDecription2: "",
    Quantity: "",
    ProductTag: "",
    ProductTagTitle: "",
    ProductCatId: "",
    ProductCatTitle: "",
    ProductSubCatId: "",
    ProductSubCatTitle: "",
    BrandId: "",
    BrandTitle: "",
    Combo: false,
    Tranding: false,
    OrderId: "",
    CommonBulkId: "",
    Status: true,
  });
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // State for stock form
const [stockFormData, setStockFormData] = useState({
  ProductId: "1145",
  Quantity: "",
  StockEntry: "IN", // Default to IN
  Remark: "",
  PreviousQuantity: 0,
  ActualStock: 0
});

console.log('stockFormData', stockFormData)
  useEffect(() => {
    fetchProducts();
    fetchBrands();
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    if (formData.ProductCatId) {
      fetchSubCategories(formData.ProductCatId);
    }
  }, [formData.ProductCatId]);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.list();
      setProducts(response.data || response);
    } catch (error) {
      toast({ 
        title: "Error fetching products", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await brandAPI.list();
      setBrands(response.data || response);
    } catch (error) {
      toast({ 
        title: "Error fetching brands", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productCategoryAPI.list();
      setCategories(response.data || response);
    } catch (error) {
      toast({ 
        title: "Error fetching categories", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const fetchSubCategories = async (categoryId: string) => {
    try {
      const response = await productSubCategoryAPI.list();
      const filteredSubCategories = (response.data || response).filter(
        (subCat: any) => subCat.ProductCatId?.toString() === categoryId
      );
      setSubCategories(filteredSubCategories);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await productsTagAPI.list();
      setTags(response.data || response);
    } catch (error) {
      toast({ 
        title: "Error fetching tags", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = [...selectedImages, ...files];
      setSelectedImages(newFiles);
      
      // Create previews for new files only
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedMainImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMainImage = () => {
    setSelectedMainImage(null);
    setMainImagePreview("");
    if (editingProduct?.MainImage) {
      setFormData(prev => ({ ...prev, RemoveMainImage: true }));
    }
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId: string) => {
    setExistingImages(prev => prev.filter(img => img.ProductImageId !== imageId));
    setImagesToDelete(prev => [...prev, imageId]);
  };

  const handleTagSelect = (tagTitle: string) => {
    if (tagTitle && !selectedTags.includes(tagTitle)) {
      const newTags = [...selectedTags, tagTitle];
      setSelectedTags(newTags);
      
      // Update form data with comma-separated tags
      setFormData(prev => ({
        ...prev,
        ProductTag: newTags.join(','),
        ProductTagTitle: newTags.join(', ')
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    
    // Update form data with comma-separated tags
    setFormData(prev => ({
      ...prev,
      ProductTag: newTags.join(','),
      ProductTagTitle: newTags.join(', ')
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const submitData = new FormData();
      
      // Append all form data as fields (not JSON)
      submitData.append('Title', formData.Title);
      submitData.append('OriginalPrice', formData.OriginalPrice);
      submitData.append('HighPrice', formData.HighPrice);
      submitData.append('ShortDecription', formData.ShortDecription);
      submitData.append('MainDecription1', formData.MainDecription1);
      submitData.append('MainDecription2', formData.MainDecription2);
      submitData.append('Quantity', formData.Quantity);
      submitData.append('ProductTag', formData.ProductTag || "");
      submitData.append('ProductTagTitle', formData.ProductTagTitle || "");
      submitData.append('ProductCatId', formData.ProductCatId);
      submitData.append('ProductCatTitle', formData.ProductCatTitle || "");
      submitData.append('ProductSubCatId', formData.ProductSubCatId);
      submitData.append('ProductSubCatTitle', formData.ProductSubCatTitle || "");
      submitData.append('BrandId', formData.BrandId);
      submitData.append('BrandTitle', formData.BrandTitle || "");
      submitData.append('Combo', formData.Combo.toString());
      submitData.append('Tranding', formData.Tranding.toString());
      submitData.append('OrderId', formData.OrderId || "");
      submitData.append('CommonBulkId', formData.CommonBulkId || "");
      submitData.append('Status', formData.Status.toString());

      // Append main image
      if (selectedMainImage) {
        submitData.append('MainImage', selectedMainImage);
      }

      // Append RemoveMainImage flag if needed
      if (formData.RemoveMainImage) {
        submitData.append('RemoveMainImage', 'true');
      }

      // Append new images
      selectedImages.forEach(file => {
        submitData.append('Images', file);
      });

      // Append images to delete for update operation
      if (editingProduct && imagesToDelete.length > 0) {
        submitData.append('DeleteImageIds', imagesToDelete.join(','));
      }

      let response;
      if (editingProduct) {
        submitData.append('ProductId', editingProduct.ProductId.toString());
        response = await productAPI.update(submitData);
      } else {
        response = await productAPI.create(submitData);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        throw new Error(errorData.message || 'Failed to save product');
      }

      const result = await response.json();
      
      toast({ 
        title: editingProduct ? "Product updated successfully" : "Product created successfully",
        description: result.message 
      });

      fetchProducts();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (product: any) => {
    setEditingProduct(product);
    
    // Parse existing tags if available
    const productTags = product.ProductTag ? product.ProductTag.split(',').filter(Boolean) : [];
    setSelectedTags(productTags);
    
    setFormData({
      Title: product.Title || "",
      OriginalPrice: product.OriginalPrice?.toString() || "",
      HighPrice: product.HighPrice?.toString() || "",
      ShortDecription: product.ShortDecription || "",
      MainDecription1: product.MainDecription1 || "",
      MainDecription2: product.MainDecription2 || "",
      Quantity: product.Quantity?.toString() || "",
      ProductTag: product.ProductTag || "",
      ProductTagTitle: product.ProductTagTitle || "",
      ProductCatId: product.ProductCatId?.toString() || "",
      ProductCatTitle: product.ProductCatTitle || "",
      ProductSubCatId: product.ProductSubCatId?.toString() || "",
      ProductSubCatTitle: product.ProductSubCatTitle || "",
      BrandId: product.BrandId?.toString() || "",
      BrandTitle: product.BrandTitle || "",
      Combo: product.Combo || false,
      Tranding: product.Tranding || false,
      OrderId: product.OrderId || "",
      CommonBulkId: product.CommonBulkId || "",
      Status: product.Status !== undefined ? product.Status : true,
    });

    // Set main image preview if exists
    if (product.MainImage) {
      setMainImagePreview(`${API_BASE_URL}/${product.MainImage}`);
    }

    // Set existing images from ImagesData array
    if (product.ImagesData && product.ImagesData.length > 0) {
      setExistingImages(product.ImagesData);
    } else {
      // Fallback: fetch images if not included in the response
      try {
        if (product.ProductId) {
          const imagesResponse = await productAPI.getImages(product.ProductId);
          setExistingImages(imagesResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching product images:', error);
        setExistingImages([]);
      }
    }

    setSelectedImages([]);
    setImagePreviews([]);
    setImagesToDelete([]);
    setSelectedMainImage(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await productAPI.delete(id);
      toast({ title: "Product deleted successfully" });
      fetchProducts();
    } catch (error) {
      toast({ 
        title: "Error deleting product", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleStatusToggle = async (product: any) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('ProductId', product.ProductId.toString());
      formDataToSend.append('Title', product.Title);
      formDataToSend.append('Status', (!product.Status).toString());
      
      const response = await productAPI.update(formDataToSend);
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      toast({ title: "Status updated successfully" });
      fetchProducts();
    } catch (error) {
      toast({ 
        title: "Error updating status", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setSelectedTags([]);
    setFormData({
      Title: "",
      OriginalPrice: "",
      HighPrice: "",
      ShortDecription: "",
      MainDecription1: "",
      MainDecription2: "",
      Quantity: "",
      ProductTag: "",
      ProductTagTitle: "",
      ProductCatId: "",
      ProductCatTitle: "",
      ProductSubCatId: "",
      ProductSubCatTitle: "",
      BrandId: "",
      BrandTitle: "",
      Combo: false,
      Tranding: false,
      OrderId: "",
      CommonBulkId: "",
      Status: true,
    });
    setSelectedImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setSelectedMainImage(null);
    setMainImagePreview("");
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const getBrandName = (p: any) => {
    const brand = brands.find(b => b.BrandId === p.brandId);
    return brand ? brand.Title : p?.BrandTitle || `-`;
  };

  const getCategoryName = (p: any) => {
    const category = categories.find(c => c.ProductCatId === p.catId);
    return category ? category.Title : p?.ProductCatTitle || `-`;
  };

  const getTagNames = (tagString: string) => {
    if (!tagString) return 'No tags';
    return tagString.split(',').filter(Boolean).join(', ');
  };

  // Get product image for table display (prefer MainImage, fallback to first image from ImagesData)
  const getProductImage = (product: any) => {
    // Use MainImage if available
    if (product.MainImage) {
      return {
        Image: product.MainImage,
        Thumbnail: product.MainImageThumbnail
      };
    }
    
    // Fallback to first image from ImagesData
    if (product.ImagesData && product.ImagesData.length > 0) {
      return product.ImagesData[0];
    }
    
    return null;
  };

  const toggleIsOPen = () => setIsOpen(!isOpen);

  const importExcelHandleSubmit = async (data) => {
  // Data will be an array of objects matching your field structure
  console.log("Imported data:", data);
  
  try {
    const dummy = data.validData;
    // Validate data
    if (!dummy || !Array.isArray(dummy) || dummy.length === 0) {
      console.warn("No dummy to import");
      return;
    }

    // Process dummy with proper error handling
    const results = [];
    
 for (let i = 0; i < dummy.length; i++) {
  const product = dummy[i];
  
  // Validate required fields before processing
  if (!product || typeof product !== 'object') {
    console.warn(`Skipping invalid product at index ${i}`);
    continue;
  }
  
  try {
    // Clean price fields - remove all non-numeric characters except decimal point
    if (product.OriginalPrice) {
      product.OriginalPrice = product.OriginalPrice.toString().replace(/[^0-9.]/g, '');
      // Ensure it's a valid number, if empty set to null/0
      if (product.OriginalPrice === '' || product.OriginalPrice === '.') {
        product.OriginalPrice = '0';
      }
    }
    
    if (product.HighPrice) {
      product.HighPrice = product.HighPrice.toString().replace(/[^0-9.]/g, '');
      // Ensure it's a valid number, if empty set to null/0
      if (product.HighPrice === '' || product.HighPrice === '.') {
        product.HighPrice = '0';
      }
    }
    
    const result = await productAPI.excelCreate(product);
    results.push({
      index: i,
      success: true,
      data: result,
      product: product
    });
    console.log(`Successfully imported product ${i + 1}`);

  } catch (error) {
    console.error(`Failed to import product ${i + 1}:`, error);
    results.push({
      index: i,
      success: false,
      error: error.message,
      product: product
    });
  }
}

    // Log summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`Import completed: ${successful} successful, ${failed} failed`);

        await fetchProducts();

    return results;

  } catch (error) {
    console.error("Error during import process:", error);
    throw error;
  }
};

  const stockModalToggle = () => setStockModalStatus(!stockModalStatus);

  // Handle stock form submission
  const handleStockSubmit = async (e) => {
    e.preventDefault();

    try {
      // Get current product stock to set as PreviousQuantity
      const selectedProduct = products.find(
        p => p.ProductId.toString() === stockFormData.ProductId
      );

      const currentStock = selectedProduct?.CurrentStock || 0;
      const quantity = stockFormData.StockEntry == "IN" ? parseInt(stockFormData.Quantity) : -parseInt(stockFormData.Quantity);
      const actualStock = currentStock + quantity;
      const stockData = {
        ProductId: parseInt(stockFormData.ProductId),
        Quantity: parseInt(actualStock),
        PreviousQuantity: selectedProduct?.CurrentStock || 0,
        StockEntry: stockFormData.StockEntry,
        Remark: stockFormData.Remark || null,
      };

      let response: any;
      response = await productStockAPI.create(stockData);

      if (response.success == true) {
        setStockModalStatus(false);
        setStockFormData({
          ProductId: "",
          Quantity: "",
          StockEntry: "IN",
          Remark: "",
          PreviousQuantity: 0
        });
        fetchProducts();
        toast({
          title: "Stock entry added successfully",
          description: "Stock entry added successfully",
        });

      }
    } catch (error) {
      console.error("Error saving stock entry:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const productStockManage = useMemo(() => {
    const stock = (stockFormData.StockEntry == "IN" ? parseInt(stockFormData?.Quantity || 0) : -parseInt(stockFormData?.Quantity || 0)) + parseInt(stockFormData?.ActualStock || 0);
    return stock
  }, [stockFormData.Quantity, stockFormData.ActualStock, stockFormData.StockEntry])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage pharma products</p>
        </div>
        <div className="flex items-center space-x-2">
          <ReactSpreadsheetImport
            isOpen={isOpen}
            onClose={toggleIsOPen}
            onSubmit={importExcelHandleSubmit}
            fields={[
              {
                label: "Title",
                key: "Title",
                alternateMatches: ["product title", "name", "product name"],
                fieldType: { type: "input" },
                example: "Bold Care Spark Supplement (30 Capsules)",
                validations: [
                  {
                    rule: "required",
                    errorMessage: "Product title is required",
                    level: "error",
                  },
                ],
              },
              {
                label: "Original Price",
                key: "OriginalPrice",
                alternateMatches: ["price", "original price", "cost", "price 2"],
                fieldType: { type: "input" },
                example: "699",
                validations: [
                  {
                    rule: "required",
                    errorMessage: "Original price is required",
                    level: "error",
                  },
                ],
              },
              {
                label: "High Price",
                key: "HighPrice",
                alternateMatches: ["high price", "max price", "mrp"],
                fieldType: { type: "input" },
                example: "799",
              },
              {
                label: "Short Description",
                key: "ShortDecription",
                alternateMatches: ["short description", "description", "summary"],
                fieldType: { type: "input" },
                example: "<p>Daily supplement that supports energy and healthy testosterone levels.</p>",
              },
              {
                label: "Main Description 1",
                key: "MainDecription1",
                alternateMatches: ["main description", "description 1", "full description"],
                fieldType: { type: "input" },
                example: "<p>Bold Care Spark Capsules are formulated with natural herbs...</p>",
              },
              {
                label: "Main Description 2",
                key: "MainDecription2",
                alternateMatches: ["additional description", "description 2"],
                fieldType: { type: "input" },
                example: "",
              },
              {
                label: "Quantity",
                key: "Quantity",
                alternateMatches: ["stock", "qty", "inventory"],
                fieldType: { type: "input" },
                example: "68",
                validations: [
                  {
                    rule: "required",
                    errorMessage: "Quantity is required",
                    level: "error",
                  },
                ],
              },
              {
                label: "Product Tag",
                key: "ProductTag",
                alternateMatches: ["tags", "product tags", "keywords"],
                fieldType: { type: "input" },
                example: "vitality,performance,natural,men-health,energy,booster",
              },
              {
                label: "Images",
                key: "Images",
                alternateMatches: ["image ids", "photos", "media", "images"],
                fieldType: { type: "input" },
                validations: [
                  {
                    rule: "required",
                    errorMessage: "Images are required",
                    level: "error",
                  },
                ],
                example: "a.png,b.png,c.png",
              },
              {
                label: "Product Category ID",
                key: "ProductCatId",
                alternateMatches: ["category id", "cat id"],
                fieldType: { type: "input" },
                example: "1",
              },
              {
                label: "Product Category Title",
                key: "ProductCatTitle",
                alternateMatches: ["category", "category title"],
                fieldType: { type: "input" },
                example: "Sexual Wellness",
              },
              {
                label: "Product Subcategory ID",
                key: "ProductSubCatId",
                alternateMatches: ["subcategory id", "sub cat id"],
                fieldType: { type: "input" },
                example: "2",
              },
              {
                label: "Product Subcategory Title",
                key: "ProductSubCatTitle",
                alternateMatches: ["subcategory", "subcategory title"],
                fieldType: { type: "input" },
                example: "Erectile Dysfunction",
              },
              {
                label: "Brand ID",
                key: "BrandId",
                alternateMatches: ["brand id"],
                fieldType: { type: "input" },
                example: "26",
              },
              {
                label: "Brand Title",
                key: "BrandTitle",
                alternateMatches: ["brand", "brand name"],
                fieldType: { type: "input" },
                // fieldType: { type: "select", options: brands.map((b) => ({ label: b.Title, value: b.Title })), multi: true },
                example: "Bold Care",
              },
              {
                label: "Combo",
                key: "Combo",
                alternateMatches: ["is combo", "combo product"],
                fieldType: {
                  type: "checkbox",
                  options: [
                    { label: "True", value: "true" },
                    { label: "False", value: "false" }
                  ]
                },
                example: "false",
              },
              {
                label: "Trending",
                key: "Tranding", // Note: There's a typo in your data key "Tranding" instead of "Trending"
                alternateMatches: ["is trending", "trending", "popular"],
                fieldType: {
                  type: "checkbox",
                  options: [
                    { label: "True", value: "true" },
                    { label: "False", value: "false" }
                  ]
                },
                example: "false",
              },
              {
                label: "Order ID",
                key: "OrderId",
                alternateMatches: ["order", "display order"],
                fieldType: { type: "input" },
                example: "1",
              },
              {
                label: "Common Bulk ID",
                key: "CommonBulkId",
                alternateMatches: ["bulk id", "common id"],
                fieldType: { type: "input" },
                example: "1",
              },
              {
                label: "Status",
                key: "Status",
                alternateMatches: ["active", "is active"],
                fieldType: {
                  type: "checkbox",
                  options: [
                    { label: "True", value: "true" },
                    { label: "False", value: "false" }
                  ]
                },
                example: "true",
              },
              {
                label: "Product Tag Title",
                key: "ProductTagTitle",
                alternateMatches: ["tag titles", "formatted tags"],
                fieldType: { type: "input" },
                example: "vitality, performance, natural, men-health, energy, booster",
              },
            ]}
          />
          <Button onClick={toggleIsOPen}>
            <Plus className="mx-2 h-4 w-4" />
            Import Products
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? "Update product details" : "Create a new product"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="title">Product Title *</Label>
                    <Input
                      id="title"
                      value={formData.Title}
                      onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                      required
                      placeholder="Enter product title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price *</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      value={formData.OriginalPrice}
                      onChange={(e) => setFormData({ ...formData, OriginalPrice: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="highPrice">High Price *</Label>
                    <Input
                      id="highPrice"
                      type="number"
                      step="0.01"
                      value={formData.HighPrice}
                      onChange={(e) => setFormData({ ...formData, HighPrice: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.Quantity}
                      onChange={(e) => setFormData({ ...formData, Quantity: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Select
                      value={formData.BrandId}
                      onValueChange={(value) => {
                        const brand = brands.find(b => b.BrandId.toString() === value);
                        setFormData({
                          ...formData,
                          BrandId: value,
                          BrandTitle: brand ? brand.Title : ""
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.BrandId} value={brand.BrandId.toString()}>
                            {brand.Title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.ProductCatId}
                      onValueChange={(value) => {
                        const category = categories.find(c => c.ProductCatId.toString() === value);
                        setFormData({
                          ...formData,
                          ProductCatId: value,
                          ProductCatTitle: category ? category.Title : "",
                          ProductSubCatId: "",
                          ProductSubCatTitle: ""
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.ProductCatId} value={category.ProductCatId.toString()}>
                            {category.Title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subCategory">Sub Category</Label>
                    <Select
                      value={formData.ProductSubCatId}
                      onValueChange={(value) => {
                        const subCategory = subCategories.find(sc => sc.ProductSubCatId.toString() === value);
                        setFormData({
                          ...formData,
                          ProductSubCatId: value,
                          ProductSubCatTitle: subCategory ? subCategory.Title : ""
                        });
                      }}
                      disabled={!formData.ProductCatId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.ProductCatId ? "Select sub category" : "Select category first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {subCategories.map((subCategory) => (
                          <SelectItem key={subCategory.ProductSubCatId} value={subCategory.ProductSubCatId.toString()}>
                            {subCategory.Title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Product Tags - Dropdown with Chips */}
                <div className="space-y-2">
                  <Label>Product Tags</Label>
                  <div className="space-y-2">
                    <Select onValueChange={handleTagSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tags" />
                      </SelectTrigger>
                      <SelectContent>
                        {tags
                          .filter(tag => !selectedTags.includes(tag.Title))
                          .map((tag) => (
                            <SelectItem key={tag.ProductTagId} value={tag.Title}>
                              {tag.Title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    {/* Selected Tags Chips */}
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTags.map((tag) => (
                          <div
                            key={tag}
                            className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-full text-sm"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:bg-primary-foreground hover:text-primary rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Image Upload */}
                <div className="space-y-4">
                  <Label>Main Product Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageUpload}
                      className="hidden"
                      id="main-image"
                    />
                    <Label htmlFor="main-image" className="cursor-pointer flex flex-col items-center">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="font-medium">Click to upload main image</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PNG, JPG, JPEG up to 10MB
                      </p>
                    </Label>
                  </div>

                  {/* Main Image Preview */}
                  {mainImagePreview && (
                    <div className="relative inline-block">
                      <img
                        src={mainImagePreview}
                        alt="Main product"
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={removeMainImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderId">Order ID</Label>
                    <Input
                      id="orderId"
                      value={formData.OrderId}
                      onChange={(e) => setFormData({ ...formData, OrderId: e.target.value })}
                      placeholder="Enter order ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="commonBulkId">Common Bulk ID</Label>
                    <Input
                      id="commonBulkId"
                      value={formData.CommonBulkId}
                      onChange={(e) => setFormData({ ...formData, CommonBulkId: e.target.value })}
                      placeholder="Enter common bulk ID"
                    />
                  </div>
                </div>

                {/* Additional Images Upload Section */}
                <div className="space-y-4">
                  <Label>Additional Product Images</Label>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="product-images"
                    />
                    <Label htmlFor="product-images" className="cursor-pointer flex flex-col items-center">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="font-medium">Click to upload additional images</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PNG, JPG, JPEG up to 10MB each
                      </p>
                    </Label>
                  </div>

                  {/* Image Previews */}
                  {(existingImages.length > 0 || imagePreviews.length > 0) && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {/* Existing Images */}
                      {existingImages.map((image) => (
                        <div key={image.ProductImageId} className="relative group">
                          <img
                            src={`${API_BASE_URL}/${image.Image}`}
                            alt="Product"
                            className="w-full h-24 object-cover rounded-md border"
                            // infinity issue
                            onError={(e) => {
                              // Fallback if image fails to load
                              e.currentTarget.src = '/placeholder-image.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeExistingImage(image.ProductImageId.toString())}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                            Existing
                          </div>
                        </div>
                      ))}

                      {/* New Image Previews */}
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeSelectedImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">
                            New
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Image Count Summary */}
                  {(existingImages.length > 0 || imagePreviews.length > 0) && (
                    <div className="text-sm text-muted-foreground">
                      {existingImages.length} existing image(s), {imagePreviews.length} new image(s) selected
                      {imagesToDelete.length > 0 && `, ${imagesToDelete.length} marked for deletion`}
                    </div>
                  )}
                </div>

                {/* Rich Text Editors */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Short Description</Label>
                    <ReactQuill
                      theme="snow"
                      value={formData.ShortDecription}
                      onChange={(value) => setFormData({ ...formData, ShortDecription: value })}
                      modules={quillModules}
                      placeholder="Enter short description..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Main Description 1</Label>
                    <ReactQuill
                      theme="snow"
                      value={formData.MainDecription1}
                      onChange={(value) => setFormData({ ...formData, MainDecription1: value })}
                      modules={quillModules}
                      placeholder="Enter main description 1..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Main Description 2</Label>
                    <ReactQuill
                      theme="snow"
                      value={formData.MainDecription2}
                      onChange={(value) => setFormData({ ...formData, MainDecription2: value })}
                      modules={quillModules}
                      placeholder="Enter main description 2..."
                    />
                  </div>
                </div>

                {/* Switches */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="combo"
                      checked={formData.Combo}
                      onCheckedChange={(checked) => setFormData({ ...formData, Combo: checked })}
                    />
                    <Label htmlFor="combo">Combo Product</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="tranding"
                      checked={formData.Tranding}
                      onCheckedChange={(checked) => setFormData({ ...formData, Tranding: checked })}
                    />
                    <Label htmlFor="tranding">Trending</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="status"
                      checked={formData.Status}
                      onCheckedChange={(checked) => setFormData({ ...formData, Status: checked })}
                    />
                    <Label htmlFor="status">Active Status</Label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading || !formData.Title || !formData.OriginalPrice || !formData.HighPrice || !formData.Quantity}
                  >
                    {isLoading ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* stock management */}
      <Dialog open={stockModalStatus} onOpenChange={setStockModalStatus}>
        <DialogTrigger asChild>
          <Button onClick={() => {
            setStockFormData({
              ProductId: "",
              Quantity: "",
              StockEntry: "IN",
              Remark: "",
              PreviousQuantity: 0
            });
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{"Stock Management"}</DialogTitle>
            <DialogDescription>
              {"Add or remove product stock"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockSubmit} className="space-y-4">

            {/* Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="productId">Product</Label>
              <Select
                value={stockFormData.ProductId}
                onValueChange={(value) => setStockFormData({ ...stockFormData, ProductId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.ProductId} value={product.ProductId.toString()}>
                      {product.Title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stock Entry Type - IN or OUT */}
            <div className="space-y-2">
              <Label>Stock Entry Type</Label>
              <div className="flex justify-between">
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroup
                      value={stockFormData.StockEntry}
                      onValueChange={(value) => setStockFormData({ ...stockFormData, StockEntry: value })}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="IN" id="in" />
                        <Label htmlFor="in">Stock In</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="OUT" id="out" />
                        <Label htmlFor="out">Stock Out</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <div>
                  <Label >Actual Stock : {productStockManage}</Label>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={stockFormData.Quantity}
                onChange={(e) => setStockFormData({ ...stockFormData, Quantity: parseInt(e.target.value) })}
                placeholder="Enter quantity"
                required
              />
            </div>

            {/* Previous Quantity - Hidden or Display Only */}
            <div className="space-y-2" style={{ display: 'none' }}>
              <Label htmlFor="previousQuantity">Previous Quantity</Label>
              <Input
                id="previousQuantity"
                type="number"
                value={stockFormData.PreviousQuantity}
                readOnly
              />
            </div>

            {/* Remark */}
            <div className="space-y-2">
              <Label htmlFor="remark">Remark (Optional)</Label>
              <Input
                id="remark"
                value={stockFormData.Remark || ""}
                onChange={(e) => setStockFormData({ ...stockFormData, Remark: e.target.value })}
                placeholder="Add a remark"
              />
            </div>

            <Button disabled={productStockManage <= 0} type="submit" className="w-full">
              Save Stock Entry
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Products Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Main Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Entry Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const productImage = getProductImage(product);
              
              return (
                <TableRow key={product.ProductId}>
                  <TableCell className="font-medium">{product.ProductId}</TableCell>
                  <TableCell>
                    {productImage ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={`${API_BASE_URL}/${productImage.Image}`} 
                          alt={product.Title}
                          className="w-10 h-10 object-cover rounded border"
                          // infinity issue
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.src = '/placeholder-image.jpg';
                          }}
                        />
                        {product.MainImage && (
                          <div className="text-xs text-blue-600 mt-1">
                            Main
                          </div>
                        )}
                        {!product.MainImage && product.ImagesData && product.ImagesData.length > 1 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            +{product.ImagesData.length - 1} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate">{product.Title}</TableCell>
                  <TableCell>{getBrandName(product)}</TableCell>
                  <TableCell>{getCategoryName(product)}</TableCell>
                  <TableCell className="max-w-xs truncate">{getTagNames(product.ProductTag)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm line-through text-muted-foreground">
                        ₹{product.HighPrice?.toFixed(2)}
                      </span>
                      <span className="font-medium text-green-600">
                        ₹{product.OriginalPrice?.toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{product.Quantity}</TableCell>
                  <TableCell>
                    <Switch
                      checked={product.Status}
                      onCheckedChange={() => handleStatusToggle(product)}
                    />
                  </TableCell>
                  <TableCell>
                    {product.EntryDate ? new Date(product.EntryDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          console.log('product1231', product)
                          stockModalToggle();
                          setStockFormData({
                            ...stockFormData,
                            ActualStock: product.CurrentStock,
                            ProductId: String(product.ProductId)
                          });
                        }}
                      >
                         <FilePenLine className="h-4 w-4"  />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.ProductId)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {products.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No products found. Create your first product to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { useToast } from "@/hooks/use-toast";
// import { Plus, Pencil, Trash2 } from "lucide-react";
// import { Switch } from "@/components/ui/switch";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

// // Static data
// const initialProducts = [
//   {
//     ProductId: 1,
//     Title: "Paracetamol 500mg",
//     OriginalPrice: 50.00,
//     HighPrice: 80.00,
//     ShortDescription: "<p>Effective pain relief medication</p>",
//     MainDescription1: "<p>Paracetamol is used for pain relief and fever reduction.</p>",
//     MainDescription2: "<p>Take as directed by physician. Store in cool dry place.</p>",
//     Quantity: 100,
//     Status: true,
//     EntryDate: "2024-01-15",
//   },
// ];

// const Products = () => {
//   const [products, setProducts] = useState(initialProducts);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<any>(null);
//   const [formData, setFormData] = useState({
//     Title: "",
//     OriginalPrice: "",
//     HighPrice: "",
//     ShortDescription: "",
//     MainDescription1: "",
//     MainDescription2: "",
//     Quantity: "",
//     Status: true,
//   });
//   const { toast } = useToast();

//   const quillModules = {
//     toolbar: [
//       [{ header: [1, 2, 3, false] }],
//       ["bold", "italic", "underline", "strike"],
//       [{ list: "ordered" }, { list: "bullet" }],
//       [{ color: [] }, { background: [] }],
//       ["link"],
//       ["clean"],
//     ],
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // TODO: Replace with API call
    
//     if (editingProduct) {
//       setProducts(products.map(product => 
//         product.ProductId === editingProduct.ProductId 
//           ? { 
//               ...product, 
//               ...formData,
//               OriginalPrice: parseFloat(formData.OriginalPrice),
//               HighPrice: parseFloat(formData.HighPrice),
//               Quantity: parseInt(formData.Quantity),
//               EntryDate: product.EntryDate 
//             }
//           : product
//       ));
//       toast({ title: "Product updated successfully" });
//     } else {
//       const newProduct = {
//         ProductId: products.length + 1,
//         ...formData,
//         OriginalPrice: parseFloat(formData.OriginalPrice),
//         HighPrice: parseFloat(formData.HighPrice),
//         Quantity: parseInt(formData.Quantity),
//         EntryDate: new Date().toISOString().split('T')[0],
//       };
//       setProducts([...products, newProduct]);
//       toast({ title: "Product created successfully" });
//     }

//     setIsDialogOpen(false);
//     setEditingProduct(null);
//     setFormData({
//       Title: "",
//       OriginalPrice: "",
//       HighPrice: "",
//       ShortDescription: "",
//       MainDescription1: "",
//       MainDescription2: "",
//       Quantity: "",
//       Status: true,
//     });
//   };

//   const handleEdit = (product: any) => {
//     setEditingProduct(product);
//     setFormData({
//       Title: product.Title,
//       OriginalPrice: product.OriginalPrice.toString(),
//       HighPrice: product.HighPrice.toString(),
//       ShortDescription: product.ShortDescription,
//       MainDescription1: product.MainDescription1,
//       MainDescription2: product.MainDescription2,
//       Quantity: product.Quantity.toString(),
//       Status: product.Status,
//     });
//     setIsDialogOpen(true);
//   };

//   const handleDelete = (id: number) => {
//     // TODO: Replace with API call
//     setProducts(products.filter(product => product.ProductId !== id));
//     toast({ title: "Product deleted successfully" });
//   };

//   const handleStatusToggle = (id: number) => {
//     // TODO: Replace with API call
//     setProducts(products.map(product =>
//       product.ProductId === id ? { ...product, Status: !product.Status } : product
//     ));
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Product Management</h1>
//           <p className="text-muted-foreground">Manage pharma products</p>
//         </div>
//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogTrigger asChild>
//             <Button onClick={() => {
//               setEditingProduct(null);
//               setFormData({
//                 Title: "",
//                 OriginalPrice: "",
//                 HighPrice: "",
//                 ShortDescription: "",
//                 MainDescription1: "",
//                 MainDescription2: "",
//                 Quantity: "",
//                 Status: true,
//               });
//             }}>
//               <Plus className="mr-2 h-4 w-4" />
//               Add Product
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
//               <DialogDescription>
//                 {editingProduct ? "Update product details" : "Create a new product"}
//               </DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2 col-span-2">
//                   <Label htmlFor="title">Product Title</Label>
//                   <Input
//                     id="title"
//                     value={formData.Title}
//                     onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="originalPrice">Original Price</Label>
//                   <Input
//                     id="originalPrice"
//                     type="number"
//                     step="0.01"
//                     value={formData.OriginalPrice}
//                     onChange={(e) => setFormData({ ...formData, OriginalPrice: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="highPrice">High Price</Label>
//                   <Input
//                     id="highPrice"
//                     type="number"
//                     step="0.01"
//                     value={formData.HighPrice}
//                     onChange={(e) => setFormData({ ...formData, HighPrice: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="quantity">Quantity</Label>
//                   <Input
//                     id="quantity"
//                     type="number"
//                     value={formData.Quantity}
//                     onChange={(e) => setFormData({ ...formData, Quantity: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Switch
//                     id="status"
//                     checked={formData.Status}
//                     onCheckedChange={(checked) => setFormData({ ...formData, Status: checked })}
//                   />
//                   <Label htmlFor="status">Active Status</Label>
//                 </div>
//                 <div className="space-y-2 col-span-2">
//                   <Label>Short Description</Label>
//                   <ReactQuill
//                     theme="snow"
//                     value={formData.ShortDescription}
//                     onChange={(value) => setFormData({ ...formData, ShortDescription: value })}
//                     modules={quillModules}
//                   />
//                 </div>
//                 <div className="space-y-2 col-span-2">
//                   <Label>Main Description 1</Label>
//                   <ReactQuill
//                     theme="snow"
//                     value={formData.MainDescription1}
//                     onChange={(value) => setFormData({ ...formData, MainDescription1: value })}
//                     modules={quillModules}
//                   />
//                 </div>
//                 <div className="space-y-2 col-span-2">
//                   <Label>Main Description 2</Label>
//                   <ReactQuill
//                     theme="snow"
//                     value={formData.MainDescription2}
//                     onChange={(value) => setFormData({ ...formData, MainDescription2: value })}
//                     modules={quillModules}
//                   />
//                 </div>
//               </div>
//               <Button type="submit" className="w-full">
//                 {editingProduct ? "Update" : "Create"}
//               </Button>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <div className="border rounded-lg overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>ID</TableHead>
//               <TableHead>Title</TableHead>
//               <TableHead>Original Price</TableHead>
//               <TableHead>High Price</TableHead>
//               <TableHead>Quantity</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Entry Date</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {products.map((product) => (
//               <TableRow key={product.ProductId}>
//                 <TableCell>{product.ProductId}</TableCell>
//                 <TableCell>{product.Title}</TableCell>
//                 <TableCell>₹{product.OriginalPrice.toFixed(2)}</TableCell>
//                 <TableCell>₹{product.HighPrice.toFixed(2)}</TableCell>
//                 <TableCell>{product.Quantity}</TableCell>
//                 <TableCell>
//                   <Switch
//                     checked={product.Status}
//                     onCheckedChange={() => handleStatusToggle(product.ProductId)}
//                   />
//                 </TableCell>
//                 <TableCell>{product.EntryDate}</TableCell>
//                 <TableCell className="text-right">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => handleEdit(product)}
//                   >
//                     <Pencil className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => handleDelete(product.ProductId)}
//                   >
//                     <Trash2 className="h-4 w-4 text-destructive" />
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// };

// export default Products;
