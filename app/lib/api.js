const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ============================================
// TEMPLATES
// ============================================
export const getTemplates = async (category) => {
  const url = category
    ? `${API_URL}/api/templates/category/${category}`
    : `${API_URL}/api/templates`;

  const res = await fetch(url);
  return res.json();
};

// ============================================
// UPLOAD PHOTOS — exactly 4
// ============================================
export const uploadPhotos = async (files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('photos', file));

  const res = await fetch(`${API_URL}/api/upload/photos`, {
    method: 'POST',
    body: formData
  });

  return res.json();
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

  return res.json();
};

// ============================================
// GET ORDER STATUS
// ============================================
export const getOrderStatus = async (orderId) => {
  const res = await fetch(`${API_URL}/api/orders/${orderId}/status`);
  return res.json();
};