'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getOrderStatus } from '../../lib/api';

export default function OrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const checkStatus = async () => {
      try {
        const res = await getOrderStatus(id);
        if (res.success) {
          setOrder(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    checkStatus();

    const interval = setInterval(async () => {
      try {
        const res = await getOrderStatus(id);
        if (res.success) {
          setOrder(res.data);
          if (res.data.video_status === 'completed' || res.data.video_status === 'failed') {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [id]);

  const statusConfig = {
    pending:    { icon: '⏳', label: 'Preparing your order...', color: '#888899' },
    processing: { icon: '🤖', label: 'ZAAS is filming your memories...', color: '#3b82f6' },
    stitching:  { icon: '🎬', label: 'Stitching your cinematic video...', color: '#f5c518' },
    completed:  { icon: '🎉', label: 'Your video is ready!', color: '#22c55e' },
    failed:     { icon: '❌', label: 'Something went wrong', color: '#ef4444' }
  };

  const status = order
    ? (statusConfig[order.video_status] || statusConfig.pending)
    : statusConfig.pending;

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050505',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>

      {/* Logo */}
      <div style={{ marginBottom: '48px' }}>
        <a href="/" style={{ fontSize: '24px', fontWeight: 800, color: '#fff', textDecoration: 'none' }}>
          ZAAS
        </a>
      </div>

      <div style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>

        {/* Status Icon */}
        <div style={{
          fontSize: '72px',
          marginBottom: '24px',
          animation: order?.video_status === 'completed' ? 'none' : 'pulse 2s infinite'
        }}>
          {status.icon}
        </div>

        {/* Status Label */}
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: status.color, marginBottom: '12px' }}>
          {status.label}
        </h2>

        {/* Waiting message */}
        {order?.video_status !== 'completed' && order?.video_status !== 'failed' && (
          <p style={{ color: '#888899', fontSize: '14px', marginBottom: '40px', lineHeight: 1.6 }}>
            This usually takes 2-5 minutes. We'll also send the download link to your email.
            <br />This page updates automatically every 10 seconds.
          </p>
        )}

        {/* Processing Steps */}
        {order && order.video_status !== 'completed' && order.video_status !== 'failed' && (
          <div style={{
            background: '#111118',
            border: '1px solid #1e1e2e',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            {[
              { label: 'Payment confirmed', done: true },
              { label: 'Groq analysing your 4 photos', done: ['processing', 'stitching'].includes(order.video_status) },
              { label: 'Wavespeed generating 4 video clips', done: ['processing', 'stitching'].includes(order.video_status) },
              { label: 'Stitching into 20-second video', done: order.video_status === 'stitching' },
              { label: 'Video ready for download', done: false }
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '14px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: s.done ? '#22c55e' : '#1e1e2e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  flexShrink: 0,
                  color: '#fff'
                }}>
                  {s.done ? '✓' : ''}
                </div>
                <span style={{ fontSize: '14px', color: s.done ? '#fff' : '#555566' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Download Section */}
        {order?.video_status === 'completed' && order.video_url && (
          <div style={{
            background: '#111118',
            border: '1px solid #22c55e40',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '24px'
          }}>
            <p style={{ color: '#888899', fontSize: '14px', marginBottom: '24px' }}>
              Your cinematic video is ready! Download it now.
              <br />
              <span style={{ color: '#555566', fontSize: '12px' }}>
                ⚠️ Link expires in 30 days
              </span>
            </p>

            <a
              href={order.video_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff',
                borderRadius: '14px',
                padding: '18px',
                fontSize: '16px',
                fontWeight: 800,
                textDecoration: 'none',
                marginBottom: '12px'
              }}
            >
              ⬇️ Download My Video
            </a>

            <p style={{ color: '#555566', fontSize: '12px' }}>
              Share it on TikTok, Instagram, WhatsApp Status 🚀
            </p>
          </div>
        )}

        {/* Failed */}
        {order?.video_status === 'failed' && (
          <div style={{
            background: '#111118',
            border: '1px solid #ef444440',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '24px'
          }}>
            <p style={{ color: '#888899', fontSize: '14px', marginBottom: '8px' }}>
              Something went wrong generating your video.
            </p>
            <p style={{ color: '#22c55e', fontSize: '14px', marginBottom: '16px', fontWeight: 600 }}>
              ✅ A full refund has been initiated automatically.
            </p>
            <p style={{ color: '#555566', fontSize: '12px', fontFamily: 'monospace' }}>
              Order ID: {id}
            </p>
          </div>
        )}

        {/* Order Info */}
        {order && (
          <div style={{ color: '#555566', fontSize: '12px', marginTop: '16px' }}>
            <p>Order ID: {id}</p>
            {order.template && <p>Template: {order.template.name}</p>}
          </div>
        )}

        {/* Back to ZAAS */}
        {order?.video_status === 'completed' && (
          <a href="/" style={{
            display: 'block',
            marginTop: '24px',
            color: '#888899',
            fontSize: '14px',
            textDecoration: 'none'
          }}>
            ← Create Another Video
          </a>
        )}
      </div>
    </main>
  );
}