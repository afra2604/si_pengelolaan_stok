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
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  ContainerOutlined,
  WarningFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title } = Typography;

// ======================================================================
// 1. Konfigurasi API Client
// ======================================================================
const API = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 10000,
  withCredentials: true,   // WAJIB untuk DELETE, PUT, POST kalau pakai CORS Cookie
});

export default function App() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form] = Form.useForm();

  // ======================================================================
  // 2. LOAD DATA (READ)
  // ======================================================================
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/barang/");
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
      message.success("Data berhasil dimuat");
    } catch (err) {
      console.error("Load Data Error:", err);
      message.error("Gagal mengambil data dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
        watt: values.watt || 0,
        harga_beli: values.harga_beli || 0,
        stok_saat_ini: values.stok_saat_ini || 0,
        stok_minimum: values.stok_minimum || 0,
        terjual_online: values.terjual_online || 0,
        terjual_offline: values.terjual_offline || 0,
        // Format tanggal YYYY-MM-DD untuk Flask
        tanggal_barang: values.tanggal_barang
          ? values.tanggal_barang.format("YYYY-MM-DD")
          : null,
      };

      if (editItem) {
        // PUT request: PENTING gunakan barang_id
        await API.put(`/barang/${editItem.barang_id}`, payload);
        message.success(`Barang ${payload.nama_barang} berhasil diperbarui`);
      } else {
        // POST request
        await API.post("/barang/", payload);
        message.success(`Barang ${payload.nama_barang} berhasil ditambahkan`);
      }

      setOpen(false);
      setEditItem(null);
      form.resetFields();
      loadData();
    } catch (error) {
      console.error("Submit Error:", error);
      message.error("Gagal menyimpan data. Cek koneksi atau input.");
    }
  };

  // ======================================================================
  // 4. HANDLE DELETE
  // ======================================================================
 const handleDelete = (id, name) => {
  Modal.confirm({
    title: "Hapus Barang",
    content: `Apakah Anda yakin ingin menghapus "${name}"?`,
    okText: "Hapus",
    okType: "danger",
    cancelText: "Batal",

    async onOk() {
      try {
        const barangId = Number(id);

        // Optimistic Update — UI langsung hilang
        setData((prev) => prev.filter((item) => item.barang_id !== barangId));

        // Request ke backend
        const res = await API.delete(`/barang/${barangId}`);

        message.success(res.data?.message || `Barang "${name}" berhasil dihapus`);

        // Fallback reload untuk sync penuh
        setTimeout(() => {
          loadData();
        }, 300);

      } catch (err) {
        console.error("Delete Error:", err);

        let errorMessage = "Gagal menghapus barang.";

        if (err.response?.data?.error) {
          errorMessage = err.response.data.error;

          if (
            errorMessage.includes("Cannot delete or update a parent row") ||
            errorMessage.includes("IntegrityError")
          ) {
            errorMessage = ` Barang "${name}" tidak dapat dihapus karena sedang dipakai di transaksi. Hapus transaksi terkait terlebih dahulu.`;
          }
        }

        message.error(errorMessage);
        // Undo UI change kalau gagal
        loadData();
      }
    },
  });
};

  // ======================================================================
  // 5. MODAL & FORM
  // ======================================================================
  const showModal = (item = null) => {
    setEditItem(item);
    if (item) {
      form.setFieldsValue({
        ...item,
        tanggal_barang: item.tanggal_barang ? dayjs(item.tanggal_barang) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        watt: 0,
        stok_saat_ini: 0,
        stok_minimum: 0,
        terjual_online: 0,
        terjual_offline: 0,
        harga_beli: 0,
      });
    }
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
    setEditItem(null);
    form.resetFields();
  };

  // ======================================================================
  // 6. TABLE COLUMNS (Sesuai Database Anda)
  // ======================================================================
  const columns = [
    {
      title: "ID",
      dataIndex: "barang_id",
      key: "barang_id",
      width: 70,
      align: "center",
    },
    {
      title: "Nama Barang",
      dataIndex: "nama_barang",
      key: "nama_barang",
      width: 200,
      fixed: "left",
      sorter: (a, b) => a.nama_barang.localeCompare(b.nama_barang),
    },
    {
      title: "Kategori",
      dataIndex: "kategori",
      key: "kategori",
      width: 120,
      render: (text) => <Tag color="blue">{text || "-"}</Tag>,
    },
    // KOLOM BARU SESUAI DB
    {
      title: "Jenis",
      dataIndex: "jenis_barang",
      key: "jenis_barang",
      width: 120,
    },
    {
      title: "Watt",
      dataIndex: "watt",
      key: "watt",
      width: 80,
      align: "center",
      render: (text) => (text ? `${text} W` : "-"),
    },
    {
      title: "Harga Beli",
      dataIndex: "harga_beli",
      key: "harga_beli",
      width: 150,
      align: "right",
      render: (text) => `Rp ${text ? Number(text).toLocaleString("id-ID") : 0}`,
    },
    {
      title: "Stok",
      dataIndex: "stok_saat_ini",
      key: "stok_saat_ini",
      width: 100,
      align: "right",
      render: (text, record) => {
        const isBelowMin = (text || 0) < (record.stok_minimum || 0);
        return (
          <Tooltip title={isBelowMin ? "Stok Kurang!" : "Aman"}>
            <Tag color={isBelowMin ? "red" : "green"}>
              {isBelowMin && <WarningFilled style={{ marginRight: 5 }} />}
              {text || 0}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Min",
      dataIndex: "stok_minimum",
      key: "stok_minimum",
      width: 80,
      align: "right",
    },
    {
      title: "Terjual",
      key: "total_terjual",
      width: 100,
      align: "right",
      render: (_, r) => (r.terjual_online || 0) + (r.terjual_offline || 0),
    },
    {
      title: "Tanggal",
      dataIndex: "tanggal_barang",
      key: "tanggal_barang",
      width: 120,
      render: (text) => (text ? dayjs(text).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="primary"
              size="small"
              onClick={() => showModal(record)}
              icon={<EditOutlined />}
            />
          </Tooltip>
          <Tooltip title="Hapus">
            <Button
              size="small"
              danger
              onClick={() => handleDelete(record.barang_id, record.nama_barang)}
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ======================================================================
  // 7. RENDER UI
  // ======================================================================
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
          }}
        >
          <ContainerOutlined style={{ marginRight: 10, color: "#1890ff" }} />
          Manajemen Stok Barang
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
            Tambah Barang
          </Button>
          <Button
            onClick={loadData}
            loading={loading}
            icon={<ReloadOutlined />}
            size="large"
          >
            Refresh
          </Button>
        </div>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="barang_id" // PENTING: Harus sesuai Primary Key DB
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1300 }}
          bordered
          size="middle"
        />

        {/* MODAL FORM INPUT */}
        <Modal
          title={editItem ? "Edit Barang" : "Tambah Barang Baru"}
          open={open}
          onCancel={handleCancel}
          onOk={handleSubmit}
          okText="Simpan"
          cancelText="Batal"
          width={800}
          centered
        >
          <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="nama_barang"
                  label="Nama Barang"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                >
                  <Input placeholder="Nama Barang" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="kategori" label="Kategori">
                  <Input placeholder="Contoh: Elektronik" />
                </Form.Item>
              </Col>
              {/* INPUT BARU SESUAI DB */}
              <Col span={6}>
                <Form.Item name="jenis_barang" label="Jenis Barang">
                  <Input placeholder="Contoh: Lampu" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              {/* INPUT WATT */}
              <Col span={6}>
                <Form.Item name="watt" label="Watt">
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Contoh: 10"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="harga_beli"
                  label="Harga Beli"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={0}
                    formatter={(val) =>
                      `Rp ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(val) => val.replace(/\Rp\s?|(,*)/g, "")}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="stok_saat_ini"
                  label="Stok Saat Ini"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="stok_minimum" label="Stok Minimum">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="terjual_online" label="Terjual Online">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="terjual_offline" label="Terjual Offline">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="tanggal_barang" label="Tanggal Pembelian">
                  <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="keterangan" label="Keterangan">
              <Input.TextArea rows={3} placeholder="Catatan tambahan..." />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}
