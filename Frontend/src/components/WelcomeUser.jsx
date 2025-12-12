import { Card, Row, Col, Button, Typography } from "antd";
import { useEffect, useState, useMemo, use } from "react";
import { getHours} from 'date-fns';

const { Title, Paragraph } = Typography;

const getGreeting = () => {
  const hour = getHours(new Date());
  if (hour < 11) return "Selamat Pagi";
  if (hour < 18) return "Selamat Siang";
  return "Selamat Malam";
};

const WelcomeUser = () => {

  const [greeting,  setGreeting] = useState('');
  const [rawUserName, setRawUserName] = useState ('Guest');

  useEffect(() => {
    setGreeting(getGreeting());
    const storedUserString = localStorage.getItem('user');

    if (storedUserString) {
      try {
        const userData = JSON.parse(storedUserString);

        if (userData && userData.nama){
          setRawUserName(userData.nama);
        }
      } catch (e){
        console.error("Gagal parse user data dari localStorage: ", e);
      }
    }
  }, []);

  const formattedName = useMemo(() => {
    return rawUserName.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }, [rawUserName]);

  return (
    <Card
      className="relative overflow-hidden rounded-lg mb-5 border-none shadow-xl"
      style={{
        backgroundColor:'#d6e6ff',
        color: '#1f1f1f'
      }}
      bodyStyle={{ padding: "24px" }}
    >
      <Row align="middle" gutter={24} className="relative z-10">
        <Col xs={24}>
          <Title 
            level={4} 
            className="!mb-2 !font-semibold"
            style={{color: '#001f3f'}}
            >
            {greeting}, {formattedName}
          </Title>

          <Paragraph
              style={{color: '#001f3f99'}}
              className="!text-sm !mb-0"
          >
            Bagian pengolahan stok berfungsi untuk memberikan gambaran jelas
            tentang kondisi persediaan di gudang. Di sini, tim operasional bisa
            memantau pergerakan barang, melihat kebutuhan restock, dan
            memastikan proses keluar–masuk stok berjalan akurat dan efisien
            setiap saat.
          </Paragraph>
        </Col>
      </Row>
    </Card>
  );
};

export default WelcomeUser;