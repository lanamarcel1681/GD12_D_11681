import { useEffect, useState } from "react";
import {
  Alert,
  Col,
  Container,
  Row,
  Spinner,
  Stack,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { GetAllContents } from "../api/apiContent";
import { CreateWatch_later } from "../api/apiWatch_later"; // Gunakan fungsi CreateWatch_later
import { getThumbnail } from "../api";
import { FaRegClock } from "react-icons/fa";

const DashboardPage = () => {
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingActions, setPendingActions] = useState({});

  useEffect(() => {
    setIsLoading(true);
    GetAllContents()
      .then((data) => {
        setContents(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Gagal memuat konten");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleAddToWatchLater = (contentId) => {
    if (pendingActions[contentId]) return;

    setPendingActions(prev => ({
      ...prev,
      [contentId]: true
    }));

    const formData = new FormData();
    formData.append('id_content', contentId);

    CreateWatch_later(formData)
      .then((response) => {
        // Berhasil ditambahkan
        toast.success(response.message || "Video berhasil ditambahkan ke Watch Later");
      })
      .catch((error) => {
        // Tangani error dari throw
        if (error.status === 409) {
          // Khusus konflik (data sudah ada)
          toast.warning(error.message);
        }else if (error.status === 403) {
          toast.warning(error.message);
        }else {
          // Error lainnya
          toast.error(error.message);
        }
        
        // Optional: logging error
        console.error('Error adding to watch later:', error);
      })
      .finally(() => {
        // Reset state pending
        setPendingActions(prev => ({
          ...prev,
          [contentId]: false
        }));
      });
  };
  
  return (
    <Container className="mt-4">
      <Stack direction="horizontal" gap={3} className="mb-3">
        <h1 className="h4 fw-bold mb-0 text-nowrap text-light">Rekomendasi Untukmu</h1>
        <hr className="border-top border-light opacity-50 w-100" />
      </Stack>

      {isLoading ? (
        <div className="text-center">
          <Spinner
            as="span"
            animation="border"
            variant="primary"
            size="lg"
            role="status"
            aria-hidden="true"
          />
          <h6 className="mt-2 mb-0">Loading...</h6>
        </div>
      ) : contents?.length > 0 ? (
        <Row>
          {contents.map((content) => (
            <Col md={6} lg={4} className="mb-3" key={content.id}>
              <div
                className="card text-white"
                style={{ aspectRatio: "16 / 9" }}
              >
                <img
                  src={getThumbnail(content.thumbnail)}
                  className="card-img w-100 h-100 object-fit-cover bg-light"
                  alt="Thumbnail"
                />
                <div className="card-body">
                  <h5 className="card-title text-truncate">
                    {content.title}
                  </h5>
                  <p className="card-text">{content.description}</p>
                </div>
                <button
                  className="btn btn-success position-absolute bottom-0 end-0 m-2 rounded d-flex align-items-center justify-content-center"
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                  }}
                  onClick={() => handleAddToWatchLater(content.id)}
                  disabled={pendingActions[content.id]}
                  title="Tambahkan ke Watch Later"
                >
                  {pendingActions[content.id] ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    <FaRegClock />
                  )}
                </button>
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="dark" className="text-center">
          Tidak ada video untukmu saat ini ☹️
        </Alert>
      )}
    </Container>
  );
};

export default DashboardPage;