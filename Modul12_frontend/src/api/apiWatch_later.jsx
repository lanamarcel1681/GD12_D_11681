import useAxios from ".";
// Mendapatkan semua content user yang sedang login
export const GetMyWatch_later = async () => {
    const id = JSON.parse(sessionStorage.getItem("user")).id;
        try {
            const response = await useAxios.get(`/watch_later/user/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            });
        return response.data.data;
    } catch (error) {
        throw error.response.data;
    }
};
// Membuat Watch_later baru
export const CreateWatch_later = async (data) => {
    try {
        const response = await useAxios.post("/watch_later", data, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (error) {
        // Tambahkan penanganan error yang lebih spesifik
        if (error.response) {
            // Error dari server dengan response
            if (error.response.status === 409) {
                // Konflik spesifik (misalnya data sudah ada)
                throw {
                    status: 409,
                    message: error.response.data.message || "Video sudah ada di Watch Later"
                };
            } else if (error.response.status === 403){
                throw {
                    status: 403,
                    message: error.response.data.message || "Can't add your content to watch later"
                };
            }  else {
                // Error server lainnya
                throw {
                    status: error.response.status,
                    message: error.response.data.message || "Terjadi kesalahan saat menambahkan video"
                };
            }
        } 
    }
};
// hapus Watch_later baru
export const DeleteWatch_later = async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
        const response = await useAxios.delete(`/watch_later/${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};