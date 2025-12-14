// Alerts.styles.js
import styled from "styled-components";


import { Card, Select, Alert, Typography, Divider } from "antd"; 

const { Option } = Select;
const { Paragraph, Title } = Typography;

// Mengambil Card Antd dan menambahkan style kustom
export const StyledMainCard = styled(Card)`
  // Jarak yang lebih baik pada Card utama
  &.ant-card {
    position: relative;
    overflow: hidden;
    background-color: #FFFFFF; /* Ganti dari #18181b ke Putih */
    border-radius: 0.75rem; /* rounded-xl */
    margin-bottom: 1.5rem; /* mb-6 */
    /* Shadow ringan untuk tampilan clean */
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); 
    border: 1px solid #E5E7EB; /* Border abu-abu terang */
  }
  
  // Gaya untuk body Antd Card
  .ant-card-body {
    padding: 30px;
  }
`;

// Efek background (Diubah menjadi sangat subtle, hitam/abu-abu tipis di latar putih)
export const BackgroundEffect = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.05; /* Sangat tipis */
  background: radial-gradient(ellipse at top, #000000 1%, transparent 50%); 
`;

// Gaya untuk area kontrol (Mode & Days)
export const ControlPanel = styled.div`
  margin-bottom: 2rem; /* mb-8 */
  display: flex;
  flex-direction: column; 
  align-items: flex-start; 
  gap: 1rem; 
  padding: 1.5rem; 
  border-radius: 0.75rem; 
  background-color: #F9FAFB; /* Putih terang / Abu-abu sangat muda */
  box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-inner ringan */
  border: 1px solid #E5E7EB;

  @media (min-width: 768px) { 
    flex-direction: row; 
    align-items: center; 
    gap: 2rem; 
  }
`;

// Gaya untuk span label di ControlPanel
export const ControlLabel = styled.span`
  color: #6B7280; /* Teks abu-abu gelap */
  font-weight: 500; 
  white-space: nowrap;
`;

// Mengambil Select Antd dan menambahkan style kustom
export const StyledSelect = styled(Select)`
  &.ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
    background-color: #FFFFFF !important; /* Putih */
    color: #1F2937; /* Teks gelap */
    border: 1px solid #D1D5DB; /* Border abu-abu */
  }
  
  // Memastikan Select penuh di layar kecil
  &&& {
    width: 100% !important; 
  }

  @media (min-width: 768px) { 
    &&& {
      width: auto !important; 
    }
  }
`;

// Gaya untuk opsi Select 
export const StyledOption = styled(Option)`
  &.ant-select-item-option {
    color: #1F2937; /* Teks gelap */
    background-color: #FFFFFF; /* Putih */
  }
  &.ant-select-item-option-active {
    background-color: #F3F4F6 !important; /* Hover abu-abu terang */
  }
  &.ant-select-item-option-selected {
    background-color: #E5E7EB !important; /* Selected abu-abu */
  }

  // Kelas kustom untuk warna di Option (Tetap)
  &.text-indigo-400 { color: #818cf8 !important; }
  &.text-teal-400 { color: #2dd4bf !important; }
  &.text-gray-400 { color: #9ca3af !important; }
`;

// Gaya untuk Spin/Loading
export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px 0;
  
  .ant-spin-text {
    color: #374151; /* Teks gelap */
  }
`;

// Gaya kustom untuk Alert
export const StyledAlert = styled(Alert)`
  &.ant-alert {
    // Overrides untuk Error Alert (Warna Merah Terang)
    &[type="error"] {
      background-color: #FEF2F2; 
      border-color: #F87171; 
      .ant-alert-message, .ant-alert-description {
        color: #B91C1C; 
      }
    }
    
    // Overrides untuk Success Alert (Warna Hijau Terang)
    &[type="success"] {
      background-color: #ECFDF5; 
      border-color: #34D399; 
      .ant-alert-message, .ant-alert-description {
        color: #047857; 
      }
    }

    // Overrides untuk Warning Alert (Warna Kuning Terang)
    &[type="warning"] {
      background-color: #FFFBEB; 
      border-color: #FCD34D; 
      .ant-alert-message, .ant-alert-description {
        color: #D97706; 
      }
      margin-top: 1rem; 
    }
  }
`;

// Gaya untuk Notifikasi Item Card
export const StyledItemCard = styled(Card)`
  // Penyesuaian shadow untuk kontras yang lebih baik
  &.ant-card {
    background-color: #FFFFFF; /* Putih */
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06); /* Shadow ringan */
    border: 1px solid #F87171; /* Border Merah untuk notifikasi */
    border-radius: 0.5rem;
  }
`;

// Ikon Lingkaran Merah (Aksen Notifikasi tetap)
export const IconCircle = styled.div`
  flex-shrink: 0;
  width: 2.5rem; 
  height: 2.5rem; 
  background-color: #DC2626; /* Merah */
  border-radius: 9999px; 
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
`;

// Gaya untuk Mode Tag
export const ModeTag = styled.span`
  padding-left: 0.75rem; 
  padding-right: 0.75rem; 
  padding-top: 0.25rem; 
  padding-bottom: 0.25rem; 
  border-radius: 9999px; 
  font-size: 0.75rem; 
  font-weight: 600; 
  color: white; /* Teks tetap putih agar kontras dengan latar belakang tag yang berwarna */
  display: flex;
  align-items: center;
  gap: 0.25rem; 

  // Kelas mode dari getModeDetails (Warna tetap untuk identifikasi)
  &.bg-indigo-600 { background-color: #4f46e5; }
  &.bg-teal-600 { background-color: #0d9488; }
  &.bg-gray-600 { background-color: #4b5563; }
  &.bg-zinc-700 { background-color: #3f3f46; }
`;

// Gaya untuk Divider Antd
export const StyledDivider = styled(Divider)`
  margin: 20px 0;
  border-block-start: 1px solid #E5E7EB; /* Border abu-abu terang */
`;

// Gaya untuk Card Highlight Kuantitas Beli (Aksen Indigo)
export const QtyCard = styled(Card)`
  &.ant-card {
    padding: 0; 
    background-color: #EEF2FF; /* Indigo sangat terang */
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06); 
    border: 1px solid #A5B4FC; /* Border Indigo terang */
    transition: all 0.3s ease; 
    
    &:hover {
      transform: scale(1.02);
    }
  }
  .ant-card-body {
    padding: 20px;
    text-align: center;
  }
  
  ${Paragraph} {
    color: #4338CA; /* Teks Indigo gelap */
    font-size: 0.75rem; 
    margin-bottom: 0.25rem !important; 
    font-weight: 500; 
  }

  ${Title} {
    color: #1F2937; /* Teks gelap */
    font-weight: 900 !important; 
    margin: 0;
  }
  
  .text-base {
    font-size: 1rem;
    font-weight: 600; 
  }
`;

// Gaya untuk Card Highlight Estimasi Biaya (Aksen Green)
export const CostCard = styled(QtyCard)`
  &.ant-card {
    background-color: #F0FFF4; /* Hijau sangat terang */
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid #A7F3D0; /* Border Hijau terang */
  }

  ${Paragraph} {
    color: #047857; /* Teks Hijau gelap */
  }
  
  ${Title} {
    color: #1F2937;
    font-weight: 900 !important;
  }
`;

// Gaya untuk Detail Analisis Card
export const DetailCard = styled(Card)`
  &.ant-card {
    background-color: #F9FAFB; /* Abu-abu sangat terang */
    box-shadow: none; 
    border-radius: 0.5rem;
    border: 1px solid #E5E7EB; /* Border ringan */
  }

  .ant-card-body {
    padding: 16px;
  }

  // Header Detail Analisis
  ${Paragraph} {
    color: #1F2937; /* Teks gelap */
    font-weight: 600; 
    margin-bottom: 12px;
    padding-bottom: 4px;
    border-bottom: 1px solid #E5E7EB; /* Border abu-abu terang */
  }
  
  .text-xs {
    font-size: 0.75rem;
    color: #6B7280; /* Teks abu-abu */
  }

  .font-medium {
    font-weight: 500;
    color: #1F2937; /* Teks gelap */
  }
  
  // Warna Ikon (Tetap untuk visualisasi data)
  .text-indigo-400 { color: #818cf8; }
  .text-teal-400 { color: #2dd4bf; }
  .text-yellow-400 { color: #facc15; }
  .text-red-400 { color: #f87171; }
`;

// Gaya untuk Total Cost Card (Aksen Biru)
export const TotalCostCard = styled(Card)`
  &.ant-card {
    background-color: #EFF6FF; /* Biru sangat terang */
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -4px rgba(59, 130, 246, 0.06); /* Shadow Biru ringan */
    border: 1px solid #93C5FD; /* Border Biru terang */
    border-radius: 0.5rem;
  }

  .ant-card-body {
    padding: 20px;
  }

  .flex-container {
    display: flex;
    flex-direction: column; 
    justify-content: space-between;
    align-items: flex-start; 

    @media (min-width: 640px) { 
      flex-direction: row; 
      align-items: center; 
    }
  }

  ${Paragraph} {
    color: #2563EB; /* Teks Biru gelap */
    font-size: 1rem; 
    margin-bottom: 0.5rem !important; 
    font-weight: 500; 
    
    @media (min-width: 640px) { 
      margin-bottom: 0 !important; 
    }
  }

  ${Title} {
    color: #1F2937; /* Teks gelap */
    font-weight: 900 !important; 
    font-size: 1.25rem; 
    margin: 0;

    @media (min-width: 640px) { 
      font-size: 1.875rem !important; 
    }
  }
`;

// Gaya untuk Gambar Ilustrasi
export const IllustrationImage = styled.img`
  height: 16rem; 
  object-fit: contain;
  opacity: 0.8; /* Opacity diatur untuk latar belakang terang */
`;

// UTILITY STYLES: Mengganti warna Putih lama dengan Gelap
export const WhiteTitle = styled(Title)`
  color: #1F2937 !important; /* Teks Gelap */
`;

export const Zinc400Paragraph = styled(Paragraph)`
  color: #6B7280 !important; /* Teks Abu-abu */
`;

export const WhiteParagraph = styled(Paragraph)`
  color: #1F2937 !important; /* Teks Gelap */
`;

export const BoldWhiteTitle = styled(Title)`
  color: #1F2937 !important; /* Teks Gelap */
  font-weight: 800 !important; 
  margin: 0;
`;