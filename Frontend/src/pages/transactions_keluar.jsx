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
  Select,
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

// ============ CONFIG =======================================
const API_BASE_URL = "http://localhost:5000";
const ENDPOINT = "/transactions-keluar/";
const BARANG_ENDPOINT = "/barang/";
const USERS_ENDPOINT = "/users/";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// ===========================================================

export default function TransactionsKeluar() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form] = Form.useForm();

  const [barangOptions, setBarangOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  // ===========================================================
  // LOAD TABLE DATA
  // ===========================================================
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await API.get(ENDPOINT);
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
      message.success("Data transaksi keluar berhasil dimuat");
    } catch (err) {
      if (err.response?.status === 404) {
        setData([]);
        message.info("Tidak ada transaksi keluar ditemukan");
      } else {
        message.error("Gagal mengambil data transaksi keluar");
      }
    } finally {
      setLoading(false);
    }
  };

  // ===========================================================
  // LOAD DROPDOWN DATA
  // ===========================================================
  const loadDropdownData = async () => {
    try {
      const barangRes = await API.get(BARANG_ENDPOINT);
      setBarangOptions(Array.isArray(barangRes.data?.data) ? barangRes.data.data : []);

      const userRes = await API.get(USERS_ENDPOINT);
      setUserOptions(Array.isArray(userRes.data?.data) ? userRes.data.data : []);

    } catch (err) {
      message.error("Gagal memuat dropdown Barang/User");
    }
  };

  useEffect(() => {
    loadData();
    loadDropdownData();
  }, []);

  // ===========================================================
  // SUBMIT FORM
  // ===========================================================
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        jumlah: values.jumlah || 0,
        barang_id: values.barang_id,
        user_id: values.user_id,
        tanggal_keluar: values.tanggal_keluar
          ? values.tanggal_keluar.format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
      };

      if (editItem) {
        await API.put(`${ENDPOINT}${editItem.trans_keluar_id}`, payload);
        message.success("Transaksi keluar berhasil diperbarui");
      } else {
        await API.post(ENDPOINT, payload);
        message.success("Transaksi keluar berhasil ditambahkan");
      }

      setOpen(false);
      setEditItem(null);
      form.resetFields();
      loadData();

    } catch (error) {
      message.error("Gagal menyimpan transaksi keluar");
    }
  };

  // ===========================================================
  // DELETE
  // ===========================================================
  const handleDelete = (id, name) => {
    Modal.confirm({
      title: "Hapus Transactions Keluar",
      content: `Yakin hapus transaksi keluar dari "${name}"?`,
      okText: "Hapus",
      okType: "danger",

      async onOk() {
        try {
          setData((prev) =>
            prev.filter((item) => item.trans_keluar_id !== Number(id))
          );

          await API.delete(`${ENDPOINT}${Number(id)}`);
          message.success("Transaksi keluar berhasil dihapus");
          loadData();
        } catch (err) {
          message.error("Tidak dapat menghapus transaksi keluar");
        }
      },
    });
  };

  // ===========================================================
  // SHOW MODAL
  // ===========================================================
  const showModal = (item = null) => {
    setEditItem(item);
    if (item) {
      form.setFieldsValue({
        ...item,
        barang_id: item.barang_id,
        user_id: item.user_id,
        tanggal_keluar: item.tanggal_keluar ? dayjs(item.tanggal_keluar) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        barang_id: barangOptions[0]?.barang_id || null,
        user_id: userOptions[0]?.user_id || null,
        jumlah: 1,
        tanggal_keluar: dayjs(),
      });
    }
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
    setEditItem(null);
    form.resetFields();
  };

  // ===========================================================
  // TABLE COLUMNS
  // ===========================================================
  const columns = [
    {
      title: "ID",
      dataIndex: "trans_keluar_id",
      key: "trans_keluar_id",
      width: 60,
      align: "center",
      fixed: "left",
    },
    {
      title: "Tanggal Keluar",
      dataIndex: "tanggal_keluar",
      key: "tanggal_keluar",
      width: 120,
      render: (text) => (text ? dayjs(text).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Tujuan",
      dataIndex: "nama_supplier",
      key: "nama_supplier",
      width: 180,
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
      render: (text) => <Tag color="red">{Number(text).toLocaleString("id-ID")}</Tag>,
    },
    {
      title: "Dicatat Oleh",
      dataIndex: "nama_user",
      key: "nama_user",
      width: 150,
      render: (text) => (
        <Space>
          <UserOutlined /> {text}
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
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() =>
              handleDelete(record.trans_keluar_id, record.nama_supplier)
            }
          />
        </Space>
      ),
    },
  ];

  // ===========================================================
  // RENDER UI
  // ===========================================================
  return (
    <div style={{ padding: 24, minHeight: "100vh", background: "#f0f2f5" }}>
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Title level={2} style={{ borderBottom: "1px solid #eee", paddingBottom: 16 }}>
          <ContainerOutlined /> Manajemen Transactions Keluar
        </Title>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => showModal()}
          >
            Tambah Transactions Keluar
          </Button>

          <Button icon={<ReloadOutlined />} size="large" loading={loading} onClick={loadData}>
            Refresh Data
          </Button>
        </div>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="trans_keluar_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1300 }}
          bordered
        />

        {/* MODAL */}
        <Modal
          title={editItem ? "Edit Transactions Keluar" : "Tambah Transactions Keluar"}
          open={open}
          onCancel={handleCancel}
          onOk={handleSubmit}
          okText="Simpan"
          cancelText="Batal"
          width={700}
        >
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="nama_supplier"
                  label="Tujuan"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Contoh: Customer / Departemen" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="tanggal_keluar" label="Tanggal Keluar">
                  <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="barang_id"
                  label="Pilih Barang"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Pilih Barang"
                    options={barangOptions.map((b) => ({
                      value: b.barang_id,
                      label: `${b.nama_barang} (ID: ${b.barang_id})`,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="user_id"
                  label="Dicatat Oleh"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Pilih Pencatat"
                    options={userOptions.map((u) => ({
                      value: u.user_id,
                      label: `${u.nama} (ID: ${u.user_id})`,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="jumlah"
                  label="Jumlah Keluar"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="keterangan" label="Keterangan">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}
