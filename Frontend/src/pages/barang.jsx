import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  message,
} from "antd";
import dayjs from "dayjs";
import API from "../services/api";

export default function Barang() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form] = Form.useForm();


  const loadData = () => {
    API.get("/barang")
      .then((res) => {
        setData(res.data.data || []);
      })
      .catch(() => {
        message.error("Gagal mengambil data barang");
      });
  };

  useEffect(() => {
    loadData();
  }, []);


  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload = {
        ...values,
        watt: values.watt || 0,
        stok_saat_ini: values.stok_saat_ini || 0,
        stok_minimum: values.stok_minimum || 0,
        terjual_online: values.terjual_online || 0,
        terjual_offline: values.terjual_offline || 0,
        tanggal_barang: values.tanggal_barang
          ? values.tanggal_barang.format("YYYY-MM-DD")
          : null,
      };

      const request = editItem
        ? API.put(`/barang/${editItem.barang_id}`, payload)
        : API.post("/barang", payload);

      request
        .then((res) => {
          message.success(res.data.message || "Berhasil disimpan");
          setOpen(false);
          form.resetFields();
          setEditItem(null);
          loadData();
        })
        .catch((err) => {
          message.error(
            err.response?.data?.error ||
              "Terjadi kesalahan saat menyimpan data"
          );
        });
    });
  };


  const deleteBarang = (id) => {
    Modal.confirm({
      title: "Hapus Barang?",
      content: "Data yang dihapus tidak bisa dikembalikan.",
      okText: "Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk: () => {
        API.delete(`/barang/${id}`)
          .then((res) => {
            message.success(res.data.message || "Berhasil dihapus");
            loadData();
          })
          .catch(() => {
            message.error("Gagal menghapus data");
          });
      },
    });
  };


  const columns = [
    { title: "Nama", dataIndex: "nama_barang" },
    { title: "Kategori", dataIndex: "kategori" },
    { title: "Jenis", dataIndex: "jenis_barang" },
    { title: "Watt", dataIndex: "watt" },
    { title: "Harga Beli", dataIndex: "harga_beli" },
    { title: "Stok", dataIndex: "stok_saat_ini" },
    { title: "Min", dataIndex: "stok_minimum" },
    { title: "Online", dataIndex: "terjual_online" },
    { title: "Offline", dataIndex: "terjual_offline" },
    {
      title: "Tanggal",
      dataIndex: "tanggal_barang",
      render: (v) =>
        v ? dayjs(v).format("DD-MM-YYYY") : "-",
    },
    {
      title: "Aksi",
      render: (_, row) => (
        <>
          <Button
            type="primary"
            onClick={() => {
              setEditItem(row);
              form.setFieldsValue({
                ...row,
                tanggal_barang: row.tanggal_barang
                  ? dayjs(row.tanggal_barang)
                  : null,
              });
              setOpen(true);
            }}
            style={{ marginRight: 10 }}
          >
            Edit
          </Button>

          <Button danger onClick={() => deleteBarang(row.barang_id)}>
            Hapus
          </Button>
        </>
      ),
    },
  ];


  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Data Barang</h2>

      <Button
        type="primary"
        style={{ marginBottom: 20 }}
        onClick={() => {
          setEditItem(null);
          form.resetFields();
          setOpen(true);
        }}
      >
        Tambah Barang
      </Button>

      <Table columns={columns} dataSource={data} rowKey="barang_id" />

      {/* Modal Form */}
      <Modal
        title={editItem ? "Edit Barang" : "Tambah Barang"}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditItem(null);
          form.resetFields();
        }}
        onOk={handleSubmit}
        okText="Simpan"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nama_barang"
            label="Nama Barang"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="kategori" label="Kategori">
            <Input />
          </Form.Item>

          <Form.Item name="jenis_barang" label="Jenis Barang">
            <Input />
          </Form.Item>

          <Form.Item name="watt" label="Watt">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="harga_beli"
            label="Harga Beli"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="stok_saat_ini"
            label="Stok Saat Ini"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="stok_minimum"
            label="Stok Minimum"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="terjual_online" label="Terjual Online">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="terjual_offline" label="Terjual Offline">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="tanggal_barang" label="Tanggal Barang">
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="keterangan" label="Keterangan">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
