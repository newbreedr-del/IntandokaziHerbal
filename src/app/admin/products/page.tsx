"use client";



import { useState, useEffect } from "react";

import { useSession } from "next-auth/react";

import { useRouter } from "next/navigation";

import { 

  Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, 

  Upload, Image as ImageIcon, Package, DollarSign, 

  TrendingUp, AlertCircle, CheckCircle, X

} from "lucide-react";

import Button from "@/components/ui/Button";

import Modal from "@/components/Modal";

import toast from "react-hot-toast";



interface Product {

  id: string;

  sku: string;

  name: string;

  slug: string;

  category: string;

  price: number;

  unit: string;

  stock_quantity: number;

  description?: string;

  short_description?: string;

  long_description?: string;

  is_active: boolean;

  is_featured: boolean;

  image_url: string;

  created_at: string;

}



export default function AdminProductsPage() {

  const { data: session, status } = useSession();

  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("active");

  const [showAddModal, setShowAddModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [categories, setCategories] = useState<string[]>([]);



  useEffect(() => {

    if (status === "unauthenticated") {

      router.push("/admin/login");

    } else if (status === "authenticated") {

      fetchProducts();

    }

  }, [status, router, categoryFilter, statusFilter, searchQuery]);



  const fetchProducts = async () => {

    try {

      setLoading(true);

      const params = new URLSearchParams();

      if (categoryFilter !== "all") params.append("category", categoryFilter);

      if (statusFilter !== "all") params.append("status", statusFilter);

      if (searchQuery) params.append("search", searchQuery);



      const response = await fetch(`/api/admin/products?${params}`);

      const data = await response.json();



      if (response.ok) {

        setProducts(data.products || []);

        

        // Extract unique categories

        const uniqueCategories = Array.from(

          new Set(data.products.map((p: Product) => p.category))

        );

        setCategories(uniqueCategories as string[]);

      } else {

        toast.error(data.error || "Failed to fetch products");

        // If it's a 404, retry once after a delay

        if (response.status === 404) {

          setTimeout(() => {

            fetchProducts();

          }, 2000);

        }

      }

    } catch (error) {

      console.error("Error fetching products:", error);

      toast.error("Failed to load products");

    } finally {

      setLoading(false);

    }

  };



  const handleDeleteProduct = async (id: string) => {

    if (!confirm("Are you sure you want to delete this product?")) return;



    try {

      const response = await fetch(`/api/admin/products?id=${id}`, {

        method: "DELETE",

      });



      if (response.ok) {

        toast.success("Product deleted successfully");

        fetchProducts();

      } else {

        const data = await response.json();

        toast.error(data.error || "Failed to delete product");

      }

    } catch (error) {

      console.error("Error deleting product:", error);

      toast.error("Failed to delete product");

    }

  };



  const handleToggleActive = async (product: Product) => {

    try {

      const response = await fetch("/api/admin/products", {

        method: "PUT",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          id: product.id,

          is_active: !product.is_active,

        }),

      });



      if (response.ok) {

        toast.success(`Product ${!product.is_active ? "activated" : "deactivated"}`);

        fetchProducts();

      } else {

        const data = await response.json();

        toast.error(data.error || "Failed to update product");

      }

    } catch (error) {

      console.error("Error updating product:", error);

      toast.error("Failed to update product");

    }

  };



  const handleToggleFeatured = async (product: Product) => {

    try {

      const response = await fetch("/api/admin/products", {

        method: "PUT",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          id: product.id,

          is_featured: !product.is_featured,

        }),

      });



      if (response.ok) {

        toast.success(`Product ${!product.is_featured ? "marked as featured" : "removed from featured"}`);

        fetchProducts();

      } else {

        const data = await response.json();

        toast.error(data.error || "Failed to update product");

      }

    } catch (error) {

      console.error("Error updating product:", error);

      toast.error("Failed to update product");

    }

  };



  const stats = {

    total: products.length,

    active: products.filter(p => p.is_active).length,

    lowStock: products.filter(p => p.stock_quantity < 5).length,

    featured: products.filter(p => p.is_featured).length,

  };



  if (status === "loading" || loading) {

    return (

      <div className="flex items-center justify-center min-h-screen">

        <div className="animate-spin w-12 h-12 border-4 border-brand-300 border-t-brand-600 rounded-full"></div>

      </div>

    );

  }



  return (

    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}

      <div className="flex items-center justify-between mb-6">

        <div>

          <h1 className="text-3xl font-bold text-brand-900">Products</h1>

          <p className="text-brand-600 mt-1">Manage your product catalog</p>

        </div>

        <Button

          onClick={() => setShowAddModal(true)}

          className="flex items-center gap-2"

        >

          <Plus className="w-4 h-4" />

          Add Product

        </Button>

      </div>



      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        <div className="bg-white rounded-xl p-4 border border-gray-200">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-600">Total Products</p>

              <p className="text-2xl font-bold text-brand-900">{stats.total}</p>

            </div>

            <Package className="w-8 h-8 text-brand-600" />

          </div>

        </div>



        <div className="bg-white rounded-xl p-4 border border-gray-200">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-600">Active</p>

              <p className="text-2xl font-bold text-green-600">{stats.active}</p>

            </div>

            <CheckCircle className="w-8 h-8 text-green-600" />

          </div>

        </div>



        <div className="bg-white rounded-xl p-4 border border-gray-200">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-600">Low Stock</p>

              <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>

            </div>

            <AlertCircle className="w-8 h-8 text-orange-600" />

          </div>

        </div>



        <div className="bg-white rounded-xl p-4 border border-gray-200">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-600">Featured</p>

              <p className="text-2xl font-bold text-purple-600">{stats.featured}</p>

            </div>

            <TrendingUp className="w-8 h-8 text-purple-600" />

          </div>

        </div>

      </div>



      {/* Filters */}

      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="relative">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input

              type="text"

              placeholder="Search products..."

              value={searchQuery}

              onChange={(e) => setSearchQuery(e.target.value)}

              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"

            />

          </div>



          <select

            value={categoryFilter}

            onChange={(e) => setCategoryFilter(e.target.value)}

            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"

          >

            <option value="all">All Categories</option>

            {categories.map((cat) => (

              <option key={cat} value={cat}>{cat}</option>

            ))}

          </select>



          <select

            value={statusFilter}

            onChange={(e) => setStatusFilter(e.target.value)}

            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"

          >

            <option value="all">All Status</option>

            <option value="active">Active</option>

            <option value="inactive">Inactive</option>

          </select>

        </div>

      </div>



      {/* Products Table */}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50 border-b border-gray-200">

              <tr>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                  Product

                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                  SKU

                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                  Category

                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                  Price

                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                  Stock

                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                  Featured

                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                  Status

                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">

                  Actions

                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-200">

              {products.length === 0 ? (

                <tr>

                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">

                    No products found

                  </td>

                </tr>

              ) : (

                products.map((product) => (

                  <tr key={product.id} className="hover:bg-gray-50">

                    <td className="px-6 py-4 whitespace-nowrap">

                      <div className="flex items-center gap-3">

                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">

                          {product.image_url ? (

                            <img

                              src={product.image_url}

                              alt={product.name}

                              className="w-full h-full object-cover"

                            />

                          ) : (

                            <ImageIcon className="w-6 h-6 text-gray-400" />

                          )}

                        </div>

                        <div>

                          <p className="font-medium text-brand-900">{product.name}</p>

                          {product.is_featured && (

                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">

                              Featured

                            </span>

                          )}

                        </div>

                      </div>

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">

                      {product.sku || "-"}

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">

                      {product.category}

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-900">

                      R{product.price.toFixed(2)}

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">

                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${

                        product.stock_quantity < 5

                          ? "bg-red-100 text-red-800"

                          : product.stock_quantity < 10

                          ? "bg-orange-100 text-orange-800"

                          : "bg-green-100 text-green-800"

                      }`}>

                        {product.stock_quantity} units

                      </span>

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">

                      <button

                        onClick={() => handleToggleFeatured(product)}

                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${

                          product.is_featured

                            ? "bg-purple-100 text-purple-800 hover:bg-purple-200"

                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"

                        }`}

                      >

                        {product.is_featured ? (

                          <>

                            <TrendingUp className="w-3 h-3" />

                            Featured

                          </>

                        ) : (

                          <>

                            <TrendingUp className="w-3 h-3" />

                            Not Featured

                          </>

                        )}

                      </button>

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">

                      <button

                        onClick={() => handleToggleActive(product)}

                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${

                          product.is_active

                            ? "bg-green-100 text-green-800 hover:bg-green-200"

                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"

                        }`}

                      >

                        {product.is_active ? (

                          <>

                            <Eye className="w-3 h-3" />

                            Active

                          </>

                        ) : (

                          <>

                            <EyeOff className="w-3 h-3" />

                            Inactive

                          </>

                        )}

                      </button>

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                      <div className="flex items-center justify-end gap-2">

                        <button

                          onClick={() => setEditingProduct(product)}

                          className="text-brand-600 hover:text-brand-900"

                        >

                          <Edit className="w-4 h-4" />

                        </button>

                        <button

                          onClick={() => handleDeleteProduct(product.id)}

                          className="text-red-600 hover:text-red-900"

                        >

                          <Trash2 className="w-4 h-4" />

                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>



      {/* Add/Edit Product Modal */}

      {(showAddModal || editingProduct) && (

        <ProductFormModal

          product={editingProduct}

          onClose={() => {

            setShowAddModal(false);

            setEditingProduct(null);

          }}

          onSuccess={() => {

            setShowAddModal(false);

            setEditingProduct(null);

            fetchProducts();

          }}

        />

      )}

    </div>

  );

}



// Product Form Modal Component

function ProductFormModal({

  product,

  onClose,

  onSuccess,

}: {

  product: Product | null;

  onClose: () => void;

  onSuccess: () => void;

}) {

  const [formData, setFormData] = useState({

    name: product?.name || "",

    slug: product?.slug || "",

    sku: product?.sku || "",

    category: product?.category || "Internal Health",

    price: product?.price || 0,

    stock_quantity: product?.stock_quantity || 0,

    description: product?.description || product?.short_description || "",

    long_description: product?.long_description || "",

    unit: product?.unit || "500ml",

    is_active: product?.is_active ?? true,

    is_featured: product?.is_featured ?? false,

  });



  const CATEGORIES = [

    "Internal Health",

    "Traditional Healing", 

    "Skin & Body",

    "Wellness & Spiritual",

    "Beauty",

    "Protection",

  ];



  const UNITS = ["500ml", "1L", "250ml", "100g", "250g", "500g"];

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState<string>(product?.image_url || "");

  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);



  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (file) {

      setImageFile(file);

      const reader = new FileReader();

      reader.onloadend = () => {

        setImagePreview(reader.result as string);

      };

      reader.readAsDataURL(file);

    }

  };



  const generateSlug = (name: string) => {

    return name

      .toLowerCase()

      .replace(/[^a-z0-9]+/g, "-")

      .replace(/^-|-$/g, "");

  };



  const generateSKU = (name: string, category: string, unit: string) => {

    const categoryPrefix = category.split(" ").map(w => w[0]).join("").toUpperCase();

    const namePrefix = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

    return `${categoryPrefix}-${namePrefix}-${unit.replace(/[^a-zA-Z0-9]/g, "")}`;

  };



  // Auto-generate slug and SKU when name changes

  const handleNameChange = (name: string) => {

    setFormData(prev => ({

      ...prev,

      name,

      slug: generateSlug(name),

      sku: generateSKU(name, prev.category, prev.unit),

    }));

  };



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setSaving(true);



    try {

      // Upload image first if there's a new one

      if (imageFile && formData.slug) {

        setUploading(true);

        const imageFormData = new FormData();

        imageFormData.append("file", imageFile);

        imageFormData.append("slug", formData.slug);

        imageFormData.append("imageType", "main");



        const uploadResponse = await fetch("/api/admin/products/upload-image", {

          method: "POST",

          body: imageFormData,

        });



        if (!uploadResponse.ok) {

          throw new Error("Failed to upload image");

        }

        setUploading(false);

      }



      // Save product - map form fields to database schema

      const url = "/api/admin/products";

      const method = product ? "PUT" : "POST";

      const productData = {

        ...formData,

        short_description: formData.description, // Map to short_description for database

        // description field is required by API, keep it

      };

      const body = product

        ? { id: product.id, ...productData }

        : productData;



      const response = await fetch(url, {

        method,

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(body),

      });



      if (response.ok) {

        toast.success(`Product ${product ? "updated" : "created"} successfully`);

        onSuccess();

        // Force a refresh after a short delay to ensure the new product appears

        setTimeout(() => {

          window.location.reload();

        }, 1000);

      } else {

        const data = await response.json();

        toast.error(data.error || "Failed to save product");

      }

    } catch (error) {

      console.error("Error saving product:", error);

      toast.error("Failed to save product");

    } finally {

      setSaving(false);

      setUploading(false);

    }

  };



  return (

    <Modal 

      isOpen={true}

      onClose={onClose}

      title={product ? "Edit Product" : "Add New Product"}

      size="xl"

    >

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Image Upload */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">

              Product Image

            </label>

            <div className="flex items-center gap-4">

              <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">

                {imagePreview ? (

                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />

                ) : (

                  <ImageIcon className="w-12 h-12 text-gray-400" />

                )}

              </div>

              <div className="flex-1">

                <input

                  type="file"

                  accept="image/*"

                  onChange={handleImageChange}

                  className="hidden"

                  id="image-upload"

                />

                <label

                  htmlFor="image-upload"

                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 cursor-pointer"

                >

                  <Upload className="w-4 h-4" />

                  Choose Image

                </label>

                <p className="text-xs text-gray-500 mt-2">

                  Image will be named: {formData.slug || "product-slug"}.jpg

                </p>

              </div>

            </div>

          </div>



          {/* Basic Info */}

          <div className="grid grid-cols-2 gap-4">

            <div className="col-span-2">

              <label className="block text-sm font-medium text-gray-700 mb-1">

                Product Name *

              </label>

              <input

                type="text"

                required

                placeholder="e.g., Imbiza Yamadoda"

                value={formData.name}

                onChange={(e) => handleNameChange(e.target.value)}

                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"

              />

              <p className="text-xs text-gray-500 mt-1">The name of your product as customers will see it</p>

              {/* Hidden slug field to ensure it's submitted */}

              <input

                type="hidden"

                name="slug"

                value={formData.slug}

              />

            </div>



            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">

                Product Code (auto-generated)

              </label>

              <input

                type="text"

                value={formData.sku}

                readOnly

                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"

              />

              <p className="text-xs text-gray-500 mt-1">Automatically created from product name</p>

            </div>



            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">

                Size/Unit *

              </label>

              <select

                required

                value={formData.unit}

                onChange={(e) => {

                  const newUnit = e.target.value;

                  setFormData(prev => ({

                    ...prev,

                    unit: newUnit,

                    sku: generateSKU(prev.name, prev.category, newUnit),

                  }));

                }}

                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"

              >

                {UNITS.map(unit => (

                  <option key={unit} value={unit}>{unit}</option>

                ))}

              </select>

            </div>



            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">

                Category *

              </label>

              <select

                required

                value={formData.category}

                onChange={(e) => {

                  const newCategory = e.target.value;

                  setFormData(prev => ({

                    ...prev,

                    category: newCategory,

                    sku: generateSKU(prev.name, newCategory, prev.unit),

                  }));

                }}

                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"

              >

                {CATEGORIES.map(cat => (

                  <option key={cat} value={cat}>{cat}</option>

                ))}

              </select>

              <p className="text-xs text-gray-500 mt-1">Select the type of product</p>

            </div>



            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">

                Price (R) *

              </label>

              <input

                type="number"

                required

                step="0.01"

                min="0"

                placeholder="800"

                value={formData.price}

                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}

                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"

              />

              <p className="text-xs text-gray-500 mt-1">Price in South African Rand</p>

            </div>



            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">

                Stock Quantity

              </label>

              <input

                type="number"

                min="0"

                placeholder="25"

                value={formData.stock_quantity}

                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}

                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"

              />

              <p className="text-xs text-gray-500 mt-1">How many units you have in stock</p>

            </div>



            <div className="col-span-2">

              <label className="block text-sm font-medium text-gray-700 mb-1">

                Short Description

              </label>

              <textarea

                rows={2}

                placeholder="Brief description for product cards (1-2 sentences)"

                value={formData.description}

                onChange={(e) => setFormData({ ...formData, description: e.target.value })}

                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"

              />

              <p className="text-xs text-gray-500 mt-1">Appears on product listings and cards</p>

            </div>



            <div className="col-span-2">

              <label className="block text-sm font-medium text-gray-700 mb-1">

                Full Description

              </label>

              <textarea

                rows={4}

                placeholder="Detailed description of the product, its benefits, and how to use it"

                value={formData.long_description}

                onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}

                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"

              />

              <p className="text-xs text-gray-500 mt-1">Full product details shown on product page</p>

            </div>



            <div>

              <label className="flex items-center gap-2">

                <input

                  type="checkbox"

                  checked={formData.is_active}

                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}

                  className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"

                />

                <span className="text-sm font-medium text-gray-700">Active (visible to customers)</span>

              </label>

            </div>



            <div>

              <label className="flex items-center gap-2">

                <input

                  type="checkbox"

                  checked={formData.is_featured}

                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}

                  className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"

                />

                <span className="text-sm font-medium text-gray-700">Featured (show on homepage)</span>

              </label>

            </div>

          </div>



          {/* Actions */}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">

            <Button type="button" variant="secondary" onClick={onClose}>

              Cancel

            </Button>

            <Button type="submit" loading={saving || uploading}>

              {uploading ? "Uploading..." : saving ? "Saving..." : product ? "Update Product" : "Create Product"}

            </Button>

          </div>

        </form>

    </Modal>

  );

}

