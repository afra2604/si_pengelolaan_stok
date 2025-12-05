import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  message,
  Space,
  Tag,
  Tooltip,
  Card,
  Typography,
  Row,
  Col,
  Select, // Tambahkan Select untuk simulasi Foreign Key
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  ContainerOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title } = Typography;

// ======================================================================
// 1. Konfigurasi API Client 
// ======================================================================
const API_BASE_URL = "http://localhost:5000";
const ENDPOINT = "/transactions-masuk/";
// Endpoint baru untuk data Foreign Key
const BARANG_ENDPOINT = "/barang/";
const USERS_ENDPOINT = "/users/"; // Asumsi endpoint untuk data User/Pencatat

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Mock data untuk simulasi dropdown Foreign Key (Dihapus dan diganti dengan state)
// const MOCK_BARANG = [...]
// const MOCK_USERS = [...]


export default function App() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form] = Form.useForm();
  
  // State untuk menyimpan data Barang dan User dari API (Pengganti MOCK)
  const [barangOptions, setBarangOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  // ======================================================================
  // 2. LOAD DATA UTAMA (READ)
  // ======================================================================
  const loadData = async () => {
    setLoading(true);
    try {
      // URL API diubah menjadi ENDPOINT Transactions Masuk
      const res = await API.get(ENDPOINT); 
      // Memastikan res.data?.data adalah array, jika tidak, default ke array kosong
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
      message.success("Data transactions berhasil dimuat");
    } catch (err) {
      console.error("Load Data Error:", err);
      // Cek jika error 404 (Not Found) terjadi, mungkin datanya kosong
      if (err.response && err.response.status === 404) {
         setData([]); // Kosongkan data jika 404
         message.info("Tidak ada data transaksi masuk ditemukan.");
      } else {
         message.error("Gagal mengambil data transactions dari server.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  // ======================================================================
  // 2b. LOAD DATA DROPDOWN (Barang & User)
  // ======================================================================
  const loadDropdownData = async () => {
      try {
          // 1. Ambil data Barang (asumsi endpoint /barang/ mengembalikan list barang)
          const barangRes = await API.get(BARANG_ENDPOINT);
          // Struktur data Barang: { barang_id, nama_barang }
          if (Array.isArray(barangRes.data?.data)) {
              setBarangOptions(barangRes.data.data);
          } else {
              setBarangOptions([]);
              message.warning("Gagal memuat data Barang untuk dropdown.");
          }
          
          // 2. Ambil data User (asumsi endpoint /users/ mengembalikan list user)
          const userRes = await API.get(USERS_ENDPOINT);
          // Struktur data User: { user_id, nama }
          if (Array.isArray(userRes.data?.data)) {
              setUserOptions(userRes.data.data);
          } else {
              setUserOptions([]);
              message.warning("Gagal memuat data User untuk dropdown.");
          }

      } catch (err) {
          console.error("Load Dropdown Data Error:", err);
          message.error("Gagal memuat data dropdown (Barang atau User). Pastikan backend berjalan.");
      }
  };


  useEffect(() => {
    loadData();
    loadDropdownData(); // Muat data dropdown saat komponen pertama kali dimuat
  }, []);

  // ======================================================================
  // 3. HANDLE SUBMIT (CREATE & UPDATE)
  // ======================================================================
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        // Pastikan nilai angka default 0 jika kosong
        jumlah: values.jumlah || 0,
        barang_id: values.barang_id,
        user_id: values.user_id,
        // Format tanggal YYYY-MM-DD untuk Flask
        tanggal_masuk: values.tanggal_masuk
          ? values.tanggal_masuk.format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"), // Default hari ini jika kosong
      };

      if (editItem) {
        // PUT request: PENTING gunakan trans_masuk_id
        await API.put(`${ENDPOINT}${editItem.trans_masuk_id}`, payload);
        // Menggunakan barang_id untuk mencari nama barang yang sesuai untuk pesan sukses
        const currentBarang = barangOptions.find(b => b.barang_id === payload.barang_id)?.nama_barang || 'Barang ID '+payload.barang_id;
        message.success(`Transactions Masuk Barang: "${currentBarang}" berhasil diperbarui`);
      } else {
        // POST request
        await API.post(ENDPOINT, payload);
        const currentBarang = barangOptions.find(b => b.barang_id === payload.barang_id)?.nama_barang || 'Barang ID '+payload.barang_id;
        message.success(`Transactions Masuk Barang: "${currentBarang}" berhasil ditambahkan`);
      }

      setOpen(false);
      setEditItem(null);
      form.resetFields();
      loadData();
    } catch (error) {
      console.error("Submit Error:", error);
      let errorMessage = "Gagal menyimpan data. Pastikan semua field terisi dan ID Barang/User benar.";
      
      if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
      }
      
      message.error(errorMessage);
    }
  };

  // 4. HANDLE DELETE

  const handleDelete = (id, name) => {
    Modal.confirm({
      title: "Hapus Transactions Masuk",
      content: `Apakah Anda yakin ingin menghapus transactions dari supplier "${name}"?`,
      okText: "Hapus",
      okType: "danger",
      cancelText: "Batal",

      async onOk() {
        try {
          const transId = Number(id);

          // Optimistic Update
          setData((prev) => prev.filter((item) => item.trans_masuk_id !== transId));

          // Request ke backend
          const res = await API.delete(`${ENDPOINT}${transId}`);

          message.success(res.data?.message || `Transactions "${name}" berhasil dihapus`);

          setTimeout(() => {
            loadData();
          }, 300);

        } catch (err) {
          console.error("Delete Error:", err);

          let errorMessage = "Gagal menghapus transactions.";

          if (err.response?.data?.error) {
            errorMessage = err.response.data.error;

            if (
              errorMessage.includes("Cannot delete or update a parent row") ||
              errorMessage.includes("IntegrityError")
            ) {
              errorMessage = `Transactions "${name}" tidak dapat dihapus karena sudah terkait dengan data lain (mis. Utang). Hapus data terkait terlebih dahulu.`;
            }
          }
          message.error(errorMessage);
          loadData();
        }
      },
    });
  };


  // 5. MODAL & FORM

  const showModal = (item = null) => {
    setEditItem(item);
    if (item) {
      form.setFieldsValue({
        ...item,
        // Penting: ambil ID Barang dan ID User dari data yang ada di tabel
        barang_id: item.barang_id,
        user_id: item.user_id,
        // Nama barang dan user_nama tidak perlu dimasukkan, yang perlu adalah ID-nya
        tanggal_masuk: item.tanggal_masuk ? dayjs(item.tanggal_masuk) : null,
      });
    } else {
      form.resetFields();
      // Set default nilai untuk transactions baru
      form.setFieldsValue({
        // Set default ke ID pertama jika ada data dropdown
        user_id: userOptions.length > 0 ? userOptions[0].user_id : null, 
        barang_id: barangOptions.length > 0 ? barangOptions[0].barang_id : null,
        jumlah: 1,
        tanggal_masuk: dayjs(),
      });
    }
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
    setEditItem(null);
    form.resetFields();
  };

  
  // 6. TABLE COLUMNS (Diubah sesuai output JOIN SQL)

  const columns = [
    {
      title: "ID",
      dataIndex: "trans_masuk_id",
      key: "trans_masuk_id",
      width: 60,
      align: "center",
      fixed: "left",
    },
    {
      title: "Tanggal Masuk",
      dataIndex: "tanggal_masuk",
      key: "tanggal_masuk",
      width: 120,
      render: (text) => (text ? dayjs(text).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Supplier",
      dataIndex: "nama_supplier",
      key: "nama_supplier",
      width: 180,
      sorter: (a, b) => a.nama_supplier.localeCompare(b.nama_supplier),
      fixed: "left",
    },
    {
      title: "Nama Barang",
      dataIndex: "nama_barang",
      key: "nama_barang",
      width: 200,
    },
    {
      title: "Jumlah",
      dataIndex: "jumlah",
      key: "jumlah",
      width: 100,
      align: "right",
      render: (text) => <Tag color="green">{Number(text).toLocaleString("id-ID")}</Tag>,
    },
    {
      title: "Dicatat Oleh",
      dataIndex: "nama_user",
      key: "nama_user",
      width: 150,
      render: (text) => (
        <Space size={4}>
            <UserOutlined />
            {text}
        </Space>
      ),
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      key: "keterangan",
      ellipsis: true,
      width: 250,
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Transactions">
            <Button
              type="primary"
              size="small"
              onClick={() => showModal(record)}
              icon={<EditOutlined />}
            />
          </Tooltip>
          <Tooltip title="Hapus Transactions">
            <Button
              size="small"
              danger
              // Gunakan trans_masuk_id dan nama_supplier untuk konfirmasi
              onClick={() => handleDelete(record.trans_masuk_id, record.nama_supplier)}
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];


  // 7. RENDER UI

  return (
    <div
      style={{ padding: 24, minHeight: "100vh", backgroundColor: "#f0f2f5" }}
    >
      <Card
        style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
        bordered={false}
      >
        <Title
          level={2}
          style={{
            borderBottom: "1px solid #eee",
            paddingBottom: 16,
            marginBottom: 24,
            color: "#096dd9",
          }}
        >
          <ContainerOutlined style={{ marginRight: 10 }} />
          Manajemen Transactions Masuk
        </Title>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Tambah Transactions Masuk
          </Button>
          <Button
            onClick={loadData}
            loading={loading}
            icon={<ReloadOutlined />}
            size="large"
          >
            Refresh Data
          </Button>
        </div>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="trans_masuk_id" // Primary Key yang baru
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1300 }}
          bordered
          size="middle"
        />

        {/* MODAL FORM INPUT Transactions MASUK */}
        <Modal
          title={editItem ? "Edit Transactions Masuk" : "Tambah Transactions Masuk Baru"}
          open={open}
          onCancel={handleCancel}
          onOk={handleSubmit}
          okText="Simpan"
          cancelText="Batal"
          width={700}
          centered
        >
          <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="nama_supplier"
                  label="Nama Supplier"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                >
                  <Input placeholder="Contoh: PT Sinar Jaya" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="tanggal_masuk" label="Tanggal Masuk">
                  <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                {/* Dropdown Barang (mengirim barang_id) - Menggunakan data asli */}
                <Form.Item
                  name="barang_id"
                  label="Pilih Barang"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                >
                  <Select
                    placeholder="Pilih Barang"
                    // Menggunakan state barangOptions
                    options={barangOptions.map(b => ({
                      value: b.barang_id,
                      label: `${b.nama_barang} (ID: ${b.barang_id})`,
                    }))}
                    // Tambahkan loading/disable jika data belum dimuat
                    loading={barangOptions.length === 0}
                    disabled={barangOptions.length === 0}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                {/* Dropdown User (mengirim user_id) - Menggunakan data asli */}
                <Form.Item
                  name="user_id"
                  label="Dicatat Oleh"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                >
                  <Select
                    placeholder="Pilih Pencatat"
                    // Menggunakan state userOptions
                    options={userOptions.map(u => ({
                      // Asumsi field nama user di API adalah 'nama'
                      value: u.user_id,
                      label: `${u.nama} (ID: ${u.user_id})`, 
                    }))}
                    // Tambahkan loading/disable jika data belum dimuat
                    loading={userOptions.length === 0}
                    disabled={userOptions.length === 0}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="jumlah"
                  label="Jumlah Masuk"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                >
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="keterangan" label="Keterangan Transactions">
              <Input.TextArea rows={3} placeholder="Catatan tambahan..." />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}