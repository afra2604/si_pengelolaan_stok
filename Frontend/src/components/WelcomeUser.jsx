import { Card, Row, Col, Button, Typography } from "antd";
import dashboardImg from "../assets/dashboard.png";

const { Title, Paragraph } = Typography;

const WelcomeUser = () => {
  return (
    <Card
      className="relative overflow-hidden bg-zinc-900 rounded-md mb-5 border-none"
      bodyStyle={{ padding: "24px" }}
    >
      <Row align="middle" gutter={24} className="relative z-10">
        <Col xs={24} lg={16}>
          <Title level={4} className="!text-white !mb-3">
            Welcome Ara
          </Title>

          <Paragraph className="!text-white/70 !text-sm !mb-5">
            Bagian pengolahan stok berfungsi untuk memberikan gambaran jelas
            tentang kondisi persediaan di gudang. Di sini, tim operasional bisa
            memantau pergerakan barang, melihat kebutuhan restock, dan
            memastikan proses keluar–masuk stok berjalan akurat dan efisien
            setiap saat.
          </Paragraph>

          <Button type="primary">Take a Product</Button>
        </Col>

        <Col xs={0} lg={8} className="flex justify-end">
          <img
            src={dashboardImg}
            alt="dashboard"
            className="h-40"
            width={160}
            height={160}
          />
        </Col>
      </Row>

      {/* Background SVG */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {/* SVG lo tetap sama */}
      </div>
    </Card>
  );
};

export default WelcomeUser;