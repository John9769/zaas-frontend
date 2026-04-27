'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getTemplates, uploadPhotos, createOrder } from './lib/api';

// ============================================
// STEP CONSTANTS
// ============================================
const STEP_LANDING = 'landing';
const STEP_CATEGORY = 'category';
const STEP_UPLOAD = 'upload';
const STEP_TEMPLATE = 'template';
const STEP_HERO = 'hero';
const STEP_EMAIL = 'email';
const STEP_CONFIRM = 'confirm';

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(STEP_LANDING);
  const [category, setCategory] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [heroPublicId, setHeroPublicId] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qualityWarning, setQualityWarning] = useState(null);
  const [location, setLocation] = useState(null);

  // ============================================
  // GET LOCATION
  // ============================================
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            granted: true
          });
        },
        () => setLocation({ granted: false })
      );
    }
  };

  // ============================================
  // HANDLE CATEGORY SELECT
  // ============================================
  const handleCategorySelect = async (cat) => {
    setCategory(cat);
    setLoading(true);
    try {
      const res = await getTemplates(cat);
      if (res.success) setTemplates(res.data);
    } catch (err) {
      setError('Failed to load templates');
    }
    setLoading(false);
    setStep(STEP_UPLOAD);
  };

  // ============================================
  // HANDLE FILE SELECT
  // ============================================
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      setError('Maximum 10 photos allowed');
      return;
    }
    setError(null);
    setUploadedFiles(files);
  };

  // ============================================
  // HANDLE UPLOAD
  // ============================================
  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please select at least 1 photo');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await uploadPhotos(uploadedFiles);
      if (res.success) {
        setUploadedPhotos(res.data.photos);
        if (res.data.quality_warning) setQualityWarning(res.data.quality_warning);
        setStep(STEP_TEMPLATE);
      } else {
        setError(res.message || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    }
    setLoading(false);
  };

  // ============================================
  // HANDLE TEMPLATE SELECT
  // ============================================
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setStep(STEP_HERO);
  };

  // ============================================
  // HANDLE HERO SELECT
  // ============================================
  const handleHeroSelect = (publicId) => {
    setHeroPublicId(publicId);
    setStep(STEP_EMAIL);
    getLocation();
  };

  // ============================================
  // HANDLE ORDER SUBMIT
  // ============================================
  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await createOrder({
        template_id: selectedTemplate.id,
        guest_email: email,
        photos: uploadedPhotos,
        hero_public_id: heroPublicId,
        user_lat: location?.lat || null,
        user_lng: location?.lng || null,
        user_city: null,
        location_granted: location?.granted || false
      });

      if (res.success) {
        router.push(`/order/${res.data.order_id}`);
      } else {
        setError(res.message || 'Failed to create order');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <main style={{ minHeight: '100vh', background: '#050505' }}>

      {/* ── LANDING ── */}
      {step === STEP_LANDING && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

          {/* Hero Section */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            textAlign: 'center',
            background: 'radial-gradient(ellipse at top, #0a0a1a 0%, #050505 70%)'
          }}>

            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f5c51815',
              border: '1px solid #f5c51840',
              borderRadius: '100px',
              padding: '6px 16px',
              marginBottom: '32px'
            }}>
              <span style={{ fontSize: '12px', color: '#f5c518', fontWeight: 600, letterSpacing: '1px' }}>
                ✦ AI-POWERED • MALAYSIA'S FIRST
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(36px, 7vw, 80px)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '24px',
              letterSpacing: '-2px'
            }}>
              Your Photos,
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #f5c518 0%, #ff6b35 50%, #f5c518 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shimmer 3s linear infinite'
              }}>
                Cinematic Videos.
              </span>
            </h1>

            {/* Subheadline */}
            <p style={{
              fontSize: 'clamp(16px, 2.5vw, 22px)',
              color: '#888899',
              maxWidth: '600px',
              lineHeight: 1.7,
              marginBottom: '48px'
            }}>
              Upload up to 10 photos. Choose a template. Get a stunning cinematic video in minutes.
              <br />
              <span style={{ color: '#ffffff' }}>From RM12.99 only.</span>
            </p>

            {/* CTA Button */}
            <button
              onClick={() => setStep(STEP_CATEGORY)}
              style={{
                background: 'linear-gradient(135deg, #f5c518, #ff6b35)',
                color: '#000',
                border: 'none',
                borderRadius: '16px',
                padding: '20px 48px',
                fontSize: '18px',
                fontWeight: 800,
                cursor: 'pointer',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}
            >
              🎬 Create My Video Now
            </button>

            <p style={{ color: '#555566', fontSize: '14px' }}>
              No subscription. Pay once. Download forever (30 days).
            </p>
          </div>

          {/* How It Works */}
          <div style={{
            background: '#0a0a0f',
            padding: '80px 20px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#f5c518', fontSize: '12px', fontWeight: 600, letterSpacing: '2px', marginBottom: '16px' }}>
              HOW IT WORKS
            </p>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, marginBottom: '60px' }}>
              3 Steps. Done.
            </h2>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '24px',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              {[
                { step: '01', icon: '📸', title: 'Upload Photos', desc: 'Select up to 10 photos from your phone or gallery. Weddings, birthdays, travel, products — anything.' },
                { step: '02', icon: '🎨', title: 'Choose Template', desc: 'Pick from personal or business templates. Each one is crafted for a specific mood and purpose.' },
                { step: '03', icon: '🎬', title: 'Get Your Video', desc: 'Pay once. Our AI generates your cinematic video in minutes. Download and share anywhere.' }
              ].map((item) => (
                <div key={item.step} style={{
                  background: '#111118',
                  border: '1px solid #1e1e2e',
                  borderRadius: '20px',
                  padding: '36px 28px',
                  flex: '1',
                  minWidth: '240px',
                  maxWidth: '280px',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '11px', color: '#f5c518', fontWeight: 700, letterSpacing: '2px', marginBottom: '16px' }}>
                    STEP {item.step}
                  </div>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}>{item.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>{item.title}</h3>
                  <p style={{ color: '#888899', fontSize: '14px', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div style={{ padding: '80px 20px', textAlign: 'center' }}>
            <p style={{ color: '#f5c518', fontSize: '12px', fontWeight: 600, letterSpacing: '2px', marginBottom: '16px' }}>
              PERFECT FOR
            </p>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, marginBottom: '60px' }}>
              Every Malaysian. Every Occasion.
            </h2>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '16px',
              maxWidth: '800px',
              margin: '0 auto 60px'
            }}>
              {[
                '💒 Weddings', '🎂 Birthdays', '✈️ Travel', '👶 Baby Milestones',
                '🌙 Hari Raya', '🎊 CNY', '🍯 Home Sellers', '☕ Cafe Owners',
                '👗 Fashion', '🏠 Property', '🛒 Shopee Sellers', '📸 Memories'
              ].map((tag) => (
                <span key={tag} style={{
                  background: '#111118',
                  border: '1px solid #1e1e2e',
                  borderRadius: '100px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  color: '#ccccdd'
                }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Pricing */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '20px',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              {[
                { type: 'Personal', price: 'RM12.99', desc: '3 cinematic templates', color: '#3b82f6', templates: ['Cinematic Memory', 'Little Moments', 'Wanderlust'] },
                { type: 'Business', price: 'RM19.99', desc: '5 business templates', color: '#f5c518', templates: ['Product Hero', 'Makan Mood', 'Style Drop', 'Property Walk', 'Brand Story'] }
              ].map((plan) => (
                <div key={plan.type} style={{
                  background: '#111118',
                  border: `1px solid ${plan.color}40`,
                  borderRadius: '24px',
                  padding: '36px 32px',
                  flex: '1',
                  minWidth: '280px',
                  maxWidth: '320px',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '12px', color: plan.color, fontWeight: 700, letterSpacing: '2px', marginBottom: '12px' }}>
                    {plan.type.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '40px', fontWeight: 800, marginBottom: '4px' }}>{plan.price}</div>
                  <div style={{ color: '#888899', fontSize: '14px', marginBottom: '24px' }}>per video</div>
                  {plan.templates.map(t => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ color: plan.color }}>✓</span>
                      <span style={{ fontSize: '14px', color: '#ccccdd' }}>{t}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Final CTA */}
            <button
              onClick={() => setStep(STEP_CATEGORY)}
              style={{
                background: 'linear-gradient(135deg, #f5c518, #ff6b35)',
                color: '#000',
                border: 'none',
                borderRadius: '16px',
                padding: '20px 48px',
                fontSize: '18px',
                fontWeight: 800,
                cursor: 'pointer',
                marginTop: '60px'
              }}
            >
              🎬 Create My Video Now
            </button>
          </div>

          {/* Footer */}
          <div style={{
            background: '#0a0a0f',
            padding: '32px 20px',
            textAlign: 'center',
            borderTop: '1px solid #1e1e2e'
          }}>
            <p style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>ZAAS</p>
            <p style={{ color: '#555566', fontSize: '13px' }}>
              © 2026 ZAAS. Made with ❤️ in Malaysia.
            </p>
          </div>
        </div>
      )}

      {/* ── CATEGORY SELECT ── */}
      {step === STEP_CATEGORY && (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px'
        }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, marginBottom: '12px', textAlign: 'center' }}>
            What are your photos about?
          </h2>
          <p style={{ color: '#888899', marginBottom: '48px', textAlign: 'center' }}>
            This helps us show you the right templates
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            {[
              {
                cat: 'personal',
                icon: '📸',
                title: 'Personal',
                desc: 'Memories, family, travel, celebrations',
                price: 'RM12.99',
                color: '#3b82f6'
              },
              {
                cat: 'business',
                icon: '🛒',
                title: 'Business',
                desc: 'Products, F&B, fashion, property',
                price: 'RM19.99',
                color: '#f5c518'
              }
            ].map((item) => (
              <button
                key={item.cat}
                onClick={() => handleCategorySelect(item.cat)}
                disabled={loading}
                style={{
                  background: '#111118',
                  border: `2px solid ${item.color}40`,
                  borderRadius: '24px',
                  padding: '40px 36px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '280px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{item.icon}</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                  {item.title}
                </div>
                <div style={{ color: '#888899', fontSize: '14px', marginBottom: '16px', lineHeight: 1.5 }}>
                  {item.desc}
                </div>
                <div style={{ color: item.color, fontWeight: 800, fontSize: '20px' }}>
                  {item.price} <span style={{ fontSize: '13px', fontWeight: 400, color: '#888899' }}>/ video</span>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(STEP_LANDING)}
            style={{ marginTop: '32px', background: 'none', border: 'none', color: '#888899', cursor: 'pointer', fontSize: '14px' }}
          >
            ← Back
          </button>
        </div>
      )}

      {/* ── UPLOAD ── */}
      {step === STEP_UPLOAD && (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px'
        }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, marginBottom: '12px', textAlign: 'center' }}>
            Upload Your Photos
          </h2>
          <p style={{ color: '#888899', marginBottom: '8px', textAlign: 'center' }}>
            Select 1 to 10 photos. Clear, well-lit photos give the best results.
          </p>
          <p style={{ color: '#555566', fontSize: '13px', marginBottom: '40px', textAlign: 'center' }}>
            💡 Tip: Use photos minimum 1MB for best AI motion quality
          </p>

          {/* Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              maxWidth: '500px',
              border: '2px dashed #1e1e2e',
              borderRadius: '24px',
              padding: '60px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: '24px',
              background: uploadedFiles.length > 0 ? '#111118' : 'transparent'
            }}
          >
            {uploadedFiles.length > 0 ? (
              <>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                <p style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>
                  {uploadedFiles.length} photo{uploadedFiles.length > 1 ? 's' : ''} selected
                </p>
                <p style={{ color: '#888899', fontSize: '14px' }}>Click to change selection</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📸</div>
                <p style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>
                  Tap to select photos
                </p>
                <p style={{ color: '#888899', fontSize: '14px' }}>JPG, PNG or WEBP • Max 10 photos • Max 10MB each</p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {error && (
            <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
              ⚠️ {error}
            </p>
          )}

          <button
            onClick={handleUpload}
            disabled={loading || uploadedFiles.length === 0}
            style={{
              background: loading || uploadedFiles.length === 0
                ? '#1e1e2e'
                : 'linear-gradient(135deg, #f5c518, #ff6b35)',
              color: loading || uploadedFiles.length === 0 ? '#555566' : '#000',
              border: 'none',
              borderRadius: '16px',
              padding: '18px 48px',
              fontSize: '16px',
              fontWeight: 800,
              cursor: loading || uploadedFiles.length === 0 ? 'not-allowed' : 'pointer',
              width: '100%',
              maxWidth: '500px'
            }}
          >
            {loading ? '⏳ Uploading...' : `Upload ${uploadedFiles.length > 0 ? uploadedFiles.length + ' Photo' + (uploadedFiles.length > 1 ? 's' : '') : 'Photos'} →`}
          </button>

          <button
            onClick={() => setStep(STEP_CATEGORY)}
            style={{ marginTop: '20px', background: 'none', border: 'none', color: '#888899', cursor: 'pointer', fontSize: '14px' }}
          >
            ← Back
          </button>
        </div>
      )}

      {/* ── TEMPLATE SELECT ── */}
      {step === STEP_TEMPLATE && (
        <div style={{ minHeight: '100vh', padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, marginBottom: '12px', textAlign: 'center' }}>
              Choose Your Template
            </h2>
            <p style={{ color: '#888899', marginBottom: '8px', textAlign: 'center' }}>
              Watch the preview before you choose
            </p>
            <p style={{ color: '#555566', fontSize: '13px', marginBottom: '40px', textAlign: 'center' }}>
              {category === 'personal' ? '📸 Personal — RM12.99' : '🛒 Business — RM19.99'}
            </p>

            {qualityWarning && (
              <div style={{
                background: '#f5c51815',
                border: '1px solid #f5c51840',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '24px',
                fontSize: '13px',
                color: '#f5c518'
              }}>
                ⚠️ {qualityWarning}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {templates.map((template) => (
                <div
                  key={template.id}
                  style={{
                    background: '#111118',
                    border: selectedTemplate?.id === template.id ? '2px solid #f5c518' : '1px solid #1e1e2e',
                    borderRadius: '20px',
                    padding: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                  }}
                  onClick={() => handleTemplateSelect(template)}
                >
                  {/* Template Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: '#888899', letterSpacing: '1px', marginBottom: '6px' }}>
                      {template.engine === 'seedance' ? '✦ SEEDANCE AI' : '✦ KLING AI'}
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
                      {template.name}
                    </h3>
                    <p style={{ color: '#888899', fontSize: '13px', marginBottom: '8px' }}>
                      {template.tagline}
                    </p>
                    <p style={{ color: '#555566', fontSize: '12px' }}>
                      Best for: {template.best_for}
                    </p>
                  </div>

                  {/* Select Button */}
                  <div>
                    <div style={{
                      background: selectedTemplate?.id === template.id
                        ? 'linear-gradient(135deg, #f5c518, #ff6b35)'
                        : '#1e1e2e',
                      color: selectedTemplate?.id === template.id ? '#000' : '#888899',
                      borderRadius: '12px',
                      padding: '10px 20px',
                      fontSize: '13px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap'
                    }}>
                      {selectedTemplate?.id === template.id ? '✓ Selected' : 'Select →'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(STEP_UPLOAD)}
              style={{ marginTop: '24px', background: 'none', border: 'none', color: '#888899', cursor: 'pointer', fontSize: '14px' }}
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* ── HERO SELECT ── */}
      {step === STEP_HERO && (
        <div style={{ minHeight: '100vh', padding: '60px 20px' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, marginBottom: '12px', textAlign: 'center' }}>
              Pick Your Hero Photo
            </h2>
            <p style={{ color: '#888899', marginBottom: '8px', textAlign: 'center' }}>
              This photo gets full AI motion treatment
            </p>
            <p style={{ color: '#555566', fontSize: '13px', marginBottom: '40px', textAlign: 'center' }}>
              💡 Best result: 1-3 people, clear faces, good lighting
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px',
              marginBottom: '32px'
            }}>
              {uploadedPhotos.map((photo, index) => (
                <div
                  key={photo.cloudinary_public_id}
                  onClick={() => setHeroPublicId(photo.cloudinary_public_id)}
                  style={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: heroPublicId === photo.cloudinary_public_id
                      ? '3px solid #f5c518'
                      : '3px solid transparent',
                    aspectRatio: '1'
                  }}
                >
                  <img
                    src={photo.cloudinary_url}
                    alt={`Photo ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {heroPublicId === photo.cloudinary_public_id && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: '#f5c518',
                      color: '#000',
                      borderRadius: '100px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      ✦ HERO
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    background: '#00000080',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    color: '#fff'
                  }}>
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
                ⚠️ {error}
              </p>
            )}

            <button
              onClick={() => {
                if (!heroPublicId) {
                  setError('Please select a hero photo');
                  return;
                }
                setError(null);
                setStep(STEP_EMAIL);
                getLocation();
              }}
              disabled={!heroPublicId}
              style={{
                background: heroPublicId
                  ? 'linear-gradient(135deg, #f5c518, #ff6b35)'
                  : '#1e1e2e',
                color: heroPublicId ? '#000' : '#555566',
                border: 'none',
                borderRadius: '16px',
                padding: '18px 48px',
                fontSize: '16px',
                fontWeight: 800,
                cursor: heroPublicId ? 'pointer' : 'not-allowed',
                width: '100%'
              }}
            >
              Continue →
            </button>

            <button
              onClick={() => setStep(STEP_TEMPLATE)}
              style={{ marginTop: '16px', background: 'none', border: 'none', color: '#888899', cursor: 'pointer', fontSize: '14px', display: 'block', margin: '16px auto 0' }}
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* ── EMAIL ── */}
      {step === STEP_EMAIL && (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px'
        }}>
          <div style={{ width: '100%', maxWidth: '440px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, marginBottom: '12px', textAlign: 'center' }}>
              Almost There!
            </h2>
            <p style={{ color: '#888899', marginBottom: '40px', textAlign: 'center' }}>
              We'll send your video download link to your email
            </p>

            {/* Order Summary */}
            <div style={{
              background: '#111118',
              border: '1px solid #1e1e2e',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#888899', fontSize: '14px' }}>Template</span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{selectedTemplate?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#888899', fontSize: '14px' }}>Photos</span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{uploadedPhotos.length} photos</span>
              </div>
              <div style={{ borderTop: '1px solid #1e1e2e', paddingTop: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: '18px', color: '#f5c518' }}>
                  RM{selectedTemplate?.price}
                </span>
              </div>
            </div>

            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                background: '#111118',
                border: '1px solid #1e1e2e',
                borderRadius: '12px',
                padding: '16px 20px',
                fontSize: '16px',
                color: '#fff',
                marginBottom: '16px',
                outline: 'none'
              }}
            />

            {error && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>
                ⚠️ {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: loading ? '#1e1e2e' : 'linear-gradient(135deg, #f5c518, #ff6b35)',
                color: loading ? '#555566' : '#000',
                border: 'none',
                borderRadius: '16px',
                padding: '18px',
                fontSize: '16px',
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                width: '100%',
                marginBottom: '12px'
              }}
            >
              {loading ? '⏳ Processing...' : `🎬 Generate My Video — RM${selectedTemplate?.price}`}
            </button>

            <p style={{ color: '#555566', fontSize: '12px', textAlign: 'center' }}>
              🔒 Secure checkout. No subscription. One-time payment.
            </p>

            <button
              onClick={() => setStep(STEP_HERO)}
              style={{ marginTop: '16px', background: 'none', border: 'none', color: '#888899', cursor: 'pointer', fontSize: '14px', display: 'block', margin: '16px auto 0' }}
            >
              ← Back
            </button>
          </div>
        </div>
      )}

    </main>
  );
}