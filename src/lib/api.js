const API_BASE_URL = "http://localhost:3001";

const getToken = () => {
  return localStorage.getItem('adminToken');
};

// Helper function to make API calls with authentication
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = getToken();
    
    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // If unauthorized, redirect to login
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();

    // Check if HTTP failed or the API indicates failure
    if (!response.ok || data.success === false) {
      const message = data?.message || response.statusText || "Unknown API error";
      const status = data?.status || response.status;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Admin APIs - Add login endpoint
export const adminAPI = {
  list: () => apiCall("/admin/list"),
  create: (data) => apiCall("/admin/create", { method: "POST", body: JSON.stringify(data) }),
  update: (data) => apiCall("/admin/update", { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/admin/delete?AdminId=${id}`, { method: "DELETE" }),
  login: (data) => apiCall("/admin/login", { method: "POST", body: JSON.stringify(data) }),
};


// User APIs
export const userAPI = {
  list: () => apiCall("/user/list"),
  create: (data) => apiCall("/user/create", { method: "POST", body: JSON.stringify(data) }),
  update: (data) => apiCall("/user/update", { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/user/delete?UserId=${id}`, { method: "DELETE"}),
  getById: (id) => apiCall(`/user/byid/${id}`),
  checkEmailAvailability: (email, userId = null) => {
    let url = `/user/check_email_availability?RegisterEmail=${encodeURIComponent(email)}`;
    if (userId) {
      url += `&UserId=${userId}`;
    }
    return apiCall(url);
  },
  checkUsernameAvailability: (username, userId = null) => {
    let url = `/user/check_username_availability?UserName=${encodeURIComponent(username)}`;
    if (userId) {
      url += `&UserId=${userId}`;
    }
    return apiCall(url);
  },
};

// User Address APIs
export const userAddressAPI = {
  list: () => apiCall("/user_address/list"),
  create: (data) => apiCall("/user_address/create", { method: "POST", body: JSON.stringify(data) }),
  update: (data) => apiCall("/user_address/update", { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/user_address/delete?UserAddressId=${id}`, { method: "DELETE" }),
  getById: (id) => apiCall(`/user_address/byid/${id}`),
};

// Product Category APIs
export const productCategoryAPI = {
  list: () => apiCall("/product_category/list"),
  create: (data) => apiCall("/product_category/create", { method: "POST", body: JSON.stringify(data) }),
  update: (data) => apiCall("/product_category/update", { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/product_category/delete?ProductCatId=${id}`, { method: "DELETE", body: JSON.stringify({ ProductCatId: id }) }),
};

// Product Sub Category APIs
export const productSubCategoryAPI = {
  list: () => apiCall("/product_sub_category/list"),
  create: (data) => apiCall("/product_sub_category/create", { method: "POST", body: JSON.stringify(data) }),
  update: (data) => apiCall("/product_sub_category/update", { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/product_sub_category/delete?ProductSubCatId=${id}`, { method: "DELETE"}),
};

// Products Tag APIs
export const productsTagAPI = {
  list: () => apiCall("/products_tag/list"),
  create: (data) => apiCall("/products_tag/create", { method: "POST", body: JSON.stringify(data) }),
  update: (data) => apiCall("/products_tag/update", { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/products_tag/delete?ProductTagId=${id}`, { method: "DELETE" }),
};

// Product APIs (add this to your api.js)
// Product APIs
export const productAPI = {
  list: () => apiCall("/product/list"),
  create: (formData) => fetch(`${API_BASE_URL}/product/create`, { 
    method: "POST", 
    body: formData 
  }),
  update: (formData) => fetch(`${API_BASE_URL}/product/update`, { 
    method: "PUT", 
    body: formData 
  }),
  delete: (id) => apiCall(`/product/delete?ProductId=${id}`, { method: "DELETE"}),
  getById: (id) => apiCall(`/product/byid/${id}`),
  getImages: (id) => apiCall(`/product/images?ProductId=${id}`),
};

// Products Review APIs
export const productsReviewAPI = {
  list: () => apiCall("/products_review/list"),
  create: (data) => apiCall("/products_review/create", { method: "POST", body: JSON.stringify(data) }),
  update: (data) => apiCall("/products_review/update", { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/products_review/delete?ProductReviewId=${id}`, { method: "DELETE"}),
};

// Carousel APIs
export const carouselAPI = {
  list: () => apiCall("/carousel/list"),
  create: (formData) => fetch(`${API_BASE_URL}/carousel/create`, { method: "POST", body: formData }),
  update: (formData) => fetch(`${API_BASE_URL}/carousel/update`, { method: "PUT", body: formData }),
  delete: (id) => apiCall(`/carousel/delete?CarouselId=${id}`, { method: "DELETE"}),
};

// Brand APIs
export const brandAPI = {
  list: () => apiCall("/brand/list"),
  create: (formData) => fetch(`${API_BASE_URL}/brand/create`, { method: "POST", body: formData }),
  update: (formData) => fetch(`${API_BASE_URL}/brand/update`, { method: "PUT", body: formData }),
  delete: (id) => apiCall(`/brand/delete?BrandId=${id}`, { method: "DELETE" }),
};
