import {
  Container,
  Card,
  Stack,
  Button,
  Spinner,
  Alert,
  Modal,
} from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { GetMyWatch_later, DeleteWatch_later } from "../api/apiWatch_later";
import { getThumbnail } from "../api";

const WatchLaterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [watchLater, setWatchLater] = useState([]);
  const [isPending, setIsPending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchWatchLater = () => {
    setIsLoading(true);
    GetMyWatch_later()
      .then((response) => {
        setWatchLater(response);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  const deleteWatchLater = (id) => {
    setIsPending(true);
    DeleteWatch_later(id)
      .then((response) => {
        toast.success(response.message);
        fetchWatchLater();
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message);
      })
      .finally(() => {
        setIsPending(false);
        setShowModal(false); // Tutup modal setelah selesai
      });
  };

  useEffect(() => {
    fetchWatchLater();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowModal(true); // Tampilkan modal konfirmasi
  };

  const handleConfirmDelete = () => {
    if (selectedId) {
      deleteWatchLater(selectedId);
    }
  };

  return (
    <Container className="mt-4">
      <Stack direction="horizontal" gap={3} className="mb-3">
        <h1 className="h4 fw-bold mb-0 text-nowrap text-light">
          Watch Later Videos
        </h1>
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
      ) : watchLater?.length > 0 ? (
        <div>
          {watchLater.map((item) => (
            <Card
              key={item.id}
              className="mb-3 d-flex flex-row bg-dark text-light"
            >
              {/* Thumbnail Section */}
              <div className="p-2">
                <img
                  src={getThumbnail(item.content.thumbnail)}
                  alt="Thumbnail"
                  style={{
                    width: "250px",
                    height: "200px",
                    borderRadius: "5px",
                    objectFit: "cover",
                  }}
                />
              </div>

              {/* Content Section */}
              <div className="p-3 flex-grow-1">
                <h5>{item.content.title}</h5>
                <p>{item.content.description}</p>
              </div>

              {/* Action Section */}
              <div className="d-flex flex-column align-items-end p-3">
                {/* Date Added */}
                <small className="text-muted mb-2">
                  Tanggal Ditambahkan: {formatDate(item.date_added)}
                </small>

                {/* Delete Button */}
                <Button
                  variant="danger"
                  onClick={() => handleDeleteClick(item.id)}
                  disabled={isPending}
                >
                  <FaTrash className="mx-1 mb-1" />
                  Hapus
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Alert variant="dark" className="mt-3 text-center">
          Belum ada video, yuk tambah video baru!
        </Alert>
      )}

      {/* Modal Confirmation */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body>
          Apakah Anda yakin ingin menghapus video ini dari Watch Later?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            disabled={isPending}
          >
            {isPending ? (
              <Spinner
                as="span"
                animation="grow"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              "Hapus"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default WatchLaterPage;
