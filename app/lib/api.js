const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ============================================
// TEMPLATES
// ============================================
export const getTemplates = async (category) => {
  const url = category
    ? `${API_URL}/api/templates/category/${category}`
    : `${API_URL}/api/templates`;

  const res = await fetch(url);
  const data = await res.json();
  return data;
};

// ============================================
// UPLOAD PHOTOS
// ============================================
export const uploadPhotos = async (files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('photos', file));

  const res = await fetch(`${API_URL}/api/upload/photos`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  return data;
};

// ============================================
// CREATE ORDER
// ============================================
export const createOrder = async (orderData) => {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });

  const data = await res.json();
  return data;
};

// ============================================
// GET ORDER STATUS
// ============================================
export const getOrderStatus = async (orderId) => {
  const res = await fetch(`${API_URL}/api/orders/${orderId}/status`);
  const data = await res.json();
  return data;
};