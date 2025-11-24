import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message } from "antd";
import API from "../services/api";
export default function Barang() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form] = Form.useForm();

  // Fetch data
  const loadData = () => {
    API.get("/barang")
      .then((res) => setData(res.data))
      .catch(() => message.error("Gagal mengambil data"));
  };
  useEffect(() => {
    loadData();
  }, []);  

  // Save create/update
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editItem) {
        // UPDATE
        API.put(`/barang/${editItem.barang_id}`, values)
          .then(() => {
            message.success("Berhasil diperbarui!");
            setOpen(false);
            loadData();
          })
          .catch(() => message.error("Gagal memperbarui data"));
      } else {
        // CREATE
        API.post("/barang", values)
          .then(() => {
            message.success("Berhasil ditambahkan!");
            setOpen(false);
            loadData();
          })
          .catch(() => message.error("Gagal menambah data"));
      }
    });
  };

  // DELETE
  const deleteBarang = (id) => {
    Modal.confirm({
      title: "Hapus barang?",
      onOk: () => {
        API.delete(`/barang/${id}`)
          .then(() => {
            message.success("Berhasil dihapus!");
            loadData();
          })
          .catch(() => message.error("Gagal menghapus"));
      }
    });
  };

  // Table columns
  const columns = [
    { title: "Nama", dataIndex: "nama_barang" },
    { title: "Stok", dataIndex: "stok_saat_ini" },
    { title: "Minimum", dataIndex: "stok_minimum" },
    { title: "Harga Beli", dataIndex: "harga_beli" },
    {
      title: "Aksi",
      render: (_, row) => (
        <>
          <Button
            type="primary"
            onClick={() => {
              setEditItem(row);
              form.setFieldsValue(row);
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
      <h2>Data Barang</h2>

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
      {/* FORM MODAL */}
      <Modal
        title={editItem ? "Edit Barang" : "Tambah Barang"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="nama_barang" label="Nama Barang" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="stok_saat_ini" label="Stok Saat Ini" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="stok_minimum" label="Stok Minimum" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="harga_beli" label="Harga Beli" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
