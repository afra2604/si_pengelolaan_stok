// Alerts.jsx (Diperbarui)
import { 
    Card, Row, Col, Typography, Spin, Alert, Select, Space, Divider 
} from "antd"; 
import { useEffect, useState, useCallback } from "react"; 
import axios from "axios";
import { 
    WarningOutlined, 
    DollarOutlined, 
    DropboxOutlined, 
    RocketOutlined, 
    LineChartOutlined,
    BarChartOutlined, 
    HistoryOutlined, 
    CalendarOutlined,
    CheckCircleOutlined,
    BellOutlined 
} from "@ant-design/icons";
// import styled from "styled-components"; // Tidak diperlukan karena sudah di Alerts.styles.js
import {
     BackgroundEffect, ControlPanel, ControlLabel, 
    StyledSelect, StyledOption, LoadingContainer, StyledAlert, 
    StyledItemCard, IconCircle, ModeTag, StyledDivider, QtyCard, 
    CostCard, DetailCard, TotalCostCard, IllustrationImage,
    WhiteTitle, Zinc400Paragraph, BoldWhiteTitle,
    StyledMainCard
} from "./Alerts.styles"; // Import komponen styling
import dashboardImg from "../assets/dashboard.png"; 

// --- DESTRUKTURISASI DAN HELPER TETAP SAMA ---
const { Paragraph } = Typography; // Diperlukan untuk komponen Antd yang belum di-styled
// const { Option } = Select; // Sudah diimpor di Alerts.styles.js

// Helper untuk format mata uang
const formatRupiah = (number) => {
    const num = parseFloat(number);
    if (isNaN(num)) return "Rp 0";
    const roundedNum = Math.round(num); 
    return `Rp ${roundedNum.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// --- KOMPONEN UTAMA ALERTS ---
const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [totalCost, setTotalCost] = useState(0);
    const [loadingAlerts, setLoadingAlerts] = useState(false);
    const [error, setError] = useState(null);
    
    const [calculationMode, setCalculationMode] = useState("ml");
    const [predictionDays, setPredictionDays] = useState(7); 

    const fetchDataAlerts = useCallback(async () => {
        try {
            setLoadingAlerts(true);
            setError(null);
            
            const endpoint = `http://localhost:5000/alerts?mode=${calculationMode}&days=${predictionDays}`;
            const res = await axios.get(endpoint);

            setAlerts(res.data.alerts || []);
            setTotalCost(res.data.total_estimated_cost || 0);
        } catch (err) {
            console.error("Error fetching alerts:", err);
            setError("Gagal memuat data notifikasi. Pastikan server backend berjalan dan ML libs sudah terinstall.");
            setAlerts([]);
            setTotalCost(0);
        } finally {
            setLoadingAlerts(false);
        }
    }, [calculationMode, predictionDays]);

    useEffect(() => {
        fetchDataAlerts();
    }, [fetchDataAlerts]);

    const getDescription = () => {
        switch (calculationMode) {
            case 'mvp':
                return "Hanya memeriksa apakah Stok Saat Ini berada di bawah Stok Minimum (MVP).";
            case 'advanced':
                return `Berdasarkan Reorder Point (ROP) historis dengan Lead Time **${predictionDays} hari**.`;
            case 'ml':
                return `Menggunakan prediksi permintaan Machine Learning (Linear Regression) untuk **${predictionDays} hari** ke depan.`;
            default:
                return "Menunggu pemilihan mode perhitungan.";
        }
    };

    const getModeDetails = (mode) => {
        switch (mode) {
            case 'ml':
                return { label: 'ML REGRESSION', className: 'bg-indigo-600', icon: <RocketOutlined /> };
            case 'advanced':
                return { label: 'ROP HISTORIS', className: 'bg-teal-600', icon: <LineChartOutlined /> };
            case 'mvp':
                return { label: 'STOK MINIMUM', className: 'bg-gray-600', icon: <DropboxOutlined /> };
            default:
                return { label: mode.toUpperCase(), className: 'bg-zinc-700', icon: <DropboxOutlined /> };
        }
    };

    return (
        <StyledMainCard>
            
            <BackgroundEffect />
            
            <Row gutter={[32, 32]} align="top" className="relative z-10">
                <Col xs={24} lg={24}>
                    <WhiteTitle level={3} style={{ marginBottom: 8 }}>
                        Rekomendasi Pembelian Stok
                    </WhiteTitle>

                    <Zinc400Paragraph style={{ marginBottom: 32 }}>
                        {getDescription()}
                    </Zinc400Paragraph>
                    
                    {/* KONTROL SELEKSI MODE */}
                    <ControlPanel>
                        <Space direction="horizontal" size="middle" className="w-full md:w-auto">
                            <ControlLabel>Mode Perhitungan:</ControlLabel>
                            <StyledSelect
                                defaultValue={calculationMode}
                                style={{ width: 190 }}
                                onChange={setCalculationMode}
                                size="large"
                            >
                                {/* Menggunakan StyledOption dengan kelas kustom untuk warna ikon/teks */}
                                <StyledOption value="ml" className="text-indigo-400"><RocketOutlined /> ML Regression</StyledOption>
                                <StyledOption value="advanced" className="text-teal-400"><LineChartOutlined /> ROP Historis</StyledOption>
                                <StyledOption value="mvp" className="text-gray-400"><DropboxOutlined /> Stok Minimum (MVP)</StyledOption>
                            </StyledSelect>
                        </Space>
                        
                        {(calculationMode === 'ml' || calculationMode === 'advanced') && (
                            <Space direction="horizontal" size="middle" className="w-full md:w-auto">
                                <ControlLabel>
                                    {calculationMode === 'ml' ? 'Periode Prediksi:' : 'Lead Time:'}
                                </ControlLabel>
                                <StyledSelect
                                    defaultValue={predictionDays}
                                    style={{ width: 120 }}
                                    onChange={setPredictionDays}
                                    size="large"
                                >
                                    {[7, 14, 30].map(day => (
                                        <StyledOption key={day} value={day}>{day} Hari</StyledOption>
                                    ))}
                                </StyledSelect>
                            </Space>
                        )}
                    </ControlPanel>
                    
                    {loadingAlerts ? (
                        <LoadingContainer>
                            <Spin size="large" tip={<span className="text-white">Menganalisis dan Menghitung Kebutuhan Stok...</span>} />
                        </LoadingContainer>
                    ) : error ? (
                        <StyledAlert 
                            message="Kesalahan Sistem"
                            description={error}
                            type="error"
                            showIcon
                        />
                    ) : alerts.length === 0 ? (
                        <StyledAlert
                            message="Stok Optimal"
                            description={`Semua barang berada di atas ambang batas ${calculationMode.toUpperCase()}. Tidak ada rekomendasi pembelian saat ini.`}
                            type="success"
                            icon={<CheckCircleOutlined />}
                            showIcon
                        />
                    ) : (
                        <Space direction="vertical" size={24} style={{ width: '100%' }}>
                            {alerts.map((item) => {
                                const modeDetail = getModeDetails(item.mode_used);
                                return (
                                <StyledItemCard key={item.barang_id} bordered={false}>
                                        
                                    {/* HEADER: Nama Barang & Tag Mode */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <Space size="middle" align="center">
                                            {/* Ikon Notifikasi Merah */}
                                            <IconCircle>
                                                <BellOutlined style={{ color: 'white', fontSize: 20 }} />
                                            </IconCircle>
                                            <BoldWhiteTitle level={4}>
                                                {item.nama_barang}
                                            </BoldWhiteTitle>
                                        </Space>
                                        
                                        {/* Mode Tag */}
                                        <ModeTag className={modeDetail.className}>
                                            {modeDetail.icon} {modeDetail.label}
                                        </ModeTag>
                                    </div>
                                    
                                    {/* Divider */}
                                    <StyledDivider />

                                    {/* SECTION 1: KEPUTUSAN PEMBELIAN (Highlight) */}
                                    <Row gutter={[24, 24]} style={{ marginBottom: 20 }}>
                                        <Col xs={24} md={12}>
                                            <QtyCard bordered={false}>
                                                <Paragraph>
                                                    <DropboxOutlined style={{ marginRight: 4 }} /> Qty Perlu Beli
                                                </Paragraph>
                                                <WhiteTitle level={2}>
                                                    {item.qty_to_buy} <span className="text-base font-semibold">pcs</span>
                                                </WhiteTitle>
                                            </QtyCard>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <CostCard bordered={false}>
                                                <Paragraph>
                                                    <DollarOutlined style={{ marginRight: 4 }} /> Estimasi Biaya
                                                </Paragraph>
                                                <WhiteTitle level={4}>
                                                    {formatRupiah(item.estimated_cost)}
                                                </WhiteTitle>
                                            </CostCard>
                                        </Col>
                                    </Row>
                                    
                                    {/* SECTION 2: DETAIL PERHITUNGAN & STOK */}
                                    <DetailCard bordered={false}>
                                        <Paragraph>
                                            Detail Analisis Perhitungan:
                                        </Paragraph>
                                        
                                        <Row gutter={[16, 12]} className="text-xs text-zinc-400"> 
                                            <Col xs={24} sm={12}>
                                                <HistoryOutlined className="mr-1 text-indigo-400" /> ROP: <span className="font-medium">{item.rop !== null ? Math.ceil(item.rop) : '-'} pcs</span>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <BarChartOutlined className="mr-1 text-teal-400" /> Avg. Harian: <span className="font-medium">{item.avg_daily !== null ? parseFloat(item.avg_daily).toFixed(2) : '-'} pcs</span>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <DropboxOutlined className="mr-1 text-yellow-400" /> Stok Saat Ini: <span className="font-medium">{item.stok_saat_ini} pcs</span>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <CalendarOutlined className="mr-1 text-red-400" /> Stok Minimum: <span className="font-medium">{item.stok_minimum} pcs</span>
                                            </Col>
                                        </Row>
                                        
                                        {item.error_msg && (
                                            <StyledAlert
                                                message="Gagal Prediksi ML"
                                                description={item.error_msg + " (Menggunakan Fallback MVP)"}
                                                type="warning"
                                                showIcon
                                            />
                                        )}
                                    </DetailCard>

                                </StyledItemCard>
                            );
                            })}

                            {/* TOTAL COST CARD */}
                            <TotalCostCard bordered={false}>
                                <div className='flex-container'>
                                    <Paragraph>
                                        💰 Total Estimasi Biaya Pembelian:
                                    </Paragraph>
                                    <WhiteTitle level={3}>
                                        {formatRupiah(totalCost)}
                                    </WhiteTitle>
                                </div>
                            </TotalCostCard>
                        </Space>
                    )}
                </Col>


            </Row>
        </StyledMainCard>
    );
};

export default Alerts;